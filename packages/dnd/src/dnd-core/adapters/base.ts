/**
 * Base adapter interface and utilities for DnD libraries
 */

import type {
  DndAdapter,
  DragHookOptions,
  DropHookOptions,
  DragHookResult,
  DropHookResult,
  DndProviderProps,
} from '../types';

export abstract class BaseDndAdapter implements DndAdapter {
  abstract useDrag(options: DragHookOptions): DragHookResult;
  abstract useDrop(options: DropHookOptions): DropHookResult;
  abstract DndProvider: React.ComponentType<DndProviderProps>;

  protected generateId(): string | symbol {
    return Symbol('dnd-monitor-id');
  }

  isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;

    return (
      'ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)
    );
  }

  getDefaultBackend(): unknown {
    // To be overridden by specific adapters
    return null;
  }

  protected isHotkeyPressed(key?: string): boolean {
    if (!key || typeof window === 'undefined') return false;

    const keyMap: Record<string, string> = {
      alt: 'altKey',
      ctrl: 'ctrlKey',
      meta: 'metaKey',
      shift: 'shiftKey',
    };

    const eventKey = keyMap[key.toLowerCase()];
    if (!eventKey) return false;

    // Check if the key is currently pressed
    // This is a simplified check - in practice, we'd need to track key states
    return false;
  }
}

export function createDndAdapter(adapterClass: new () => BaseDndAdapter): DndAdapter {
  return new adapterClass();
}
