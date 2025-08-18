/**
 * Utility functions for DnD adapters
 */

/**
 * Generates a unique identifier for drag/drop monitors
 */
export function generateId(): string | symbol {
  return Symbol('dnd-monitor-id');
}

/**
 * Detects if the current device supports touch interactions
 */
export function isTouchDevice(): boolean {
  // oxlint-disable-next-line prefer-global-this
  if (typeof window === 'undefined') return false;

  return (
    // oxlint-disable-next-line prefer-global-this
    'ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)
  );
}

/**
 * Checks if a modifier key is currently pressed
 * This is a simplified implementation - in practice, adapters should track key states
 */
export function isHotkeyPressed(key?: string): boolean {
  // oxlint-disable-next-line prefer-global-this
  if (!key || typeof window === 'undefined') return false;

  const keyMap: Record<string, string> = {
    alt: 'altKey',
    ctrl: 'ctrlKey',
    meta: 'metaKey',
    shift: 'shiftKey',
  };

  const eventKey = keyMap[key.toLowerCase()];
  if (!eventKey) return false;

  // This is a simplified check - in practice, we'd need to track key states
  // Each adapter implementation should handle this properly based on their library's capabilities
  return false;
}
