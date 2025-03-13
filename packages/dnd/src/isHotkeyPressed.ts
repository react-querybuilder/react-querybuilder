/**
 * Adapted from
 * https://github.com/JohannesKlauss/react-hotkeys-hook/blob/bc55a281f1d212d09de786aeb5cd236c58d9531d/src/isHotkeyPressed.ts
 * and
 * https://github.com/JohannesKlauss/react-hotkeys-hook/blob/bc55a281f1d212d09de786aeb5cd236c58d9531d/src/parseHotkey.ts
 */

type ModifierKey = 'shift' | 'alt' | 'meta' | 'mod' | 'ctrl';

// #region parseHotkey.ts
const reservedModifierKeywords = new Set<ModifierKey>(['shift', 'alt', 'meta', 'mod', 'ctrl']);

const mappedKeys: Record<string, string> = {
  esc: 'escape',
  return: 'enter',
  '.': 'period',
  ',': 'comma',
  '-': 'slash',
  ' ': 'space',
  '`': 'backquote',
  '#': 'backslash',
  '+': 'bracketright',
  ShiftLeft: 'shift',
  ShiftRight: 'shift',
  AltLeft: 'alt',
  AltRight: 'alt',
  MetaLeft: 'meta',
  MetaRight: 'meta',
  OSLeft: 'meta',
  OSRight: 'meta',
  ControlLeft: 'ctrl',
  ControlRight: 'ctrl',
};

const mapKey = (key?: string) =>
  ((key && mappedKeys[key]) || key || '')
    .trim()
    .toLowerCase()
    .replace(/key|digit|numpad|arrow/, '');

const isHotkeyModifier = (key: string) => reservedModifierKeywords.has(key as ModifierKey);
// #endregion parseHotkey.ts

const keyAliases: Record<string, string> = {
  '⌘': 'meta',
  cmd: 'meta',
  command: 'meta',
  '⊞': 'meta',
  win: 'meta',
  windows: 'meta',
  '⇧': 'shift',
  '⌥': 'alt',
  '⌃': 'ctrl',
  control: 'ctrl',
};

// #region isHotkeyPressed.ts
(() => {
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', e => {
      if (e.key === undefined) {
        // Synthetic event (e.g., Chrome autofill).  Ignore.
        return;
      }

      pushToCurrentlyPressedKeys([mapKey(e.key), mapKey(e.code)]);
    });

    document.addEventListener('keyup', e => {
      if (e.key === undefined) {
        // Synthetic event (e.g., Chrome autofill).  Ignore.
        return;
      }

      removeFromCurrentlyPressedKeys([mapKey(e.key), mapKey(e.code)]);
    });
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('blur', () => {
      currentlyPressedKeys.clear();
    });
  }
})();

const currentlyPressedKeys: Set<string> = new Set<string>();

// https://github.com/microsoft/TypeScript/issues/17002
const isReadonlyArray = (value: unknown): value is readonly unknown[] => Array.isArray(value);

export const isHotkeyPressed = (key: string | readonly string[], splitKey = ','): boolean =>
  (isReadonlyArray(key) ? key : key.split(splitKey)).every(hotkey => {
    const hk = hotkey.trim().toLowerCase();
    return currentlyPressedKeys.has(keyAliases[hk] ?? hk);
  });

const pushToCurrentlyPressedKeys = (key: string | string[]) => {
  const hotkeyArray = Array.isArray(key) ? key : [key];

  /*
  Due to a weird behavior on macOS we need to clear the set if the user pressed down the meta key and presses another key.
  https://stackoverflow.com/questions/11818637/why-does-javascript-drop-keyup-events-when-the-metakey-is-pressed-on-mac-browser
  Otherwise the set will hold all ever pressed keys while the meta key is down which leads to wrong results.
   */
  if (currentlyPressedKeys.has('meta')) {
    for (const key of currentlyPressedKeys) {
      if (!isHotkeyModifier(key)) {
        currentlyPressedKeys.delete(key.toLowerCase());
      }
    }
  }

  for (const hotkey of hotkeyArray) currentlyPressedKeys.add(hotkey.toLowerCase());
};

const removeFromCurrentlyPressedKeys = (key: string | string[]) => {
  const hotkeyArray = Array.isArray(key) ? key : [key];

  /*
  Due to a weird behavior on macOS we need to clear the set if the user pressed down the meta key and presses another key.
  https://stackoverflow.com/questions/11818637/why-does-javascript-drop-keyup-events-when-the-metakey-is-pressed-on-mac-browser
  Otherwise the set will hold all ever pressed keys while the meta key is down which leads to wrong results.
   */
  if (key === 'meta') {
    currentlyPressedKeys.clear();
  } else {
    for (const hotkey of hotkeyArray) currentlyPressedKeys.delete(hotkey.toLowerCase());
  }
};
// #endregion isHotkeyPressed.ts
