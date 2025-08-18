// oxlint-disable no-explicit-any

/**
 * `@dnd-kit/core` adapter for the DnD abstraction layer
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  DndAdapter,
  DndProviderProps,
  DragHookOptions,
  DragHookResult,
  DropHookOptions,
  DropHookResult,
} from '../types';
import { generateId, isTouchDevice } from '../utils';

// Dynamic imports for @dnd-kit/core
let dndKitCore: unknown = null;
// let _dndKitUtilities: unknown = null;

async function loadDndKit() {
  if (dndKitCore) return dndKitCore;

  try {
    // oxlint-disable-next-line no-single-promise-in-promise-methods
    const [coreModule /*, utilitiesModule */] = await Promise.all([
      import('@dnd-kit/core'),
      // import('@dnd-kit/utilities').catch(() => null),
    ]);

    dndKitCore = coreModule;
    // _dndKitUtilities = utilitiesModule;

    return dndKitCore;
  } catch {
    throw new Error('Failed to load @dnd-kit/core. Make sure @dnd-kit/core is installed.');
  }
}

let adapterLoaded = false;

async function initializeDndKitAdapter(): Promise<void> {
  if (!adapterLoaded) {
    await loadDndKit();
    adapterLoaded = true;
  }
}

function useDrag(options: DragHookOptions): DragHookResult {
  if (!dndKitCore) {
    throw new Error('@dnd-kit/core not loaded. Ensure the adapter is initialized first.');
  }

  const [isDragging, setIsDragging] = useState(false);
  const dragMonitorId = useMemo(() => generateId(), []);

  const {
    listeners,
    setNodeRef,
    isDragging: kitIsDragging,
  } = (dndKitCore as any).useDraggable({
    id: String(dragMonitorId),
    data: options.item(),
    disabled: !options.canDrag,
  });

  useEffect(() => {
    setIsDragging(kitIsDragging);
  }, [kitIsDragging]);

  const dragRef = useCallback(
    (element: HTMLElement | null) => {
      setNodeRef(element);
      if (element && listeners) {
        Object.entries(listeners).forEach(([event, handler]) => {
          element.addEventListener(event, handler as EventListener);
        });
      }
    },
    [setNodeRef, listeners]
  );

  const previewRef = useCallback(
    (element: HTMLElement | null) => {
      // @dnd-kit doesn't have separate preview refs
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
  if (!dndKitCore) {
    throw new Error('@dnd-kit/core not loaded. Ensure the adapter is initialized first.');
  }

  const dropMonitorId = React.useMemo(() => generateId(), []);
  const [dropEffect, setDropEffect] = useState<'copy' | 'move'>('move');
  const [groupItems, setGroupItems] = useState(false);

  const { isOver, setNodeRef } = (dndKitCore as any).useDroppable({
    id: String(dropMonitorId),
    data: {
      accepts: options.accept,
    },
  });

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

  const dropRef = useCallback(
    (element: HTMLElement | null) => {
      setNodeRef(element);
    },
    [setNodeRef]
  );

  return {
    isOver,
    dropMonitorId,
    dropEffect,
    groupItems,
    dropRef,
  };
}

const handleDragEnd = (event: any) => {
  const { active, over } = event;

  if (over && active.id !== over.id) {
    // Handle the drop logic here
    console.log('Drag ended:', { active, over });
  }
};

const DndKitProvider: React.ComponentType<DndProviderProps> = ({ children }) => {
  if (!dndKitCore) {
    throw new Error('@dnd-kit/core not loaded. Call ensureLoaded() first.');
  }

  return React.createElement(
    (dndKitCore as any).DndContext,
    { onDragEnd: handleDragEnd },
    children
  );
};

/**
 * DnD Kit adapter instance
 */
export const dndKitAdapter: DndAdapter = {
  useDrag,
  useDrop,
  DndProvider: DndKitProvider,
  isTouchDevice,
  initialize: initializeDndKitAdapter,
};
