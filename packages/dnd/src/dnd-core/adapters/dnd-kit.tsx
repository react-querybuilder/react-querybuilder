/**
 * @dnd-kit/core adapter for the DnD abstraction layer
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  DndProviderProps,
  DragHookOptions,
  DragHookResult,
  DropHookOptions,
  DropHookResult,
} from '../types';
import { BaseDndAdapter } from './base';

// Dynamic imports for @dnd-kit/core
let dndKitCore: unknown = null;
let _dndKitUtilities: unknown = null;

async function loadDndKit() {
  if (dndKitCore) return dndKitCore;

  try {
    const [coreModule, utilitiesModule] = await Promise.all([
      import('@dnd-kit/core'),
      import('@dnd-kit/utilities').catch(() => null),
    ]);

    dndKitCore = coreModule;
    _dndKitUtilities = utilitiesModule;

    return dndKitCore;
  } catch {
    throw new Error('Failed to load @dnd-kit/core. Make sure @dnd-kit/core is installed.');
  }
}

export class DndKitAdapter extends BaseDndAdapter {
  private loaded = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async ensureLoaded(): Promise<any> {
    if (!this.loaded) {
      await loadDndKit();
      this.loaded = true;
    }
  }

  useDrag(options: DragHookOptions): DragHookResult {
    if (!dndKitCore) {
      throw new Error('@dnd-kit/core not loaded. Call ensureLoaded() first.');
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isDragging, setIsDragging] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const dragMonitorId = useMemo(() => this.generateId(), []);

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      isDragging: kitIsDragging,
    } = dndKitCore.useDraggable({
      id: String(dragMonitorId),
      data: options.item(),
      disabled: !options.canDrag,
    });

    useEffect(() => {
      setIsDragging(kitIsDragging);
    }, [kitIsDragging]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
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

  useDrop(options: DropHookOptions): DropHookResult {
    if (!dndKitCore) {
      throw new Error('@dnd-kit/core not loaded. Call ensureLoaded() first.');
    }

    const dropMonitorId = React.useMemo(() => this.generateId(), []);
    const [dropEffect, setDropEffect] = useState<'copy' | 'move'>('move');
    const [groupItems, setGroupItems] = useState(false);

    const { isOver, setNodeRef } = dndKitCore.useDroppable({
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

  getDefaultBackend(): any {
    // @dnd-kit doesn't use backends in the same way
    return null;
  }

  DndProvider: React.ComponentType<DndProviderProps> = ({ children }) => {
    if (!dndKitCore) {
      throw new Error('@dnd-kit/core not loaded. Call ensureLoaded() first.');
    }

    const handleDragEnd = (event: any) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        // Handle the drop logic here
        console.log('Drag ended:', { active, over });
      }
    };

    return React.createElement(dndKitCore.DndContext, { onDragEnd: handleDragEnd }, children);
  };
}

// Factory function for creating the adapter
export function createDndKitAdapter(): DndKitAdapter {
  return new DndKitAdapter();
}
