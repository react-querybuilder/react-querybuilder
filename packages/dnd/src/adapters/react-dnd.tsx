import * as React from 'react';
import { useRef } from 'react';
import type { ConnectDragPreview, ConnectDragSource, useDrag as useDragOriginal } from 'react-dnd';
import type * as ReactDnD from 'react-dnd';
import type * as ReactDndHtml5Backend from 'react-dnd-html5-backend';
import type {
  DndDropTargetType,
  DragCollection,
  DraggedItem,
  DropCollection,
  DropResult,
  RuleGroupTypeAny,
  RuleType,
} from 'react-querybuilder';
import { findPath } from 'react-querybuilder';
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
  handleDrop,
} from '../dndLogic';
import { isHotkeyPressed } from '../isHotkeyPressed';
import { isTouchDevice } from '../isTouchDevice';
import type { DndProp } from '../types';

type ReactDndBackendFactory = typeof ReactDndHtml5Backend.HTML5Backend;

let emptyImage: HTMLImageElement;

const getEmptyImage = (): HTMLImageElement => {
  if (!emptyImage) {
    emptyImage = new Image();
    emptyImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  }
  return emptyImage;
};

const ruleGroupAndRuleAccept: [DndDropTargetType, DndDropTargetType] = ['rule', 'ruleGroup'];

// #region Internal hooks

const useRuleDragCommon = (
  params: DndAdapterRuleDnDParams | DndAdapterRuleGroupDnDParams,
  type: DndDropTargetType,
  useDrag: typeof useDragOriginal
): [DragCollection, ConnectDragSource, ConnectDragPreview] =>
  useDrag<DraggedItem, DropResult, DragCollection>(
    () => ({
      type,
      item: () => ({
        ...findPath(params.path, params.schema.getQuery())!,
        path: params.path,
        qbId: params.schema.qbId,
      }),
      canDrag: !params.disabled,
      previewOptions: { captureDraggingState: !!params.hideDefaultDragPreview },
      collect: monitor => ({
        isDragging: !params.disabled && monitor.isDragging(),
        dragMonitorId: monitor.getHandlerId() ?? '',
      }),
      end: (item, monitor) => {
        handleDrop({
          item,
          dropResult: monitor.getDropResult(),
          schema: params.schema,
          actions: params.actions,
          copyModeModifierKey: params.copyModeModifierKey,
          groupModeModifierKey: params.groupModeModifierKey,
        });
      },
    }),
    [params.actions.groupRule, params.actions.moveRule, params.disabled, params.path]
  );

// #endregion

/**
 * Creates a {@link DndAdapter} backed by `react-dnd`.
 *
 * @example
 * ```tsx
 * import { QueryBuilderDnD } from '@react-querybuilder/dnd';
 * import { createReactDnDAdapter } from '@react-querybuilder/dnd/react-dnd';
 * import * as ReactDnD from 'react-dnd';
 * import * as ReactDnDHTML5Backend from 'react-dnd-html5-backend';
 *
 * const adapter = createReactDnDAdapter({ ...ReactDnD, ...ReactDnDHTML5Backend });
 *
 * <QueryBuilderDnD dnd={adapter}>
 *   <QueryBuilder />
 * </QueryBuilderDnD>
 * ```
 *
 * @group DnD
 */
