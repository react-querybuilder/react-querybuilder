/* v8 ignore file -- @preserve */
/* oxlint-disable prefer-global-this */

export const isTouchDevice = (): boolean =>
  (typeof window !== 'undefined' && 'ontouchstart' in window) ||
  (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
