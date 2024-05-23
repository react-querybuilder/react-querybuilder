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
  const {
    path,
    rule,
    disabled,
    schema: { independentCombinators },
    actions: { moveRule },
    useDrag,
    useDrop,
    canDrop,
    rule: hoveringItem,
  } = params;

  const dndRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLSpanElement>(null);

  const [{ isDragging, dragMonitorId }, drag, preview] = useDragCommon({
    type: 'rule',
    path,
    ruleOrGroup: rule,
    disabled,
    independentCombinators,
    moveRule,
    useDrag,
  });

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
          !canDrop({ dragging, hovering: { ...hoveringItem, path } })
        ) {
          return false;
        }
        const parentHoverPath = getParentPath(path);
        const parentItemPath = getParentPath(dragging.path);
        const hoverIndex = path[path.length - 1];
        const itemIndex = dragging.path[dragging.path.length - 1];

        // Disallow drop if...
        // prettier-ignore
        return !(
          // 1) item is ancestor of drop target,
          isAncestor(dragging.path, path) ||
          // 2) item is hovered over itself or the previous item
          (pathsAreEqual(parentHoverPath, parentItemPath) &&
            (hoverIndex === itemIndex ||
              hoverIndex === itemIndex - 1 ||
              (independentCombinators && hoverIndex === itemIndex - 2)))
        );
      },
      collect: monitor => ({
        isOver: monitor.canDrop() && monitor.isOver(),
        dropMonitorId: monitor.getHandlerId() ?? '',
        dropEffect: (monitor.getDropResult() ?? {}).dropEffect,
      }),
      // `dropEffect` gets added automatically to the object returned from `drop`:
      drop: () => ({ type: 'rule', path }),
    }),
    [disabled, independentCombinators, moveRule, path]
  );

  drag(dragRef);
  preview(drop(dndRef));

  return { isDragging, dragMonitorId, isOver, dropMonitorId, dndRef, dragRef, dropEffect };
};
