import type { DropEffect, Writable } from 'react-querybuilder';

type ModifierKeyMap = Pick<KeyboardEvent, 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'>;
type WritableModifierKeyMap = Writable<ModifierKeyMap>;

const noKeysPressed = {
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
} satisfies ModifierKeyMap;

let keysPressed: WritableModifierKeyMap = { ...noKeysPressed };

export const getDropEffect = (): DropEffect => (keysPressed.altKey ? 'copy' : 'move');
export const getGroupItemsFlag = (): boolean => keysPressed.ctrlKey;

const eventHandler = (e: KeyboardEvent | MouseEvent) => {
  keysPressed.altKey = e.altKey;
  keysPressed.ctrlKey = e.ctrlKey;
  keysPressed.metaKey = e.metaKey;
  keysPressed.shiftKey = e.shiftKey;
};

if (typeof document !== 'undefined') {
  document.addEventListener('keydown', eventHandler);
  document.addEventListener('keyup', eventHandler);
  document.addEventListener('mousedown', eventHandler);
  document.addEventListener('mouseup', eventHandler);
}

if (typeof window !== 'undefined') {
  window.addEventListener('blur', () => {
    keysPressed = { ...noKeysPressed };
  });
}
