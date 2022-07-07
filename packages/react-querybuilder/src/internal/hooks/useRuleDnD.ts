/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Ref, useRef } from 'react';
import { DNDType } from '../../defaults';
import type { DraggedItem, QueryActions } from '../../types';
import { getParentPath, isAncestor, pathsAreEqual } from '../../utils';

interface UseRuleDndParams {
  path: number[];
  disabled?: boolean;
  independentCombinators?: boolean;
  moveRule: QueryActions['moveRule'];
  useDrag: typeof import('react-dnd')['useDrag'];
  useDrop: typeof import('react-dnd')['useDrop'];
}

interface UseRuleDnD {
  isDragging: boolean;
  dragMonitorId: string | symbol | null;
  isOver: boolean;
  dropMonitorId: string | symbol | null;
  dragRef: Ref<HTMLSpanElement>;
  dndRef: Ref<HTMLDivElement>;
}

export const useRuleDnD = ({
  path,
  disabled,
  independentCombinators,
  moveRule,
  useDrag,
  useDrop,
}: UseRuleDndParams): UseRuleDnD => {
  const dndRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLSpanElement>(null);

  const [{ isDragging, dragMonitorId }, drag, preview] = useDrag(
    () => ({
      type: DNDType.rule,
      item: (): DraggedItem => ({ path }),
      canDrag: !disabled,
      collect: monitor => ({
        isDragging: !disabled && monitor.isDragging(),
        dragMonitorId: monitor.getHandlerId(),
      }),
    }),
    [disabled, path]
  );

  const [{ isOver, dropMonitorId }, drop] = useDrop(
    () => ({
      accept: [DNDType.rule, DNDType.ruleGroup],
      canDrop: (item: DraggedItem) => {
        if (disabled) return false;
        const parentHoverPath = getParentPath(path);
        const parentItemPath = getParentPath(item.path);
        const hoverIndex = path[path.length - 1];
        const itemIndex = item.path[item.path.length - 1];

        // Don't allow drop if 1) item is ancestor of drop target,
        // or 2) item is hovered over itself or the previous item
        return !(
          isAncestor(item.path, path) ||
          (pathsAreEqual(parentHoverPath, parentItemPath) &&
            (hoverIndex === itemIndex ||
              hoverIndex === itemIndex - 1 ||
              (independentCombinators && hoverIndex === itemIndex - 2)))
        );
      },
      collect: monitor => ({
        isOver: monitor.canDrop() && monitor.isOver(),
        dropMonitorId: monitor.getHandlerId(),
      }),
      drop: (item: DraggedItem, _monitor) => {
        const parentHoverPath = getParentPath(path);
        const hoverIndex = path[path.length - 1];

        moveRule(item.path, [...parentHoverPath, hoverIndex + 1]);
      },
    }),
    [disabled, independentCombinators, moveRule, path]
  );

  drag(dragRef);
  preview(drop(dndRef));

  return { isDragging, dragMonitorId, isOver, dropMonitorId, dndRef, dragRef };
};
