export const isTouchDevice = (): boolean => !!window?.ontouchstart || navigator?.maxTouchPoints > 0;
