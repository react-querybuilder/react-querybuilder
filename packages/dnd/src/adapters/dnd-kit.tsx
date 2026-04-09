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
  RuleGroupTypeAny,
  RuleType,
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
import { isHotkeyPressed } from '../isHotkeyPressed';

// #region Types for dnd-kit exports

/**
 * Structural type representing the `@dnd-kit/core` exports needed by the adapter.
 * Defined locally to avoid requiring `@dnd-kit/core` as a transitive type dependency
 * for consumers who only use the `react-dnd` adapter.
 *
 * @group DnD
 */
export interface DndKitProp {
  // oxlint-disable-next-line typescript/no-explicit-any
  DndContext: React.ComponentType<any>;
  // oxlint-disable-next-line typescript/no-explicit-any
  useDraggable: (config: any) => {
    setNodeRef: (node: HTMLElement | null) => void;
    setActivatorNodeRef: (node: HTMLElement | null) => void;
    isDragging: boolean;
    // oxlint-disable-next-line typescript/no-explicit-any
    listeners?: Record<string, any>;
    // oxlint-disable-next-line typescript/no-explicit-any
    attributes?: Record<string, any>;
  };
  // oxlint-disable-next-line typescript/no-explicit-any
  useDroppable: (config: any) => {
    setNodeRef: (node: HTMLElement | null) => void;
    isOver: boolean;
  };
  // oxlint-disable-next-line typescript/no-explicit-any
  PointerSensor: any;
  // oxlint-disable-next-line typescript/no-explicit-any
  KeyboardSensor: any;
  // oxlint-disable-next-line typescript/no-explicit-any
  useSensor: (...args: any[]) => any;
  // oxlint-disable-next-line typescript/no-explicit-any
  useSensors: (...args: any[]) => any;
}

// #endregion

// #region Internal context

interface DndKitDragState {
  activeDragItem: DraggedItem | null;
}

const defaultDragState: DndKitDragState = { activeDragItem: null };
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
  // oxlint-disable-next-line typescript/no-explicit-any
  listeners: Record<string, (event: any) => void> | undefined
): void => {
  useEffect(() => {
    const node = nodeRef.current;
    if (!node || !listeners) return;

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
 * import { QueryBuilderDnD, createDndKitAdapter } from '@react-querybuilder/dnd';
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
export const createDndKitAdapter = (dndKitExports: DndKitProp): DndAdapter => {
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

  const DndProvider = ({ children }: DndAdapterProviderProps): React.JSX.Element => {
    const [activeDragItem, setActiveDragItem] = useState<DraggedItem | null>(null);
    const activeDragItemRef = useRef<DraggedItem | null>(null);

    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
      useSensor(KeyboardSensor)
    );

    // oxlint-disable-next-line typescript/no-explicit-any
    const handleDragStart = useCallback((event: any) => {
      const data = event.active?.data?.current;
      if (data?.path && data?.schema) {
        const item = getDragItem(data.path, data.schema);
        activeDragItemRef.current = item;
        setActiveDragItem(item);
      }
    }, []);

    // oxlint-disable-next-line typescript/no-explicit-any
    const handleDragEnd = useCallback((event: any) => {
      const dragItem = activeDragItemRef.current;
      const { over, active } = event;

      if (over && dragItem) {
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
          });
        }
      }

      activeDragItemRef.current = null;
      setActiveDragItem(null);
    }, []);

    const handleDragCancel = useCallback(() => {
      activeDragItemRef.current = null;
      setActiveDragItem(null);
    }, []);

    const dragStateValue = useMemo<DndKitDragState>(() => ({ activeDragItem }), [activeDragItem]);

    return (
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}>
        <DragStateContext.Provider value={dragStateValue}>{children}</DragStateContext.Provider>
      </DndContext>
    );
  };

  // #endregion

  // #region useRuleDnD

  const useRuleDnD = (params: DndAdapterRuleDnDParams): AdapterUseRuleDnDResult => {
    const { activeDragItem } = useContext(DragStateContext);
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
      dropEffect: isHotkeyPressed(params.copyModeModifierKey) ? 'copy' : 'move',
      groupItems: isHotkeyPressed(params.groupModeModifierKey),
      dropNotAllowed,
    };
  };

  // #endregion

  // #region useRuleGroupDnD

  const useRuleGroupDnD = (params: DndAdapterRuleGroupDnDParams): AdapterUseRuleGroupDnDResult => {
    const { activeDragItem } = useContext(DragStateContext);
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
      dropEffect: isHotkeyPressed(params.copyModeModifierKey) ? 'copy' : 'move',
      groupItems: isHotkeyPressed(params.groupModeModifierKey),
      dropNotAllowed,
    };
  };

  // #endregion

  // #region useInlineCombinatorDnD

  const useInlineCombinatorDnD = (
    params: DndAdapterInlineCombinatorDnDParams
  ): AdapterUseInlineCombinatorDnDResult => {
    const { activeDragItem } = useContext(DragStateContext);

    const dropId = getDropId('inlineCombinator', params.path, params.schema.qbId);

    // The "hovering" item is the rule/group preceding this inline combinator.
    const hoveringItem = (params.rules ?? /* istanbul ignore next */ [])[
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
      dropEffect: isHotkeyPressed(params.copyModeModifierKey) ? 'copy' : 'move',
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
