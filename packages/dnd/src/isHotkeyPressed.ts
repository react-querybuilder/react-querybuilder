/**
 * Adapted from
 * https://github.com/JohannesKlauss/react-hotkeys-hook/blob/bc55a281f1d212d09de786aeb5cd236c58d9531d/src/isHotkeyPressed.ts
 * and
 * https://github.com/JohannesKlauss/react-hotkeys-hook/blob/bc55a281f1d212d09de786aeb5cd236c58d9531d/src/parseHotkey.ts
 */

// #region parseHotkey.ts
const reservedModifierKeywords = new Set(['shift', 'alt', 'meta', 'mod', 'ctrl']);

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

function mapKey(key?: string): string {
  return ((key && mappedKeys[key]) || key || '')
    .trim()
    .toLowerCase()
    .replace(/key|digit|numpad|arrow/, '');
}

function isHotkeyModifier(key: string): boolean {
  return reservedModifierKeywords.has(key);
}
// #endregion parseHotkey.ts

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
function isReadonlyArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

export function isHotkeyPressed(key: string | readonly string[], splitKey = ','): boolean {
  const hotkeyArray = isReadonlyArray(key) ? key : key.split(splitKey);

  return hotkeyArray.every(hotkey => currentlyPressedKeys.has(hotkey.trim().toLowerCase()));
}

function pushToCurrentlyPressedKeys(key: string | string[]): void {
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
}

function removeFromCurrentlyPressedKeys(key: string | string[]): void {
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
}
// #endregion isHotkeyPressed.ts
