import type {
  DndContext as DndContextImport,
  KeyboardSensor as KeyboardSensorImport,
  PointerSensor as PointerSensorImport,
  useDraggable as useDraggableImport,
  useDroppable as useDroppableImport,
  useSensor as useSensorImport,
  useSensors as useSensorsImport,
} from '@dnd-kit/core';
import * as React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  DndDropTargetType,
  DraggedItem,
  Path,
  RuleGroupTypeAny,
  RuleType,
  Schema,
} from 'react-querybuilder';
import type {
  AdapterUseInlineCombinatorDnDResult,
  AdapterUseRuleDnDResult,
  AdapterUseRuleGroupDnDResult,
  DndAdapter,
  DndAdapterInlineCombinatorDnDParams,
  DndAdapterProviderProps,
  DndAdapterRuleDnDParams,
  DndAdapterRuleGroupDnDParams,
} from '../adapter';
import {
  buildDropResult,
  canDropOnInlineCombinator,
  canDropOnRule,
  canDropOnRuleGroup,
  getDragItem,
  handleDrop,
} from '../dndLogic';
import { DragPreviewContext } from '../DragPreviewContext';
import type { DragPreviewContextValue } from '../DragPreviewContext';
import { isHotkeyPressed } from '../isHotkeyPressed';
import { computeShadowQuery } from '../shadowQuery';
import type { DragPreviewState, OnDragMoveCallback } from '../types';

/**
 * The `@dnd-kit/core` exports needed by the adapter.
 *
 * @group DnD
 */
export type DndKitExports = {
  DndContext: typeof DndContextImport;
  useDraggable: typeof useDraggableImport;
  useDroppable: typeof useDroppableImport;
  PointerSensor: typeof PointerSensorImport;
  KeyboardSensor: typeof KeyboardSensorImport;
  useSensor: typeof useSensorImport;
  useSensors: typeof useSensorsImport;
};

// #region Internal context

interface DndKitDragState {
  activeDragItem: DraggedItem | null;
  timerCopyMode: boolean;
  timerGroupMode: boolean;
}

const defaultDragState: DndKitDragState = {
  activeDragItem: null,
  timerCopyMode: false,
  timerGroupMode: false,
};
const DragStateContext = createContext(defaultDragState);

// #endregion

// #region Helpers

const getDragId = (type: DndDropTargetType, path: number[], qbId: string): string =>
  `drag-${type}-${qbId}-${path.join('_')}`;

const getDropId = (
  type: DndDropTargetType | 'inlineCombinator',
  path: number[],
  qbId: string
): string => `drop-${type}-${qbId}-${path.join('_')}`;

/**
 * Attaches dnd-kit's React synthetic event listeners (e.g. `onPointerDown`)
 * as native DOM event listeners on the given node. This bridges the gap
 * between the ref-based adapter interface and dnd-kit's listener-based API.
 */
const useNativeListeners = (
  nodeRef: React.RefObject<HTMLElement | null>,
  listeners: Record<string, Function> | undefined
): void => {
  useEffect(() => {
    const node = nodeRef.current;
    if (!node || !listeners) return undefined;

    const nativeHandlers: [string, EventListener][] = [];

    for (const [reactEventName, handler] of Object.entries(listeners)) {
      const nativeEventName = reactEventName.slice(2).toLowerCase();
      const nativeHandler: EventListener = e => handler({ nativeEvent: e });
      node.addEventListener(nativeEventName, nativeHandler);
      nativeHandlers.push([nativeEventName, nativeHandler]);
    }

    return () => {
      for (const [name, handler] of nativeHandlers) {
        node.removeEventListener(name, handler);
      }
    };
  }, [nodeRef, listeners]);
};

// #endregion

/**
 * Creates a {@link DndAdapter} backed by `@dnd-kit/core`.
 *
 * The adapter uses `setActivatorNodeRef` for drag handles, so sensor listeners
 * are automatically attached to the correct element without imperative DOM
 * manipulation.
 *
 * @example
 * ```tsx
 * import { QueryBuilderDnD } from '@react-querybuilder/dnd';
 * import { createDndKitAdapter } from '@react-querybuilder/dnd/dnd-kit';
 * import * as DndKit from '@dnd-kit/core';
 *
 * const adapter = createDndKitAdapter(DndKit);
 *
 * <QueryBuilderDnD dnd={adapter}>
 *   <QueryBuilder />
 * </QueryBuilderDnD>
 * ```
 *
 * @group DnD
 */
