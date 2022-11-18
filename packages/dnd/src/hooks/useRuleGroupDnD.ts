import type {
  DndDropTargetType,
  DraggedItem,
  DropCollection,
  DropResult,
  QueryActions,
  UseRuleGroupDnD,
} from '@react-querybuilder/ts';
import { useRef } from 'react';
import { getParentPath, isAncestor, pathsAreEqual } from 'react-querybuilder';
import { useDragCommon } from './useDragCommon';

interface UseRuleGroupDndParams {
  path: number[];
  disabled?: boolean;
  independentCombinators?: boolean;
  moveRule: QueryActions['moveRule'];
  /* eslint-disable-next-line @typescript-eslint/consistent-type-imports */
  useDrag: typeof import('react-dnd')['useDrag'];
  /* eslint-disable-next-line @typescript-eslint/consistent-type-imports */
  useDrop: typeof import('react-dnd')['useDrop'];
}

export const useRuleGroupDnD = ({
  disabled,
  path,
  independentCombinators,
  moveRule,
  useDrag,
  useDrop,
}: UseRuleGroupDndParams): UseRuleGroupDnD => {
  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLSpanElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const [{ isDragging, dragMonitorId }, drag, preview] = useDragCommon({
    type: 'ruleGroup',
    path,
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
      accept: ['rule', 'ruleGroup'] as DndDropTargetType[],
      canDrop: item => {
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
        dropMonitorId: monitor.getHandlerId() ?? '',
        dropEffect: (monitor.getDropResult() ?? {}).dropEffect,
      }),
      // `dropEffect` gets added automatically to the object returned from `drop`:
      drop: (_item, monitor) => monitor.getDropResult() ?? { type: 'ruleGroup', path },
    }),
    [disabled, moveRule, path]
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
