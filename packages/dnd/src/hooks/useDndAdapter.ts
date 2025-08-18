/**
 * Hooks for working with the DnD adapter
 */

import { useContext } from 'react';
import { QueryBuilderDndContext } from '../QueryBuilderDndContext';
import type {
  DragHookOptions,
  DropHookOptions,
  DragHookResult,
  DropHookResult,
  DndAdapter,
} from '../dnd-core/types';

/**
 * Hook to access the current DnD adapter
 */
export function useDndAdapter(): DndAdapter {
  const dndContext = useContext(QueryBuilderDndContext);
  
  if (!dndContext.adapter) {
    throw new Error(
      'DnD adapter not found in context. Make sure QueryBuilderDnD is properly configured.'
    );
  }

  return dndContext.adapter;
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
 * Check if DnD is currently enabled
 */
export function useDndEnabled(): boolean {
  const dndContext = useContext(QueryBuilderDndContext);
  return !!dndContext.adapter;
}
