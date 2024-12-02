import * as React from 'react';
import { useContext, useRef } from 'react';
import type { useDrag as useDragOriginal, useDrop as useDropOriginal } from 'react-dnd';
import type {
  DndDropTargetType,
  DraggedItem,
  DropCollection,
  DropResult,
  RuleProps,
  UseRuleDnD,
} from 'react-querybuilder';
import { getParentPath, isAncestor, pathsAreEqual } from 'react-querybuilder';
import { QueryBuilderDndContext } from './QueryBuilderDndContext';
import { dropEffectListener } from './dropEffectListener';
import { useDragCommon } from './useDragCommon';
import type { QueryBuilderDndContextProps } from './types';

/**
 * Rule component for drag-and-drop. Renders the provided rule component
 * ({@link Rule} by default), but forwards the drag-and-drop context.
 */
export const RuleDnD = (props: RuleProps): React.JSX.Element => {
  const rqbDndContext = useContext(QueryBuilderDndContext);

  const { canDrop, useDrag, useDrop } = rqbDndContext;

  const disabled = !!props.parentDisabled || !!props.disabled;

  const dndRefs = useRuleDnD({
    ...props,
    disabled,
    useDrag: useDrag!,
    useDrop: useDrop!,
    canDrop,
  });

  const { rule: BaseRuleComponent } = rqbDndContext.baseControls;

  return (
    <QueryBuilderDndContext.Provider value={rqbDndContext}>
      <BaseRuleComponent {...props} {...dndRefs} />
    </QueryBuilderDndContext.Provider>
  );
};

type UseRuleDndParams = RuleProps &
  Pick<QueryBuilderDndContextProps, 'canDrop'> & {
    useDrag: typeof useDragOriginal;
    useDrop: typeof useDropOriginal;
  };

const accept: [DndDropTargetType, DndDropTargetType] = ['rule', 'ruleGroup'];

export const useRuleDnD = (params: UseRuleDndParams): UseRuleDnD => {
  const { path, rule, disabled, schema, actions, useDrag, useDrop, canDrop } = params;

  const dndRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLSpanElement>(null);

  const [{ isDragging, dragMonitorId }, drag, preview] = useDragCommon({
    type: 'rule',
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
          dragging &&
          typeof canDrop === 'function' &&
          !canDrop({ dragging, hovering: { ...rule, path, qbId: schema.qbId } })
        ) {
          return false;
        }

        if (schema.qbId !== dragging.qbId) return true;

        const parentHoverPath = getParentPath(path);
        const parentItemPath = getParentPath(dragging.path);
        const hoverIndex = path.at(-1);
        const itemIndex = dragging.path.at(-1)!;

        // Disallow drop if...
        // prettier-ignore
        return !(
          // 1) item is ancestor of drop target,
          isAncestor(dragging.path, path) ||
          // 2) item is hovered over itself or the previous item
          (pathsAreEqual(parentHoverPath, parentItemPath) &&
            (hoverIndex === itemIndex ||
              hoverIndex === itemIndex - 1 ||
              (schema.independentCombinators && hoverIndex === itemIndex - 2)))
        );
      },
      collect: monitor => ({
        isOver: monitor.canDrop() && monitor.isOver(),
        dropMonitorId: monitor.getHandlerId() ?? '',
        dropEffect: monitor.getDropResult()?.dropEffect ?? dropEffectListener,
      }),
      drop: () => {
        const { qbId, getQuery, dispatchQuery } = schema;
        // `dropEffect` gets added automatically to the object returned from `drop`:
        return { type: 'rule', path, qbId, getQuery, dispatchQuery };
      },
    }),
    [disabled, actions.moveRule, path, canDrop, rule, schema]
  );

  drag(dragRef);
  preview(drop(dndRef));

  return { isDragging, dragMonitorId, isOver, dropMonitorId, dndRef, dragRef, dropEffect };
};
