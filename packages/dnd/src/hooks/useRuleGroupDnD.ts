import type {
  DndDropTargetType,
  DraggedItem,
  DropCollection,
  DropResult,
  QueryActions,
  UseRuleGroupDnD,
} from '@react-querybuilder/ts';
import { useRef } from 'react';
import {
  getCommonAncestorPath,
  getParentPath,
  isAncestor,
  pathsAreEqual,
} from 'react-querybuilder';
import { useDragCommon } from './useDragCommon';

interface UseRuleGroupDndParams {
  path: number[];
  disabled?: boolean;
  independentCombinators?: boolean;
  moveWhileDragging?: boolean;
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
  moveWhileDragging,
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
    moveWhileDragging,
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
        isOver: !moveWhileDragging && monitor.canDrop() && monitor.isOver(),
        dropMonitorId: monitor.getHandlerId() ?? '',
        dropEffect: monitor.getDropResult()?.dropEffect,
      }),
      // `dropEffect` gets added automatically to the object returned from `drop`:
      drop: (_item, monitor) => monitor.getDropResult() ?? { type: 'ruleGroup', path },
      hover: !moveWhileDragging
        ? undefined
        : (item, monitor) => {
            if (monitor.canDrop()) {
              moveRule(item.path, [...path, 0]);

              const newPath = [...path, 0];
              const commonAncestorPath = getCommonAncestorPath(item.path, path);
              if (
                item.path.length === commonAncestorPath.length + 1 &&
                path[commonAncestorPath.length] > item.path[commonAncestorPath.length]
              ) {
                // Getting here means there will be a shift of paths upward at the common
                // ancestor level because the object at `item.path` will be spliced out. The
                // real new path should therefore be one or two higher than `path`.
                newPath[commonAncestorPath.length] -= independentCombinators ? 2 : 1;
              }

              item.path = newPath;
            }
          },
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
