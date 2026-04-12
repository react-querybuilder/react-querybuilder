import type { combine as combineImport } from '@atlaskit/pragmatic-drag-and-drop/combine';
import type {
  draggable as draggableImport,
  dropTargetForElements as dropTargetForElementsImport,
  monitorForElements as monitorForElementsImport,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
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

/**
 * The `@atlaskit/pragmatic-drag-and-drop` exports needed by the adapter.
 *
 * @group DnD
 */
export type PragmaticDndExports = {
  draggable: typeof draggableImport;
  dropTargetForElements: typeof dropTargetForElementsImport;
  monitorForElements: typeof monitorForElementsImport;
  combine: typeof combineImport;
};

// #region Internal context

interface PragmaticDragState {
  activeDragItem: DraggedItem | null;
}

const defaultDragState: PragmaticDragState = { activeDragItem: null };
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

// #endregion

/**
 * Creates a {@link DndAdapter} backed by `@atlaskit/pragmatic-drag-and-drop`.
 *
 * @example
 * ```tsx
 * import { QueryBuilderDnD } from '@react-querybuilder/dnd';
 * import { createPragmaticDndAdapter } from '@react-querybuilder/dnd/pragmatic-dnd';
 * import { draggable, dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
 * import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
 *
 * const adapter = createPragmaticDndAdapter({ draggable, dropTargetForElements, monitorForElements, combine });
 *
 * <QueryBuilderDnD dnd={adapter}>
 *   <QueryBuilder />
 * </QueryBuilderDnD>
 * ```
 *
 * @group DnD
 */
export const createPragmaticDndAdapter = (pdndExports: PragmaticDndExports): DndAdapter => {
  const { draggable, dropTargetForElements, monitorForElements, combine } = pdndExports;

  // #region DndProvider

  const DndProvider = ({ children }: DndAdapterProviderProps): React.JSX.Element => {
    const [activeDragItem, setActiveDragItem] = useState<DraggedItem | null>(null);
    const activeDragItemRef = useRef<DraggedItem | null>(null);

    useEffect(() => {
      const cleanup = monitorForElements({
        onDragStart({ source }: { source: { data: Record<string, unknown> } }) {
          const data = source.data;
          if (data.__rqbPath && data.__rqbSchema) {
            // oxlint-disable-next-line typescript/no-explicit-any
            const item = getDragItem(data.__rqbPath as number[], data.__rqbSchema as any);
            activeDragItemRef.current = item;
            setActiveDragItem(item);
          }
        },
        onDrop({
          source,
          location,
        }: {
          source: { data: Record<string, unknown> };
          location: { current: { dropTargets: { data: Record<string, unknown> }[] } };
        }) {
          const dragItem = activeDragItemRef.current;
          const sourceData = source.data;
          const dropTargets = location.current.dropTargets;

          if (dragItem && dropTargets.length > 0) {
            const targetData = dropTargets[0].data;
            const validate = targetData.__rqbValidate as
              | ((item: DraggedItem) => boolean)
              | undefined;

            if (validate?.(dragItem)) {
              const getDropResultFn = targetData.__rqbGetDropResult as (() => unknown) | undefined;
              const dropResult = getDropResultFn?.();
              handleDrop({
                item: dragItem,
                dropResult: dropResult as ReturnType<typeof buildDropResult> | null,
                // oxlint-disable-next-line typescript/no-explicit-any
                schema: sourceData.__rqbSchema as any,
                // oxlint-disable-next-line typescript/no-explicit-any
                actions: sourceData.__rqbActions as any,
                copyModeModifierKey: sourceData.__rqbCopyModeModifierKey as string,
                groupModeModifierKey: sourceData.__rqbGroupModeModifierKey as string,
              });
            }
          }

          activeDragItemRef.current = null;
          setActiveDragItem(null);
        },
      });

      return cleanup;
    }, []);

    const dragStateValue = useMemo<PragmaticDragState>(
      () => ({ activeDragItem }),
      [activeDragItem]
    );

    return <DragStateContext.Provider value={dragStateValue}>{children}</DragStateContext.Provider>;
  };

  // #endregion

  // #region useRuleDnD

  const useRuleDnD = (params: DndAdapterRuleDnDParams): AdapterUseRuleDnDResult => {
    const { activeDragItem } = useContext(DragStateContext);
    const containerNodeRef = useRef<HTMLDivElement>(null);
    const handleNodeRef = useRef<HTMLSpanElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isOver, setIsOver] = useState(false);

    const dragId = getDragId('rule', params.path, params.schema.qbId);
    const dropId = getDropId('rule', params.path, params.schema.qbId);

    const paramsRef = useRef(params);
    paramsRef.current = params;

    useEffect(() => {
      const container = containerNodeRef.current;
      const handle = handleNodeRef.current;
      if (!container || !handle) return undefined;

      return combine(
        draggable({
          element: container,
          dragHandle: handle,
          canDrag: () => !paramsRef.current.disabled,
          getInitialData: () => ({
            __rqbPath: paramsRef.current.path,
            __rqbSchema: paramsRef.current.schema,
            __rqbActions: paramsRef.current.actions,
            __rqbCopyModeModifierKey: paramsRef.current.copyModeModifierKey,
            __rqbGroupModeModifierKey: paramsRef.current.groupModeModifierKey,
          }),
          onDragStart: () => setIsDragging(true),
          onDrop: () => setIsDragging(false),
        }),
        dropTargetForElements({
          element: container,
          getData: () => ({
            __rqbType: 'rule' as DndDropTargetType,
            __rqbValidate: (dragging: DraggedItem) => {
              const cp = paramsRef.current;
              return canDropOnRule({
                dragging,
                path: cp.path,
                schema: cp.schema,
                canDrop: cp.canDrop,
                groupModeModifierKey: cp.groupModeModifierKey,
                disabled: cp.disabled,
                rule: cp.rule,
              });
            },
            __rqbGetDropResult: () => {
              const cp = paramsRef.current;
              return buildDropResult({
                type: 'rule',
                path: cp.path,
                schema: cp.schema,
                copyModeModifierKey: cp.copyModeModifierKey,
                groupModeModifierKey: cp.groupModeModifierKey,
              });
            },
          }),
          onDragEnter: () => setIsOver(true),
          onDragLeave: () => setIsOver(false),
          onDrop: () => setIsOver(false),
        })
      );
    }, [params.path, params.schema.qbId, params.disabled]);

    const canDropHere =
      isOver &&
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
    const validatedIsOver = isOver && canDropHere;
    const dropNotAllowed = isOver && !canDropHere;

    const dndRef: React.RefCallback<HTMLDivElement> = useCallback((node: HTMLDivElement | null) => {
      containerNodeRef.current = node;
    }, []);

    const dragRef: React.RefCallback<HTMLSpanElement> = useCallback(
      (node: HTMLSpanElement | null) => {
        handleNodeRef.current = node;
      },
      []
    );

    return {
      isDragging,
      dragMonitorId: dragId,
      isOver: validatedIsOver,
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
    const previewNodeRef = useRef<HTMLDivElement>(null);
    const handleNodeRef = useRef<HTMLSpanElement>(null);
    const dropNodeRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isOver, setIsOver] = useState(false);

    const isDragDisabled = params.disabled || params.path.length === 0;

    const dragId = getDragId('ruleGroup', params.path, params.schema.qbId);
    const dropId = getDropId('ruleGroup', params.path, params.schema.qbId);

    const paramsRef = useRef(params);
    paramsRef.current = params;

    // Register draggable on the preview element with handle
    useEffect(() => {
      const previewEl = previewNodeRef.current;
      const handleEl = handleNodeRef.current;
      if (!previewEl || !handleEl || isDragDisabled) return undefined;

      return draggable({
        element: previewEl,
        dragHandle: handleEl,
        canDrag: () => !paramsRef.current.disabled && paramsRef.current.path.length > 0,
        getInitialData: () => ({
          __rqbPath: paramsRef.current.path,
          __rqbSchema: paramsRef.current.schema,
          __rqbActions: paramsRef.current.actions,
          __rqbCopyModeModifierKey: paramsRef.current.copyModeModifierKey,
          __rqbGroupModeModifierKey: paramsRef.current.groupModeModifierKey,
        }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      });
    }, [isDragDisabled, params.path, params.schema.qbId]);

    // Register drop target on the drop element (header)
    useEffect(() => {
      const dropEl = dropNodeRef.current;
      if (!dropEl) return undefined;

      return dropTargetForElements({
        element: dropEl,
        getData: () => ({
          __rqbType: 'ruleGroup' as DndDropTargetType,
          __rqbValidate: (dragging: DraggedItem) => {
            const cp = paramsRef.current;
            return canDropOnRuleGroup({
              dragging,
              path: cp.path,
              schema: cp.schema,
              canDrop: cp.canDrop,
              disabled: cp.disabled,
              ruleGroup: cp.ruleGroup,
            });
          },
          __rqbGetDropResult: () => {
            const cp = paramsRef.current;
            return buildDropResult({
              type: 'ruleGroup',
              path: cp.path,
              schema: cp.schema,
              copyModeModifierKey: cp.copyModeModifierKey,
              groupModeModifierKey: cp.groupModeModifierKey,
            });
          },
        }),
        onDragEnter: () => setIsOver(true),
        onDragLeave: () => setIsOver(false),
        onDrop: () => setIsOver(false),
      });
    }, [params.path, params.schema.qbId, params.disabled]);

    const canDropHere =
      isOver &&
      !!activeDragItem &&
      canDropOnRuleGroup({
        dragging: activeDragItem,
        path: params.path,
        schema: params.schema,
        canDrop: params.canDrop,
        disabled: params.disabled,
        ruleGroup: params.ruleGroup,
      });
    const validatedIsOver = isOver && canDropHere;
    const dropNotAllowed = isOver && !canDropHere;

    const previewRef: React.RefCallback<HTMLDivElement> = useCallback(
      (node: HTMLDivElement | null) => {
        previewNodeRef.current = node;
      },
      []
    );

    const dropRef: React.RefCallback<HTMLDivElement> = useCallback(
      (node: HTMLDivElement | null) => {
        dropNodeRef.current = node;
      },
      []
    );

    const dragRef: React.RefCallback<HTMLSpanElement> = useCallback(
      (node: HTMLSpanElement | null) => {
        handleNodeRef.current = node;
      },
      []
    );

    return {
      isDragging,
      dragMonitorId: dragId,
      isOver: validatedIsOver,
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
    const dropNodeRef = useRef<HTMLDivElement>(null);
    const [isOver, setIsOver] = useState(false);

    const dropId = getDropId('inlineCombinator', params.path, params.schema.qbId);

    const hoveringItem = (params.rules ?? /* istanbul ignore next */ [])[
      params.path.at(-1)! - 1
    ] as RuleType | RuleGroupTypeAny;

    const paramsRef = useRef(params);
    paramsRef.current = params;

    useEffect(() => {
      const dropEl = dropNodeRef.current;
      if (!dropEl) return undefined;

      return dropTargetForElements({
        element: dropEl,
        getData: () => ({
          __rqbType: 'inlineCombinator' as DndDropTargetType,
          __rqbValidate: (dragging: DraggedItem) => {
            const cp = paramsRef.current;
            const hItem = (cp.rules ?? [])[cp.path.at(-1)! - 1] as RuleType | RuleGroupTypeAny;
            return canDropOnInlineCombinator({
              dragging,
              path: cp.path,
              schema: cp.schema,
              canDrop: cp.canDrop,
              groupModeModifierKey: cp.groupModeModifierKey,
              hoveringItem: hItem,
            });
          },
          __rqbGetDropResult: () => {
            const cp = paramsRef.current;
            return buildDropResult({
              type: 'inlineCombinator',
              path: cp.path,
              schema: cp.schema,
              copyModeModifierKey: cp.copyModeModifierKey,
              groupModeModifierKey: cp.groupModeModifierKey,
            });
          },
        }),
        onDragEnter: () => setIsOver(true),
        onDragLeave: () => setIsOver(false),
        onDrop: () => setIsOver(false),
      });
    }, [params.path, params.schema.qbId]);

    const canDropHere =
      isOver &&
      !!activeDragItem &&
      canDropOnInlineCombinator({
        dragging: activeDragItem,
        path: params.path,
        schema: params.schema,
        canDrop: params.canDrop,
        groupModeModifierKey: params.groupModeModifierKey,
        hoveringItem,
      });
    const validatedIsOver = isOver && canDropHere;
    const dropNotAllowed = isOver && !canDropHere;

    const dropRef: React.RefCallback<HTMLDivElement> = useCallback(
      (node: HTMLDivElement | null) => {
        dropNodeRef.current = node;
      },
      []
    );

    return {
      dropRef,
      dropMonitorId: dropId,
      isOver: validatedIsOver,
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
