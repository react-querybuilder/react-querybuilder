// oxlint-disable no-explicit-any

/**
 * `@hello-pangea/dnd` adapter for the DnD abstraction layer
 */

import React, { useCallback, useEffect, useState } from 'react';
import type {
  DndAdapter,
  DndProviderProps,
  DragHookOptions,
  DragHookResult,
  DropHookOptions,
  DropHookResult,
} from '../types';
import { generateId, isTouchDevice } from '../utils';

// Dynamic import for @hello-pangea/dnd
let pangeaDnd: any = null;

async function loadPangeaDnd() {
  if (pangeaDnd) return pangeaDnd;

  try {
    pangeaDnd = await import('@hello-pangea/dnd');
    return pangeaDnd;
  } catch {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error(
        'Failed to load @hello-pangea/dnd. Make sure @hello-pangea/dnd is installed.'
      );
    }
    // Return mock for tests
    return {
      DragDropContext: ({ children }: any) => children,
    };
  }
}

let adapterLoaded = false;

async function initializeHelloPangeaDndAdapter(): Promise<void> {
  if (!adapterLoaded) {
    await loadPangeaDnd();
    adapterLoaded = true;
  }
}

function useDrag(options: DragHookOptions): DragHookResult {
  const [isDragging] = useState(false);
  const dragMonitorId = React.useMemo(() => generateId(), []);

  const dragRef = useCallback(
    (element: HTMLElement | null) => {
      if (element) {
        element.setAttribute('data-rqb-draggable', 'true');
        element.setAttribute('data-drag-type', options.type);
        element.setAttribute('data-drag-monitor-id', String(dragMonitorId));
      }
    },
    [dragMonitorId, options.type]
  );

  const previewRef = useCallback(
    (element: HTMLElement | null) => {
      // @hello-pangea/dnd doesn't have separate preview refs
      return dragRef(element);
    },
    [dragRef]
  );

  return {
    isDragging,
    dragMonitorId,
    dragRef,
    previewRef,
  };
}

function useDrop(options: DropHookOptions): DropHookResult {
  const [isOver] = useState(false);
  const [dropEffect, setDropEffect] = useState<'copy' | 'move'>('move');
  const [groupItems, setGroupItems] = useState(false);
  const dropMonitorId = React.useMemo(() => generateId(), []);

  const dropRef = useCallback(
    (element: HTMLElement | null) => {
      if (element) {
        element.setAttribute('data-rqb-droppable', 'true');
        element.setAttribute('data-drop-accept', options.accept.join(','));
        element.setAttribute('data-drop-monitor-id', String(dropMonitorId));
      }
    },
    [dropMonitorId, options.accept]
  );

  // Listen for keyboard events to update modifier states
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        options.modifierKeys?.copyModeKey &&
        e.key.toLowerCase() === options.modifierKeys.copyModeKey
      ) {
        setDropEffect('copy');
      }
      if (
        options.modifierKeys?.groupModeKey &&
        e.key.toLowerCase() === options.modifierKeys.groupModeKey
      ) {
        setGroupItems(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        options.modifierKeys?.copyModeKey &&
        e.key.toLowerCase() === options.modifierKeys.copyModeKey
      ) {
        setDropEffect('move');
      }
      if (
        options.modifierKeys?.groupModeKey &&
        e.key.toLowerCase() === options.modifierKeys.groupModeKey
      ) {
        setGroupItems(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [options.modifierKeys]);

  return {
    isOver,
    dropMonitorId,
    dropEffect,
    groupItems,
    dropRef,
  };
}

const handleDragEnd = (result: any) => {
  // Handle drag end logic here
  // This would need to be connected to the query builder's drop logic
  console.log('Drag ended:', result);
};

const DndProvider: React.ComponentType<DndProviderProps> = ({ children }) => {
  if (!pangeaDnd) {
    throw new Error('@hello-pangea/dnd not loaded. Ensure the adapter is initialized first.');
  }

  return React.createElement(pangeaDnd.DragDropContext, { onDragEnd: handleDragEnd }, children);
};

/**
 * Hello Pangea DnD adapter instance
 */
export const helloPangeaDndAdapter: DndAdapter = {
  useDrag,
  useDrop,
  DndProvider,
  isTouchDevice,
  initialize: initializeHelloPangeaDndAdapter,
};
