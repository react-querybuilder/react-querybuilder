/* eslint-disable @typescript-eslint/consistent-type-imports */
import { useRef, type Ref } from 'react';
import { DNDType } from '../../defaults';
import { DraggedItem, QueryActions } from '../../types';
import { getParentPath, isAncestor, pathsAreEqual } from '../../utils';

interface UseRuleGroupDndParams {
  path: number[];
  disabled?: boolean;
  moveRule: QueryActions['moveRule'];
  useDrag: typeof import('react-dnd')['useDrag'];
  useDrop: typeof import('react-dnd')['useDrop'];
}

interface UseRuleGroupDnD {
  isDragging: boolean;
  dragMonitorId: string | symbol | null;
  isOver: boolean;
  dropMonitorId: string | symbol | null;
  previewRef: Ref<HTMLDivElement>;
  dragRef: Ref<HTMLSpanElement>;
  dropRef: Ref<HTMLDivElement>;
}

export const useRuleGroupDnD = ({
  disabled,
  path,
  moveRule,
  useDrag,
  useDrop,
}: UseRuleGroupDndParams): UseRuleGroupDnD => {
  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLSpanElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const [{ isDragging, dragMonitorId }, drag, preview] = useDrag(
    () => ({
      type: DNDType.ruleGroup,
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
        const parentItemPath = getParentPath(item.path);
        const itemIndex = item.path[item.path.length - 1];
        // Don't allow drop if 1) item is ancestor of drop target,
        // 2) item is first child and is dropped on its own group header,
        // or 3) the group is dropped on itself
        return !(
          isAncestor(item.path, path) ||
          (pathsAreEqual(path, parentItemPath) && itemIndex === 0) ||
          pathsAreEqual(path, item.path)
        );
      },
      collect: monitor => ({
        isOver: monitor.canDrop() && monitor.isOver(),
        dropMonitorId: monitor.getHandlerId(),
      }),
      drop: (item: DraggedItem, _monitor) => !disabled && moveRule(item.path, [...path, 0]),
    }),
    [disabled, moveRule, path]
  );

  if (path.length > 0) {
    drag(dragRef);
    preview(previewRef);
  }
  drop(dropRef);

  return { isDragging, dragMonitorId, isOver, dropMonitorId, previewRef, dragRef, dropRef };
};
