/**
 * @hello-pangea/dnd adapter for the DnD abstraction layer
 */

import React, { useCallback, useEffect, useState } from 'react';
import type { 
  DragHookOptions, 
  DropHookOptions, 
  DragHookResult, 
  DropHookResult,
  DndProviderProps,
  DraggedItem,
  DropResult
} from '../types';
import { BaseDndAdapter } from './base';

// Dynamic import for @hello-pangea/dnd
let pangeaDnd: any = null;

async function loadPangeaDnd() {
  if (pangeaDnd) return pangeaDnd;
  
  try {
    pangeaDnd = await import('@hello-pangea/dnd');
    return pangeaDnd;
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Failed to load @hello-pangea/dnd. Make sure @hello-pangea/dnd is installed.');
    }
    // Return mock for tests
    return {
      DragDropContext: ({ children }: any) => children,
    };
  }
}

export class HelloPangeaDndAdapter extends BaseDndAdapter {
  private loaded = false;
  private dragState = new Map<string, DraggedItem>();
  private dropState = new Map<string, boolean>();

  async ensureLoaded() {
    if (!this.loaded) {
      await loadPangeaDnd();
      this.loaded = true;
    }
  }

  useDrag(options: DragHookOptions): DragHookResult {
    const [isDragging, setIsDragging] = useState(false);
    const dragMonitorId = React.useMemo(() => this.generateId(), []);

    const dragRef = useCallback((element: HTMLElement | null) => {
      if (element) {
        element.setAttribute('data-rqb-draggable', 'true');
        element.setAttribute('data-drag-type', options.type);
        element.setAttribute('data-drag-monitor-id', String(dragMonitorId));
      }
    }, [dragMonitorId, options.type]);

    const previewRef = useCallback((element: HTMLElement | null) => {
      // @hello-pangea/dnd doesn't have separate preview refs
      return dragRef(element);
    }, [dragRef]);

    return {
      isDragging,
      dragMonitorId,
      dragRef,
      previewRef,
    };
  }

  useDrop(options: DropHookOptions): DropHookResult {
    const [isOver, setIsOver] = useState(false);
    const [dropEffect, setDropEffect] = useState<'copy' | 'move'>('move');
    const [groupItems, setGroupItems] = useState(false);
    const dropMonitorId = React.useMemo(() => this.generateId(), []);

    const dropRef = useCallback((element: HTMLElement | null) => {
      if (element) {
        element.setAttribute('data-rqb-droppable', 'true');
        element.setAttribute('data-drop-accept', options.accept.join(','));
        element.setAttribute('data-drop-monitor-id', String(dropMonitorId));
      }
    }, [dropMonitorId, options.accept]);

    // Listen for keyboard events to update modifier states
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (options.modifierKeys?.copyModeKey && e.key.toLowerCase() === options.modifierKeys.copyModeKey) {
          setDropEffect('copy');
        }
        if (options.modifierKeys?.groupModeKey && e.key.toLowerCase() === options.modifierKeys.groupModeKey) {
          setGroupItems(true);
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        if (options.modifierKeys?.copyModeKey && e.key.toLowerCase() === options.modifierKeys.copyModeKey) {
          setDropEffect('move');
        }
        if (options.modifierKeys?.groupModeKey && e.key.toLowerCase() === options.modifierKeys.groupModeKey) {
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

  getDefaultBackend(): any {
    // @hello-pangea/dnd doesn't use backends
    return null;
  }

  DndProvider: React.ComponentType<DndProviderProps> = ({ children }) => {
    if (!pangeaDnd) {
      throw new Error('@hello-pangea/dnd not loaded. Call ensureLoaded() first.');
    }

    const handleDragEnd = (result: any) => {
      // Handle drag end logic here
      // This would need to be connected to the query builder's drop logic
      console.log('Drag ended:', result);
    };

    return React.createElement(
      pangeaDnd.DragDropContext,
      { onDragEnd: handleDragEnd },
      children
    );
  };
}

// Factory function for creating the adapter
export function createHelloPangeaDndAdapter(): HelloPangeaDndAdapter {
  return new HelloPangeaDndAdapter();
}