/**
 * Hooks for working with the DnD adapter
 */

import { useContext } from 'react';
import { dndManager } from '../dnd-core';
import { QueryBuilderDndContext } from '../QueryBuilderDndContext';
import type {
  DragHookOptions,
  DropHookOptions,
  DragHookResult,
  DropHookResult,
  DndAdapter,
  DndLibrary,
} from '../dnd-core/types';

/**
 * Hook to access the current DnD adapter
 */
export function useDndAdapter(): DndAdapter {
  if (!dndManager.isInitialized()) {
    throw new Error(
      'DnD manager not initialized. Make sure QueryBuilderDnD is properly configured.'
    );
  }

  return dndManager.getAdapter();
}

/**
 * Hook for drag functionality using the current adapter
 */
export function useDndDrag(options: DragHookOptions): DragHookResult {
  const adapter = useDndAdapter();
  const dndContext = useContext(QueryBuilderDndContext);

  const enhancedOptions = {
    ...options,
    // Add default modifier keys from context
    modifierKeys: {
      copyModeKey: dndContext.copyModeModifierKey || 'alt',
      groupModeKey: dndContext.groupModeModifierKey || 'ctrl',
      ...options.modifierKeys,
    },
  };

  // eslint-disable-next-line react-compiler/react-compiler
  return adapter.useDrag(enhancedOptions);
}

/**
 * Hook for drop functionality using the current adapter
 */
export function useDndDrop(options: DropHookOptions): DropHookResult {
  const adapter = useDndAdapter();
  const dndContext = useContext(QueryBuilderDndContext);

  const enhancedOptions = {
    ...options,
    // Add default modifier keys from context
    modifierKeys: {
      copyModeKey: dndContext.copyModeModifierKey || 'alt',
      groupModeKey: dndContext.groupModeModifierKey || 'ctrl',
      ...options.modifierKeys,
    },
  };

  // eslint-disable-next-line react-compiler/react-compiler
  return adapter.useDrop(enhancedOptions);
}

/**
 * Get the current DnD library being used
 */
export function useDndLibrary(): DndLibrary | null {
  return dndManager.getLibrary();
}

/**
 * Check if DnD is currently enabled and initialized
 */
export function useDndEnabled(): boolean {
  return dndManager.isInitialized();
}