export const createDndKitAdapter = (dndKitExports: DndKitExports): DndAdapter => {
  const {
    DndContext,
    useDraggable,
    useDroppable,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
  } = dndKitExports;

  // #region DndProvider

  const DndProvider = ({
    children,
    updateWhileDragging,
    copyModeAfterHoverMs,
    groupModeAfterHoverMs,
  }: DndAdapterProviderProps): React.JSX.Element => {
    const [activeDragItem, setActiveDragItem] = useState<DraggedItem | null>(null);
    const activeDragItemRef = useRef<DraggedItem | null>(null);
    // oxlint-disable-next-line typescript/no-explicit-any
    const dragSchemaRef = useRef<Schema<any, any> | null>(null);

    // --- Hover timer state ---
    const [timerCopyMode, setTimerCopyMode] = useState(false);
    const [timerGroupMode, setTimerGroupMode] = useState(false);
    const timerCopyModeRef = useRef(false);
    const timerGroupModeRef = useRef(false);
    const copyTimerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const groupTimerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastHoverTargetIdRef = useRef<string | null>(null);

    const clearHoverTimers = useCallback(() => {
      if (copyTimerIdRef.current !== null) {
        clearTimeout(copyTimerIdRef.current);
        copyTimerIdRef.current = null;
      }
      if (groupTimerIdRef.current !== null) {
        clearTimeout(groupTimerIdRef.current);
        groupTimerIdRef.current = null;
      }
      timerCopyModeRef.current = false;
      timerGroupModeRef.current = false;
      setTimerCopyMode(false);
      setTimerGroupMode(false);
      lastHoverTargetIdRef.current = null;
    }, []);

    const startHoverTimers = useCallback(
      (targetId: string) => {
        if (lastHoverTargetIdRef.current === targetId) return;

        clearHoverTimers();
        lastHoverTargetIdRef.current = targetId;

        if (copyModeAfterHoverMs && copyModeAfterHoverMs > 0) {
          copyTimerIdRef.current = setTimeout(() => {
            timerCopyModeRef.current = true;
            setTimerCopyMode(true);
            copyTimerIdRef.current = null;
          }, copyModeAfterHoverMs);
        }
        if (groupModeAfterHoverMs && groupModeAfterHoverMs > 0) {
          groupTimerIdRef.current = setTimeout(() => {
            timerGroupModeRef.current = true;
            setTimerGroupMode(true);
            groupTimerIdRef.current = null;
          }, groupModeAfterHoverMs);
        }
      },
      [clearHoverTimers, copyModeAfterHoverMs, groupModeAfterHoverMs]
    );

    // --- Update-while-dragging state ---
    const [dragPreviewState, setDragPreviewState] = useState<DragPreviewState | null>(null);
    const dragPreviewStateRef = useRef<DragPreviewState | null>(null);
    const onDragMoveRef = useRef<OnDragMoveCallback | undefined>(undefined);
    const lastTargetRef = useRef<{
      targetPath: Path;
      targetType: DndDropTargetType;
      quadrant: 'upper' | 'lower';
    } | null>(null);

    const updatePreviewPosition = useCallback(
      (targetPath: Path, targetType: DndDropTargetType, quadrant: 'upper' | 'lower') => {
        const currentPreview = dragPreviewStateRef.current;
        // v8 ignore next
        if (!currentPreview || !updateWhileDragging) return;

        const last = lastTargetRef.current;
        if (
          last &&
          last.quadrant === quadrant &&
          last.targetType === targetType &&
          last.targetPath.length === targetPath.length &&
          last.targetPath.every((v, i) => v === targetPath[i])
        ) {
          return;
        }
        lastTargetRef.current = { targetPath, targetType, quadrant };

        // v8 ignore next -- hotkey branch tested in hotkey-specific tests
        const dropEffect =
          timerCopyModeRef.current ||
          isHotkeyPressed(currentPreview.dropEffect === 'copy' ? 'alt' : '')
            ? 'copy'
            : 'move';
        const groupItems = timerGroupModeRef.current || isHotkeyPressed('ctrl');

        const result = computeShadowQuery({
          originalQuery: currentPreview.originalQuery,
          draggedItem: activeDragItemRef.current!,
          draggedPath: currentPreview.draggedPath,
          targetPath,
          targetType,
          quadrant,
          dropEffect,
          groupItems,
        });

        if (result) {
          const newState: DragPreviewState = {
            ...currentPreview,
            shadowQuery: result.shadowQuery,
            previewPath: result.previewPath,
            dropEffect,
            groupItems,
          };
          dragPreviewStateRef.current = newState;
          setDragPreviewState(newState);

          onDragMoveRef.current?.({
            draggedItem: activeDragItemRef.current!,
            shadowQuery: result.shadowQuery,
            originalQuery: currentPreview.originalQuery,
            previewPath: result.previewPath,
          });
        }
      },
      [updateWhileDragging]
    );

    const commitDrag = useCallback(() => {
      const preview = dragPreviewStateRef.current;
      // v8 ignore next
      if (!preview) return;

      const schema = dragSchemaRef.current;
      if (schema && preview.shadowQuery !== preview.originalQuery) {
        schema.dispatchQuery(preview.shadowQuery);
      }

      dragSchemaRef.current = null;
      dragPreviewStateRef.current = null;
      lastTargetRef.current = null;
      setDragPreviewState(null);
    }, []);

    const cancelDrag = useCallback(() => {
      dragSchemaRef.current = null;
      dragPreviewStateRef.current = null;
      lastTargetRef.current = null;
      setDragPreviewState(null);
    }, []);

    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
      useSensor(KeyboardSensor)
    );

    const handleDragStart = useCallback(
      // oxlint-disable-next-line typescript/no-explicit-any
      (event: any) => {
        const data = event.active?.data?.current;
        if (data?.path && data?.schema) {
          const item = getDragItem(data.path, data.schema);
          activeDragItemRef.current = item;
          setActiveDragItem(item);

          if (updateWhileDragging) {
            dragSchemaRef.current = data.schema;
            const originalQuery = data.schema.getQuery();
            const initialState: DragPreviewState = {
              shadowQuery: originalQuery,
              originalQuery,
              draggedPath: data.path as Path,
              previewPath: data.path as Path,
              dropEffect: 'move',
              groupItems: false,
              qbId: data.schema.qbId,
            };
            dragPreviewStateRef.current = initialState;
            setDragPreviewState(initialState);
          }
        }
      },
      [updateWhileDragging]
    );

    // Handle continuous drag movement for updateWhileDragging
    const handleDragOver = useCallback(
      // oxlint-disable-next-line typescript/no-explicit-any
      (event: any) => {
        const { over } = event;

        // Manage hover timers for copy/group mode
        if (over) {
          const targetData = over.data?.current;
          const targetType = targetData?.type as DndDropTargetType | undefined;
          const targetPath = targetData?.path as Path | undefined;
          if (targetType && targetPath) {
            const targetId = `${targetType}-${targetPath.join('_')}`;
            startHoverTimers(targetId);
          }
        } else {
          clearHoverTimers();
        }

        // v8 ignore next
        if (!updateWhileDragging || !dragPreviewStateRef.current) return;

        if (!over) return;

        const { activatorEvent, delta } = event;
        const targetData = over.data?.current;
        const targetType = targetData?.type as DndDropTargetType | undefined;
        const targetPath = targetData?.path as Path | undefined;

        if (!targetType || !targetPath) return;

        // Compute current clientY from activator event + delta
        // v8 ignore next -- activatorEvent and delta always provided by dnd-kit
        const initialY = (activatorEvent as PointerEvent | undefined)?.clientY ?? 0;
        // v8 ignore next
        const clientY = initialY + (delta?.y ?? 0);

        // For rule groups, always use 'upper' (insert as first child).
        // For rules, use quadrant detection on the droppable's rect.
        let quadrant: 'upper' | 'lower' | null;
        if (targetType === 'ruleGroup') {
          quadrant = 'upper';
        } else {
          // over.rect is the droppable container's bounding rect from dnd-kit
          const rect = over.rect;
          if (rect) {
            // v8 ignore next -- rect always has height from dnd-kit
            const height = rect.height ?? rect.bottom - rect.top;
            const quarterHeight = height / 4;
            // v8 ignore next -- rect always has top from dnd-kit
            const top = rect.top ?? rect.offsetTop ?? 0;
            const bottom = top + height;
            if (clientY < top + quarterHeight) {
              quadrant = 'upper';
            } else if (clientY > bottom - quarterHeight) {
              quadrant = 'lower';
            } else {
              quadrant = null;
            }
          } else {
            quadrant = null;
          }
        }

        if (!quadrant) return;

        const dragItem = activeDragItemRef.current;
        // v8 ignore next
        if (!dragItem) return;

        const validate = targetData?.validate as ((item: DraggedItem) => boolean) | undefined;
        if (validate && !validate(dragItem)) return;

        updatePreviewPosition(targetPath, targetType, quadrant);
      },
      [updateWhileDragging, updatePreviewPosition, startHoverTimers, clearHoverTimers]
    );

    const handleDragEnd = useCallback(
      // oxlint-disable-next-line typescript/no-explicit-any
      (event: any) => {
        const dragItem = activeDragItemRef.current;
        const { over, active } = event;

        // Capture timer overrides before clearing
        const copyOverride = timerCopyModeRef.current;
        const groupOverride = timerGroupModeRef.current;
        clearHoverTimers();

        if (updateWhileDragging && dragPreviewStateRef.current) {
          if (over) {
            commitDrag();
          } else {
            cancelDrag();
          }
        } else if (over && dragItem) {
          const sourceData = active?.data?.current;
          const targetData = over?.data?.current;

          if (sourceData && targetData?.validate?.(dragItem)) {
            const dropResult = targetData.getDropResult();
            handleDrop({
              item: dragItem,
              dropResult,
              schema: sourceData.schema,
              actions: sourceData.actions,
              copyModeModifierKey: sourceData.copyModeModifierKey,
              groupModeModifierKey: sourceData.groupModeModifierKey,
              copyModeOverride: copyOverride,
              groupModeOverride: groupOverride,
            });
          }
        }

        activeDragItemRef.current = null;
        setActiveDragItem(null);
      },
      [updateWhileDragging, commitDrag, cancelDrag, clearHoverTimers]
    );

    const handleDragCancel = useCallback(() => {
      clearHoverTimers();
      if (updateWhileDragging && dragPreviewStateRef.current) {
        cancelDrag();
      }
      activeDragItemRef.current = null;
      setActiveDragItem(null);
    }, [updateWhileDragging, cancelDrag, clearHoverTimers]);

    const dragStateValue = useMemo<DndKitDragState>(
      () => ({ activeDragItem, timerCopyMode, timerGroupMode }),
      [activeDragItem, timerCopyMode, timerGroupMode]
    );

    const dragPreviewContextValue = useMemo<DragPreviewContextValue>(
      () => ({
        dragPreviewState,
        updatePreviewPosition,
        commitDrag,
        cancelDrag,
      }),
      [dragPreviewState, updatePreviewPosition, commitDrag, cancelDrag]
    );

    return (
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragCancel={handleDragCancel}>
        <DragStateContext.Provider value={dragStateValue}>
          <DragPreviewContext.Provider value={dragPreviewContextValue}>
            {children}
          </DragPreviewContext.Provider>
        </DragStateContext.Provider>
      </DndContext>
    );
  };

  // #endregion

  // #region useRuleDnD

  const useRuleDnD = (params: DndAdapterRuleDnDParams): AdapterUseRuleDnDResult => {
    const { activeDragItem, timerCopyMode, timerGroupMode } = useContext(DragStateContext);
    const activatorNodeRef = useRef<HTMLSpanElement>(null);
    const containerNodeRef = useRef<HTMLDivElement>(null);

    const dragId = getDragId('rule', params.path, params.schema.qbId);
    const dropId = getDropId('rule', params.path, params.schema.qbId);

    const {
      setNodeRef: setDragNodeRef,
      setActivatorNodeRef,
      isDragging,
      listeners,
      attributes,
    } = useDraggable({
      id: dragId,
      disabled: params.disabled,
      data: {
        path: params.path,
        schema: params.schema,
        actions: params.actions,
        copyModeModifierKey: params.copyModeModifierKey,
        groupModeModifierKey: params.groupModeModifierKey,
      },
    });

    const { setNodeRef: setDropNodeRef, isOver: rawIsOver } = useDroppable({
      id: dropId,
      data: {
        type: 'rule' as DndDropTargetType,
        path: params.path,
        schema: params.schema,
        validate: (dragging: DraggedItem) =>
          canDropOnRule({
            dragging,
            path: params.path,
            schema: params.schema,
            canDrop: params.canDrop,
            groupModeModifierKey: params.groupModeModifierKey,
            disabled: params.disabled,
            rule: params.rule,
          }),
        getDropResult: () =>
          buildDropResult({
            type: 'rule',
            path: params.path,
            schema: params.schema,
            copyModeModifierKey: params.copyModeModifierKey,
            groupModeModifierKey: params.groupModeModifierKey,
          }),
      },
    });

    // Compute validated isOver + dropNotAllowed
    const canDropHere =
      rawIsOver &&
      !!activeDragItem &&
      canDropOnRule({
        dragging: activeDragItem,
        path: params.path,
        schema: params.schema,
        canDrop: params.canDrop,
        groupModeModifierKey: params.groupModeModifierKey,
        disabled: params.disabled,
        rule: params.rule,
      });
    const isOver = rawIsOver && canDropHere;
    const dropNotAllowed = rawIsOver && !canDropHere;

    // Combined container ref: both draggable and droppable
    const dndRef: React.RefCallback<HTMLDivElement> = useCallback(
      (node: HTMLDivElement | null) => {
        containerNodeRef.current = node;
        setDragNodeRef(node);
        setDropNodeRef(node);
      },
      [setDragNodeRef, setDropNodeRef]
    );

    // Drag handle ref: activator node
    const dragRef: React.RefCallback<HTMLSpanElement> = useCallback(
      (node: HTMLSpanElement | null) => {
        activatorNodeRef.current = node;
        setActivatorNodeRef(node);
      },
      [setActivatorNodeRef]
    );

    // Set ARIA attributes on drag handle
    useEffect(() => {
      const node = activatorNodeRef.current;
      if (!node || !attributes) return;
      for (const [key, value] of Object.entries(attributes)) {
        if (value != null) {
          node.setAttribute(key === 'tabIndex' ? 'tabindex' : key, String(value));
        }
      }
    }, [attributes]);

    // Attach sensor listeners (e.g. onPointerDown) to the drag handle
    useNativeListeners(activatorNodeRef, listeners);

    return {
      isDragging,
      dragMonitorId: dragId,
      isOver,
      dropMonitorId: dropId,
      dndRef,
      dragRef,
      dropEffect: timerCopyMode || isHotkeyPressed(params.copyModeModifierKey) ? 'copy' : 'move',
      groupItems: timerGroupMode || isHotkeyPressed(params.groupModeModifierKey),
      dropNotAllowed,
    };
  };

  // #endregion

  // #region useRuleGroupDnD

  const useRuleGroupDnD = (params: DndAdapterRuleGroupDnDParams): AdapterUseRuleGroupDnDResult => {
    const { activeDragItem, timerCopyMode, timerGroupMode } = useContext(DragStateContext);
    const activatorNodeRef = useRef<HTMLSpanElement>(null);

    const dragId = getDragId('ruleGroup', params.path, params.schema.qbId);
    const dropId = getDropId('ruleGroup', params.path, params.schema.qbId);

    const isDragDisabled = params.disabled || params.path.length === 0;

    const {
      setNodeRef: setDragNodeRef,
      setActivatorNodeRef,
      isDragging,
      listeners,
      attributes,
    } = useDraggable({
      id: dragId,
      disabled: isDragDisabled,
      data: {
        path: params.path,
        schema: params.schema,
        actions: params.actions,
        copyModeModifierKey: params.copyModeModifierKey,
        groupModeModifierKey: params.groupModeModifierKey,
      },
    });

    const { setNodeRef: setDropNodeRef, isOver: rawIsOver } = useDroppable({
      id: dropId,
      data: {
        type: 'ruleGroup' as DndDropTargetType,
        path: params.path,
        schema: params.schema,
        validate: (dragging: DraggedItem) =>
          canDropOnRuleGroup({
            dragging,
            path: params.path,
            schema: params.schema,
            canDrop: params.canDrop,
            disabled: params.disabled,
            ruleGroup: params.ruleGroup,
          }),
        getDropResult: () =>
          buildDropResult({
            type: 'ruleGroup',
            path: params.path,
            schema: params.schema,
            copyModeModifierKey: params.copyModeModifierKey,
            groupModeModifierKey: params.groupModeModifierKey,
          }),
      },
    });

    // Compute validated isOver + dropNotAllowed
    const canDropHere =
      rawIsOver &&
      !!activeDragItem &&
      canDropOnRuleGroup({
        dragging: activeDragItem,
        path: params.path,
        schema: params.schema,
        canDrop: params.canDrop,
        disabled: params.disabled,
        ruleGroup: params.ruleGroup,
      });
    const isOver = rawIsOver && canDropHere;
    const dropNotAllowed = rawIsOver && !canDropHere;

    // Preview ref: draggable container (for visual measurement)
    const previewRef: React.RefCallback<HTMLDivElement> = useCallback(
      (node: HTMLDivElement | null) => {
        setDragNodeRef(node);
      },
      [setDragNodeRef]
    );

    // Drop ref: header element
    const dropRef: React.RefCallback<HTMLDivElement> = useCallback(
      (node: HTMLDivElement | null) => {
        setDropNodeRef(node);
      },
      [setDropNodeRef]
    );

    // Drag handle ref: activator node
    const dragRef: React.RefCallback<HTMLSpanElement> = useCallback(
      (node: HTMLSpanElement | null) => {
        activatorNodeRef.current = node;
        setActivatorNodeRef(node);
      },
      [setActivatorNodeRef]
    );

    // Set ARIA attributes on drag handle
    useEffect(() => {
      const node = activatorNodeRef.current;
      if (!node || !attributes || isDragDisabled) return;
      for (const [key, value] of Object.entries(attributes)) {
        if (value != null) {
          node.setAttribute(key === 'tabIndex' ? 'tabindex' : key, String(value));
        }
      }
    }, [attributes, isDragDisabled]);

    // Attach sensor listeners (e.g. onPointerDown) to the drag handle
    useNativeListeners(activatorNodeRef, listeners);

    return {
      isDragging,
      dragMonitorId: dragId,
      isOver,
      dropMonitorId: dropId,
      previewRef,
      dragRef,
      dropRef,
      dropEffect: timerCopyMode || isHotkeyPressed(params.copyModeModifierKey) ? 'copy' : 'move',
      groupItems: timerGroupMode || isHotkeyPressed(params.groupModeModifierKey),
      dropNotAllowed,
    };
  };

  // #endregion

  // #region useInlineCombinatorDnD

  const useInlineCombinatorDnD = (
    params: DndAdapterInlineCombinatorDnDParams
  ): AdapterUseInlineCombinatorDnDResult => {
    const { activeDragItem, timerCopyMode } = useContext(DragStateContext);

    const dropId = getDropId('inlineCombinator', params.path, params.schema.qbId);

    // The "hovering" item is the rule/group preceding this inline combinator.
    const hoveringItem = (params.rules ??
      /* v8 ignore start -- @preserve */ []) /* v8 ignore stop -- @preserve */[
      params.path.at(-1)! - 1
    ] as RuleType | RuleGroupTypeAny;

    const { setNodeRef: setDropNodeRef, isOver: rawIsOver } = useDroppable({
      id: dropId,
      data: {
        type: 'inlineCombinator' as DndDropTargetType,
        path: params.path,
        schema: params.schema,
        validate: (dragging: DraggedItem) =>
          canDropOnInlineCombinator({
            dragging,
            path: params.path,
            schema: params.schema,
            canDrop: params.canDrop,
            groupModeModifierKey: params.groupModeModifierKey,
            hoveringItem,
          }),
        getDropResult: () =>
          buildDropResult({
            type: 'inlineCombinator',
            path: params.path,
            schema: params.schema,
            copyModeModifierKey: params.copyModeModifierKey,
            groupModeModifierKey: params.groupModeModifierKey,
          }),
      },
    });

    // Compute validated isOver + dropNotAllowed
    const canDropHere =
      rawIsOver &&
      !!activeDragItem &&
      canDropOnInlineCombinator({
        dragging: activeDragItem,
        path: params.path,
        schema: params.schema,
        canDrop: params.canDrop,
        groupModeModifierKey: params.groupModeModifierKey,
        hoveringItem,
      });
    const isOver = rawIsOver && canDropHere;
    const dropNotAllowed = rawIsOver && !canDropHere;

    const dropRef: React.RefCallback<HTMLDivElement> = useCallback(
      (node: HTMLDivElement | null) => {
        setDropNodeRef(node);
      },
      [setDropNodeRef]
    );

    return {
      dropRef,
      dropMonitorId: dropId,
      isOver,
      dropEffect: timerCopyMode || isHotkeyPressed(params.copyModeModifierKey) ? 'copy' : 'move',
      dropNotAllowed,
    };
  };

  // #endregion

  return {
    DndProvider,
    useRuleDnD,
    useRuleGroupDnD,
    useInlineCombinatorDnD,
  };
};
