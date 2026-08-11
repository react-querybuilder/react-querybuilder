/* oxlint-disable typescript/no-explicit-any -- stand-ins must stay assignable to/from upstream */
// Structural stand-ins for types owned by this package's _optional_ peer dependencies. The public
// signatures of the adapters reference these instead of the real types so that the published
// declarations don't require `react-dnd`, `@dnd-kit/core`, or
// `@atlaskit/pragmatic-drag-and-drop` to be installed. Each adapter's implementation casts back to
// the real types internally, so `tsc` still checks the bodies, and `vendored.test-d.ts` (validated
// by the repository `typecheck` workflow) catches upstream drift.
import type * as React from 'react';

// #region react-dnd

/**
 * Structural stand-in for `react-dnd`'s `ConnectDragSource`/`ConnectDragPreview`/`ConnectDropTarget`.
 *
 * @group DnD
 */
export type RdndConnector = (elementOrNode: any, options?: any) => any;

/**
 * Structural stand-in for `react-dnd`'s `useDrag`.
 *
 * @group DnD
 */
/**
 * Structural stand-in for `react-dnd`'s `DragSourceHookSpec`.
 *
 * @group DnD
 */
export interface RdndDragSpec<DragObject, DropResult, CollectedProps> {
  type: any;
  item?: DragObject | ((monitor: any) => DragObject);
  collect?: (monitor: any) => CollectedProps;
  end?: (draggedItem: DragObject, monitor: { getDropResult(): DropResult | null }) => void;
  [key: string]: any;
}

export type RdndUseDrag = <DragObject = any, DropResult = any, CollectedProps = any>(
  specArg:
    | RdndDragSpec<DragObject, DropResult, CollectedProps>
    | (() => RdndDragSpec<DragObject, DropResult, CollectedProps>),
  deps?: unknown[]
) => [CollectedProps, RdndConnector, RdndConnector];

/**
 * Structural stand-in for `react-dnd`'s `useDrop`.
 *
 * @group DnD
 */
/**
 * Structural stand-in for `react-dnd`'s `DropTargetHookSpec`.
 *
 * @group DnD
 */
export interface RdndDropSpec<DragObject, DropResult, CollectedProps> {
  accept: any;
  collect?: (monitor: any) => CollectedProps;
  canDrop?: (item: DragObject, monitor: any) => boolean;
  drop?: (item: DragObject, monitor: any) => DropResult | undefined;
  [key: string]: any;
}

export type RdndUseDrop = <DragObject = any, DropResult = any, CollectedProps = any>(
  specArg:
    | RdndDropSpec<DragObject, DropResult, CollectedProps>
    | (() => RdndDropSpec<DragObject, DropResult, CollectedProps>),
  deps?: unknown[]
) => [CollectedProps, RdndConnector];

/**
 * Structural stand-in for the backend factories exported by `react-dnd-html5-backend` and
 * `react-dnd-touch-backend`.
 *
 * @group DnD
 */
export type RdndBackendFactory = (...args: any[]) => any;

/**
 * The `react-dnd` exports needed by the adapter.
 *
 * @group DnD
 */
export interface ReactDnDExports {
  useDrag: RdndUseDrag;
  useDrop: RdndUseDrop;
  DndProvider: React.ComponentType<any>;
  DndContext: React.Context<any>;
}

// #endregion

// #region @dnd-kit/core

/**
 * The `@dnd-kit/core` exports needed by the adapter.
 *
 * @group DnD
 */
export interface DndKitExports {
  DndContext: React.ComponentType<any>;
  useDraggable: (args: any) => any;
  useDroppable: (args: any) => any;
  PointerSensor: any;
  KeyboardSensor: any;
  useSensor: (sensor: any, options?: any) => any;
  useSensors: (...sensors: any[]) => any;
}

// #endregion

// #region @atlaskit/pragmatic-drag-and-drop

/**
 * Structural stand-in for pragmatic-drag-and-drop's `CleanupFn`.
 *
 * @group DnD
 */
export type PdndCleanupFn = () => void;

/**
 * The `@atlaskit/pragmatic-drag-and-drop` exports needed by the adapter.
 *
 * @group DnD
 */
export interface PragmaticDndExports {
  draggable: (args: any) => PdndCleanupFn;
  dropTargetForElements: (args: any) => PdndCleanupFn;
  monitorForElements: (args: any) => PdndCleanupFn;
  combine: (...cleanupFns: PdndCleanupFn[]) => PdndCleanupFn;
}

// #endregion
