import { useRef } from 'react';
import type {
  DndDropTargetType,
  DraggedItem,
  DropCollection,
  DropResult,
  RuleProps,
  UseRuleDnD,
} from 'react-querybuilder';
import { getParentPath, isAncestor, pathsAreEqual } from 'react-querybuilder';
import type { QueryBuilderDndContextProps } from '../types';
import { useDragCommon } from './useDragCommon';

type UseRuleDndParams = RuleProps &
  Pick<QueryBuilderDndContextProps, 'canDrop'> &
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  Pick<typeof import('react-dnd'), 'useDrag' | 'useDrop'>;

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
  const [{ isOver, dropMonitorId, dropEffect }, drop] = useDrop!<
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
        dropEffect: (monitor.getDropResult() ?? {}).dropEffect,
      }),
      drop: () => {
        const { qbId, getQuery, dispatchQuery } = schema;
        // `dropEffect` gets added automatically to the object returned from `drop`:
        return { type: 'rule', path, qbId, getQuery, dispatchQuery };
      },
    }),
    [disabled, schema.independentCombinators, actions.moveRule, path]
  );

  drag(dragRef);
  preview(drop(dndRef));

  return { isDragging, dragMonitorId, isOver, dropMonitorId, dndRef, dragRef, dropEffect };
};
