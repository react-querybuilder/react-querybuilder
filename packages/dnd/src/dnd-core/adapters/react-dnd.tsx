/**
 * React-DnD adapter for the DnD abstraction layer
 */

import React from 'react';
import type { 
  DragHookOptions, 
  DropHookOptions, 
  DragHookResult, 
  DropHookResult,
  DndProviderProps,
  DraggedItem,
  DropResult,
  DragCollection,
  DropCollection
} from '../types';
import { BaseDndAdapter } from './base';

// Dynamic imports for react-dnd
let reactDnd: any = null;
let html5Backend: any = null;
let touchBackend: any = null;

async function loadReactDnd() {
  if (reactDnd) return reactDnd;
  
  try {
    const [dndModule, html5Module, touchModule] = await Promise.all([
      import('react-dnd'),
      import('react-dnd-html5-backend').catch(() => null),
      import('react-dnd-touch-backend').catch(() => null)
    ]);
    
    reactDnd = dndModule;
    html5Backend = html5Module?.HTML5Backend;
    touchBackend = touchModule?.TouchBackend;
    
    return reactDnd;
  } catch (error) {
    throw new Error('Failed to load react-dnd. Make sure react-dnd is installed.');
  }
}

export class ReactDndAdapter extends BaseDndAdapter {
  private loaded = false;

  async ensureLoaded() {
    if (!this.loaded) {
      await loadReactDnd();
      this.loaded = true;
    }
  }

  useDrag(options: DragHookOptions): DragHookResult {
    if (!reactDnd) {
      throw new Error('React-DnD not loaded. Call ensureLoaded() first.');
    }

    const [{ isDragging, dragMonitorId }, drag, preview] = reactDnd.useDrag<
      DraggedItem, 
      DropResult, 
      DragCollection
    >(() => ({
      type: options.type,
      item: options.item,
      canDrag: options.canDrag ?? true,
      collect: (monitor: any) => ({
        isDragging: monitor.isDragging(),
        dragMonitorId: monitor.getHandlerId() ?? this.generateId(),
      }),
      end: options.end,
    }));

    return {
      isDragging,
      dragMonitorId,
      dragRef: drag,
      previewRef: preview,
    };
  }

  useDrop(options: DropHookOptions): DropHookResult {
    if (!reactDnd) {
      throw new Error('React-DnD not loaded. Call ensureLoaded() first.');
    }

    const [{ isOver, dropMonitorId, dropEffect, groupItems }, drop] = reactDnd.useDrop<
      DraggedItem,
      DropResult,
      DropCollection
    >(() => ({
      accept: options.accept,
      canDrop: options.canDrop,
      collect: (monitor: any) => ({
        isOver: monitor.canDrop() && monitor.isOver(),
        dropMonitorId: monitor.getHandlerId() ?? this.generateId(),
        dropEffect: this.isHotkeyPressed(options.modifierKeys?.copyModeKey) ? 'copy' : 'move',
        groupItems: this.isHotkeyPressed(options.modifierKeys?.groupModeKey),
      }),
      drop: options.drop,
    }));

    return {
      isOver,
      dropMonitorId,
      dropEffect,
      groupItems,
      dropRef: drop,
    };
  }

  getDefaultBackend(): any {
    const backend = this.isTouchDevice() 
      ? (touchBackend ?? html5Backend)
      : (html5Backend ?? touchBackend);
    
    return backend;
  }

  DndProvider: React.ComponentType<DndProviderProps> = ({ backend, debugMode, children }) => {
    if (!reactDnd) {
      throw new Error('React-DnD not loaded. Call ensureLoaded() first.');
    }

    const Backend = backend ?? this.getDefaultBackend();
    
    return React.createElement(
      reactDnd.DndProvider,
      { backend: Backend, debugMode },
      children
    );
  };
}

// Factory function for creating the adapter
export function createReactDndAdapter(): ReactDndAdapter {
  return new ReactDndAdapter();
}