export const createReactDnDAdapter = (dndExports: DndProp): DndAdapter => {
  const {
    useDrag,
    useDrop,
    DndProvider: RDndProvider,
    DndContext,
  } = dndExports as typeof ReactDnD & DndProp;

  // Select backend: prefer touch on touch devices
  let backend: ReactDndBackendFactory | undefined = dndExports.ReactDndBackend;
  if (!backend) {
    // istanbul ignore next -- jsdom unconditionally defines `window.ontouchstart`
    backend = isTouchDevice()
      ? (dndExports.TouchBackend ?? dndExports.HTML5Backend)
      : (dndExports.HTML5Backend ?? dndExports.TouchBackend);
  }

  const DndProvider = ({ debugMode, children }: DndAdapterProviderProps): React.JSX.Element => (
    <RDndProvider backend={backend!} debugMode={debugMode}>
      <DndContext.Consumer>{() => <>{children}</>}</DndContext.Consumer>
    </RDndProvider>
  );

  const useRuleDnD = (params: DndAdapterRuleDnDParams): AdapterUseRuleDnDResult => {
    const dndRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<HTMLSpanElement>(null);

    const [{ isDragging, dragMonitorId }, drag, preview] = useRuleDragCommon(
      params,
      'rule',
      useDrag
    );

    const [{ isOver, dropMonitorId, dropEffect, groupItems, dropNotAllowed }, drop] = useDrop<
      DraggedItem,
      DropResult,
      DropCollection
    >(
      () => ({
        accept: ruleGroupAndRuleAccept,
        canDrop: dragging =>
          canDropOnRule({
            dragging,
            path: params.path,
            schema: params.schema,
            canDrop: params.canDrop,
            groupModeModifierKey: params.groupModeModifierKey,
            disabled: params.disabled,
            rule: params.rule,
          }),
        collect: monitor => ({
          dropNotAllowed: monitor.isOver() && !monitor.canDrop(),
          isOver: monitor.canDrop() && monitor.isOver(),
          dropMonitorId: monitor.getHandlerId() ?? '',
          dropEffect: isHotkeyPressed(params.copyModeModifierKey) ? 'copy' : 'move',
          groupItems: isHotkeyPressed(params.groupModeModifierKey),
        }),
        drop: () =>
          buildDropResult({
            type: 'rule',
            path: params.path,
            schema: params.schema,
            copyModeModifierKey: params.copyModeModifierKey,
            groupModeModifierKey: params.groupModeModifierKey,
          }),
      }),
      [
        params.disabled,
        params.actions.moveRule,
        params.path,
        params.canDrop,
        params.rule,
        params.schema,
      ]
    );

    React.useEffect(() => {
      drag(dragRef);
      drop(dndRef);
      preview(params.hideDefaultDragPreview ? getEmptyImage() : dndRef);
    }, [drag, drop, params.hideDefaultDragPreview, preview]);

    return {
      isDragging,
      dragMonitorId,
      isOver,
      dropMonitorId,
      dndRef,
      dragRef,
      dropEffect,
      groupItems,
      dropNotAllowed,
    };
  };

  const useRuleGroupDnD = (params: DndAdapterRuleGroupDnDParams): AdapterUseRuleGroupDnDResult => {
    const previewRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<HTMLSpanElement>(null);
    const dropRef = useRef<HTMLDivElement>(null);

    const [{ isDragging, dragMonitorId }, drag, preview] = useRuleDragCommon(
      params,
      'ruleGroup',
      useDrag
    );

    const [{ isOver, dropMonitorId, dropEffect, groupItems, dropNotAllowed }, drop] = useDrop<
      DraggedItem,
      DropResult,
      DropCollection
    >(
      () => ({
        accept: ruleGroupAndRuleAccept,
        canDrop: dragging =>
          canDropOnRuleGroup({
            dragging,
            path: params.path,
            schema: params.schema,
            canDrop: params.canDrop,
            disabled: params.disabled,
            ruleGroup: params.ruleGroup,
          }),
        collect: monitor => ({
          dropNotAllowed: monitor.isOver() && !monitor.canDrop(),
          isOver: monitor.canDrop() && monitor.isOver(),
          dropMonitorId: monitor.getHandlerId() ?? '',
          dropEffect: isHotkeyPressed(params.copyModeModifierKey) ? 'copy' : 'move',
          groupItems: isHotkeyPressed(params.groupModeModifierKey),
        }),
        drop: () =>
          buildDropResult({
            type: 'ruleGroup',
            path: params.path,
            schema: params.schema,
            copyModeModifierKey: params.copyModeModifierKey,
            groupModeModifierKey: params.groupModeModifierKey,
          }),
      }),
      [
        params.disabled,
        params.actions.groupRule,
        params.actions.moveRule,
        params.path,
        params.canDrop,
        params.ruleGroup,
        params.schema,
      ]
    );

    React.useEffect(() => {
      if (params.path.length > 0) {
        drag(dragRef);
        preview(params.hideDefaultDragPreview ? getEmptyImage() : previewRef);
      }
      drop(dropRef);
    }, [drag, drop, params.hideDefaultDragPreview, params.path.length, preview]);

    return {
      isDragging,
      dragMonitorId,
      isOver,
      dropMonitorId,
      previewRef,
      dragRef,
      dropRef,
      dropEffect,
      groupItems,
      dropNotAllowed,
    };
  };

  const useInlineCombinatorDnD = (
    params: DndAdapterInlineCombinatorDnDParams
  ): AdapterUseInlineCombinatorDnDResult => {
    const dropRef = useRef<HTMLDivElement>(null);

    // The "hovering" item is the rule or group which precedes this inline combinator.
    const hoveringItem = (params.rules ?? /* istanbul ignore next */ [])[
      params.path.at(-1)! - 1
    ] as RuleType | RuleGroupTypeAny;

    const [{ isOver, dropMonitorId, dropEffect, dropNotAllowed }, drop] = useDrop<
      DraggedItem,
      DropResult,
      DropCollection
    >(
      () => ({
        accept: ['rule', 'ruleGroup'] as DndDropTargetType[],
        canDrop: dragging =>
          canDropOnInlineCombinator({
            dragging,
            path: params.path,
            schema: params.schema,
            canDrop: params.canDrop,
            groupModeModifierKey: params.groupModeModifierKey,
            hoveringItem,
          }),
        collect: monitor => ({
          dropNotAllowed: monitor.isOver() && !monitor.canDrop(),
          isOver: monitor.canDrop() && monitor.isOver(),
          dropMonitorId: monitor.getHandlerId() ?? '',
          dropEffect: isHotkeyPressed(params.copyModeModifierKey) ? 'copy' : 'move',
          groupItems: isHotkeyPressed(params.groupModeModifierKey),
        }),
        drop: () =>
          buildDropResult({
            type: 'inlineCombinator',
            path: params.path,
            schema: params.schema,
            copyModeModifierKey: params.copyModeModifierKey,
            groupModeModifierKey: params.groupModeModifierKey,
          }),
      }),
      [params.canDrop, hoveringItem, params.path, params.schema]
    );

    drop(dropRef);

    return { dropRef, dropMonitorId, isOver, dropEffect, dropNotAllowed };
  };

  return {
    DndProvider,
    useRuleDnD,
    useRuleGroupDnD,
    useInlineCombinatorDnD,
  };
};
