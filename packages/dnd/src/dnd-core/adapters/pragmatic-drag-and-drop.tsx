/**
 * @atlaskit/pragmatic-drag-and-drop adapter for the DnD abstraction layer
 */

import React, { useCallback, useEffect, useState, useRef } from 'react';
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

// Dynamic imports for @atlaskit/pragmatic-drag-and-drop
let pragmaticDragAndDrop: any = null;

async function loadPragmaticDragAndDrop() {
  if (pragmaticDragAndDrop) return pragmaticDragAndDrop;
  
  try {
    pragmaticDragAndDrop = await import('@atlaskit/pragmatic-drag-and-drop/element/adapter');
    return pragmaticDragAndDrop;
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Failed to load @atlaskit/pragmatic-drag-and-drop. Make sure @atlaskit/pragmatic-drag-and-drop is installed.');
    }
    // Return mock for tests
    return {
      draggable: () => () => {},
      dropTargetForElements: () => () => {},
    };
  }
}

export class PragmaticDragAndDropAdapter extends BaseDndAdapter {
  private loaded = false;

  async ensureLoaded() {
    if (!this.loaded) {
      await loadPragmaticDragAndDrop();
      this.loaded = true;
    }
  }

  useDrag(options: DragHookOptions): DragHookResult {
    if (!pragmaticDragAndDrop) {
      throw new Error('@atlaskit/pragmatic-drag-and-drop not loaded. Call ensureLoaded() first.');
    }

    const [isDragging, setIsDragging] = useState(false);
    const dragMonitorId = React.useMemo(() => this.generateId(), []);
    const elementRef = useRef<HTMLElement | null>(null);

    const dragRef = useCallback((element: HTMLElement | null) => {
      elementRef.current = element;
      
      if (element) {
        const cleanup = pragmaticDragAndDrop.draggable({
          element,
          getInitialData: options.item,
          canDrag: () => options.canDrag ?? true,
          onDragStart: () => {
            setIsDragging(true);
          },
          onDrop: (args: any) => {
            setIsDragging(false);
            if (options.end) {
              options.end(args.source.data, args.location.current.dropTargets[0]?.data);
            }
          },
        });

        return cleanup;
      }
    }, [options]);

    const previewRef = useCallback((element: HTMLElement | null) => {
      // Pragmatic drag and drop handles preview automatically
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
    if (!pragmaticDragAndDrop) {
      throw new Error('@atlaskit/pragmatic-drag-and-drop not loaded. Call ensureLoaded() first.');
    }

    const [isOver, setIsOver] = useState(false);
    const [dropEffect, setDropEffect] = useState<'copy' | 'move'>('move');
    const [groupItems, setGroupItems] = useState(false);
    const dropMonitorId = React.useMemo(() => this.generateId(), []);
    const elementRef = useRef<HTMLElement | null>(null);

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

    const dropRef = useCallback((element: HTMLElement | null) => {
      elementRef.current = element;
      
      if (element) {
        const cleanup = pragmaticDragAndDrop.dropTargetForElements({
          element,
          canDrop: ({ source }: { source: any }) => {
            if (!options.canDrop) return true;
            return options.canDrop(source.data as DraggedItem);
          },
          onDragEnter: () => {
            setIsOver(true);
          },
          onDragLeave: () => {
            setIsOver(false);
          },
          onDrop: () => {
            setIsOver(false);
            if (options.drop) {
              return options.drop();
            }
          },
          getData: () => options.drop?.() || {},
        });

        return cleanup;
      }
    }, [options]);

    return {
      isOver,
      dropMonitorId,
      dropEffect,
      groupItems,
      dropRef,
    };
  }

  getDefaultBackend(): any {
    // Pragmatic drag and drop doesn't use backends
    return null;
  }

  DndProvider: React.ComponentType<DndProviderProps> = ({ children }) => {
    // Pragmatic drag and drop doesn't require a provider component
    return React.createElement(React.Fragment, {}, children);
  };
}

// Factory function for creating the adapter
export function createPragmaticDragAndDropAdapter(): PragmaticDragAndDropAdapter {
  return new PragmaticDragAndDropAdapter();
}