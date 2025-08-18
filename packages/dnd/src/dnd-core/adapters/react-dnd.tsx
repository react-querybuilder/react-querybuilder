/**
 * React-DnD adapter for the DnD abstraction layer
 */

import * as React from 'react';
import type {
  DragHookOptions,
  DropHookOptions,
  DragHookResult,
  DropHookResult,
  DndProviderProps,
  DraggedItem,
  DropResult,
  DragCollection,
  DropCollection,
  DndAdapter,
} from '../types';
import { generateId, isTouchDevice, isHotkeyPressed } from '../utils';

// Dynamic imports for react-dnd
// oxlint-disable consistent-type-imports
let reactDnd: null | undefined | typeof import('react-dnd') = null;
let html5Backend: null | undefined | typeof import('react-dnd-html5-backend').HTML5Backend = null;
let touchBackend: null | undefined | typeof import('react-dnd-touch-backend').TouchBackend = null;
// oxlint-enable consistent-type-imports

async function loadReactDnd() {
  if (reactDnd) return reactDnd;

  try {
    const [dndModule, html5Module, touchModule] = await Promise.all([
      import('react-dnd'),
      import('react-dnd-html5-backend').catch(() => null),
      import('react-dnd-touch-backend').catch(() => null),
    ]);

    reactDnd = dndModule;
    html5Backend = html5Module?.HTML5Backend;
    touchBackend = touchModule?.TouchBackend;

    return reactDnd;
  } catch {
    throw new Error('Failed to load react-dnd. Make sure react-dnd is installed.');
  }
}

function useDrag(options: DragHookOptions): DragHookResult {
  const dndElementRef = React.useRef<HTMLDivElement>(null);
  const dragElementRef = React.useRef<HTMLSpanElement>(null);

  if (!reactDnd) {
    throw new Error('React-DnD not loaded. Ensure the adapter is initialized first.');
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
      dragMonitorId: monitor.getHandlerId() ?? generateId(),
    }),
    end: options.end,
  }));

  drag(dragElementRef);
  preview(dndElementRef);

  return {
    isDragging,
    dragMonitorId,
    dragRef: dragElementRef,
    previewRef: dndElementRef,
  };
}

function useDrop(options: DropHookOptions): DropHookResult {
  const dndElementRef = React.useRef<HTMLDivElement>(null);

  if (!reactDnd) {
    throw new Error('React-DnD not loaded. Ensure the adapter is initialized first.');
  }

  const [{ isOver, dropMonitorId, dropEffect, groupItems }, drop] = reactDnd.useDrop<
    DraggedItem,
    DropResult,
    DropCollection
  >(() => ({
    accept: options.accept,
    canDrop: options.canDrop,
    collect: monitor => ({
      isOver: monitor.canDrop() && monitor.isOver(),
      dropMonitorId: monitor.getHandlerId() ?? generateId(),
      dropEffect: isHotkeyPressed(options.modifierKeys?.copyModeKey) ? 'copy' : 'move',
      groupItems: isHotkeyPressed(options.modifierKeys?.groupModeKey),
    }),
    drop: options.drop,
  }));

  drop(dndElementRef);

  return {
    isOver,
    dropMonitorId,
    dropEffect,
    groupItems,
    dropRef: dndElementRef,
  };
}

// oxlint-disable-next-line no-explicit-any
function getDefaultBackend(): any {
  const backend = isTouchDevice() ? (touchBackend ?? html5Backend) : (html5Backend ?? touchBackend);

  return backend;
}

const DndProvider: React.ComponentType<DndProviderProps> = ({ backend, debugMode, children }) => {
  if (!reactDnd) {
    throw new Error('React-DnD not loaded. Ensure the adapter is initialized first.');
  }

  const Backend = backend ?? getDefaultBackend();

  return React.createElement(reactDnd.DndProvider, { backend: Backend, debugMode }, children);
};

/**
 * Initialize the React DnD adapter by loading the required libraries
 */
export async function initializeReactDndAdapter(): Promise<void> {
  await loadReactDnd();
}

/**
 * React DnD adapter instance
 */
export const reactDndAdapter: DndAdapter = {
  useDrag,
  useDrop,
  DndProvider,
  isTouchDevice,
  getDefaultBackend,
  initialize: initializeReactDndAdapter,
};
