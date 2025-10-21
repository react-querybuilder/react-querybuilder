import * as React from 'react';
import { useContext, useRef } from 'react';
import type { useDrag as useDragOriginal, useDrop as useDropOriginal } from 'react-dnd';
import type {
  DndDropTargetType,
  DraggedItem,
  DropCollection,
  DropResult,
  RuleGroupProps,
  UseRuleGroupDnD,
} from 'react-querybuilder';
import { getParentPath, isAncestor, pathsAreEqual } from 'react-querybuilder';
import { getEmptyImage } from './getEmptyImage';
import { isHotkeyPressed } from './isHotkeyPressed';
import { QueryBuilderDndContext } from './QueryBuilderDndContext';
import type { QueryBuilderDndContextProps } from './types';
import { useDragCommon } from './useDragCommon';

/**
 * Rule group component for drag-and-drop. Renders the provided rule group component
 * ({@link react-querybuilder!RuleGroup RuleGroup} by default), but forwards the drag-and-drop
 * context so that child rules and groups will render within the appropriate drag-and-drop wrappers.
 *
 * @group Components
 */
export const RuleGroupDnD = (props: RuleGroupProps): React.JSX.Element => {
  const rqbDndContext = useContext(QueryBuilderDndContext);

  const {
    canDrop,
    baseControls: { ruleGroup: BaseRuleGroupComponent },
    useDrag,
    useDrop,
    copyModeModifierKey,
    groupModeModifierKey,
    noDragPreview,
  } = rqbDndContext;

  const dndRefs = useRuleGroupDnD({
    ...props,
    disabled: !!props.parentDisabled || !!props.disabled,
    useDrag: useDrag!,
    useDrop: useDrop!,
    canDrop,
    copyModeModifierKey,
    groupModeModifierKey,
    noDragPreview,
  });

  return <BaseRuleGroupComponent {...props} {...dndRefs} />;
};

interface UseRuleGroupDndParams
  extends RuleGroupProps,
    Omit<QueryBuilderDndContextProps, 'baseControls' | 'useDrag' | 'useDrop'> {
  useDrag: typeof useDragOriginal;
  useDrop: typeof useDropOriginal;
}

const accept: [DndDropTargetType, DndDropTargetType] = ['rule', 'ruleGroup'];

/**
 * @group Hooks
 */
export const useRuleGroupDnD = (params: UseRuleGroupDndParams): UseRuleGroupDnD => {
  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLSpanElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const {
    disabled,
    path,
    ruleGroup,
    schema,
    actions,
    useDrag,
    useDrop,
    canDrop,
    copyModeModifierKey = 'alt',
    groupModeModifierKey = 'ctrl',
    noDragPreview,
  } = params;

  const [{ isDragging, dragMonitorId }, drag, preview] = useDragCommon({
    type: 'ruleGroup',
    path,
    disabled,
    independentCombinators: schema.independentCombinators,
    schema,
    actions,
    useDrag,
    copyModeModifierKey,
    groupModeModifierKey,
    noDragPreview,
  });

  const [{ isOver, dropMonitorId, dropEffect, groupItems, dropNotAllowed }, drop] = useDrop<
    DraggedItem,
    DropResult,
    DropCollection
  >(
    () => ({
      accept,
      canDrop: dragging => {
        if (
          disabled ||
          (dragging &&
            typeof canDrop === 'function' &&
            !canDrop({ dragging, hovering: { ...ruleGroup, path, qbId: schema.qbId } }))
        ) {
          return false;
        }

        if (schema.qbId !== dragging.qbId) return true;

        const parentItemPath = getParentPath(dragging.path);
        const itemIndex = dragging.path.at(-1);
        // Disallow drop if...
        // prettier-ignore
        return !(
          // 1) item is ancestor of drop target, OR
          isAncestor(dragging.path, path) ||
          // 2) item is first child and is dropped on its own group header, OR
          (pathsAreEqual(path, parentItemPath) && itemIndex === 0) ||
          // 3) the group is dropped on itself
          pathsAreEqual(path, dragging.path)
        );
      },
      collect: monitor => ({
        dropNotAllowed: monitor.isOver() && !monitor.canDrop(),
        isOver: monitor.canDrop() && monitor.isOver(),
        dropMonitorId: monitor.getHandlerId() ?? '',
        dropEffect: isHotkeyPressed(copyModeModifierKey) ? 'copy' : 'move',
        groupItems: isHotkeyPressed(groupModeModifierKey),
      }),
      drop: () => {
        const { qbId, getQuery, dispatchQuery } = schema;
        const dropEffect = isHotkeyPressed(copyModeModifierKey) ? 'copy' : 'move';
        const groupItems = isHotkeyPressed(groupModeModifierKey);

        return { type: 'ruleGroup', path, qbId, getQuery, dispatchQuery, groupItems, dropEffect };
      },
    }),
    [disabled, actions.groupRule, actions.moveRule, path, canDrop, ruleGroup, schema]
  );

  React.useEffect(() => {
    if (path.length > 0) {
      drag(dragRef);
      preview(noDragPreview ? getEmptyImage() : previewRef);
    }
    drop(dropRef);
  }, [drag, drop, noDragPreview, path.length, preview]);

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
