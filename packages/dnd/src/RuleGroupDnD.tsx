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
import { dropEffectListener } from './dropEffectListener';
import { QueryBuilderDndContext } from './QueryBuilderDndContext';
import type { QueryBuilderDndContextProps } from './types';
import { useDragCommon } from './useDragCommon';

/**
 * Rule group component for drag-and-drop. Renders the provided rule group component
 * ({@link react-querybuilder!index.RuleGroup RuleGroup} by default), but forwards the drag-and-drop
 * context so that child rules and groups will render within the appropriate drag-and-drop wrappers.
 *
 * @group Components
 */
export const RuleGroupDnD = (props: RuleGroupProps): React.JSX.Element => {
  const rqbDndContext = useContext(QueryBuilderDndContext);

  const { canDrop, useDrag, useDrop } = rqbDndContext;

  const disabled = !!props.parentDisabled || !!props.disabled;

  const dndRefs = useRuleGroupDnD({
    ...props,
    disabled,
    useDrag: useDrag!,
    useDrop: useDrop!,
    canDrop,
  });

  const { ruleGroup: BaseRuleGroupComponent } = rqbDndContext.baseControls;

  return <BaseRuleGroupComponent {...props} {...dndRefs} />;
};

type UseRuleGroupDndParams = RuleGroupProps &
  Pick<QueryBuilderDndContextProps, 'canDrop'> & {
    useDrag: typeof useDragOriginal;
    useDrop: typeof useDropOriginal;
  };

const accept: [DndDropTargetType, DndDropTargetType] = ['rule', 'ruleGroup'];

/**
 * @group Hooks
 */
export const useRuleGroupDnD = (params: UseRuleGroupDndParams): UseRuleGroupDnD => {
  const { disabled, path, ruleGroup, schema, actions, useDrag, useDrop, canDrop } = params;

  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLSpanElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const [{ isDragging, dragMonitorId }, drag, preview] = useDragCommon({
    type: 'ruleGroup',
    path,
    disabled,
    independentCombinators: schema.independentCombinators,
    moveRule: actions.moveRule,
    schema,
    actions,
    useDrag,
  });

  // eslint-disable-next-line react-compiler/react-compiler
  const [{ isOver, dropMonitorId, dropEffect }, drop] = useDrop<
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
          // 1) item is ancestor of drop target,
          isAncestor(dragging.path, path) ||
          // 2) item is first child and is dropped on its own group header,
          (pathsAreEqual(path, parentItemPath) && itemIndex === 0) ||
          // 3) the group is dropped on itself
          pathsAreEqual(path, dragging.path)
        );
      },
      collect: monitor => ({
        isOver: monitor.canDrop() && monitor.isOver(),
        dropMonitorId: monitor.getHandlerId() ?? '',
        dropEffect: monitor.getDropResult()?.dropEffect ?? dropEffectListener,
      }),
      drop: (_item, monitor) => {
        const { qbId, getQuery, dispatchQuery } = schema;

        // `dropEffect` gets added automatically to the object returned from `drop`:
        return (
          monitor.getDropResult() ?? { type: 'ruleGroup', path, qbId, getQuery, dispatchQuery }
        );
      },
    }),
    [disabled, actions.moveRule, path, canDrop, ruleGroup, schema]
  );

  if (path.length > 0) {
    drag(dragRef);
    preview(previewRef);
  }
  drop(dropRef);

  return {
    isDragging,
    dragMonitorId,
    isOver,
    dropMonitorId,
    previewRef,
    dragRef,
    dropRef,
    dropEffect,
  };
};
