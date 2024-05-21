import { useRef } from 'react';
import type {
  DndDropTargetType,
  DraggedItem,
  DropCollection,
  DropResult,
  RuleGroupProps,
  UseRuleGroupDnD,
} from 'react-querybuilder';
import { getParentPath, isAncestor, pathsAreEqual } from 'react-querybuilder';
import type { QueryBuilderDndContextProps } from '../types';
import { useDragCommon } from './useDragCommon';

type UseRuleGroupDndParams = RuleGroupProps &
  Pick<QueryBuilderDndContextProps, 'canDrop'> &
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  Pick<typeof import('react-dnd'), 'useDrag' | 'useDrop'>;

const accept: [DndDropTargetType, DndDropTargetType] = ['rule', 'ruleGroup'];

export const useRuleGroupDnD = (params: UseRuleGroupDndParams): UseRuleGroupDnD => {
  const {
    disabled,
    path,
    ruleGroup,
    schema: { independentCombinators },
    actions: { moveRule },
    useDrag,
    useDrop,
    canDrop,
    ruleGroup: hoveringItem,
  } = params;

  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLSpanElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const [{ isDragging, dragMonitorId }, drag, preview] = useDragCommon({
    type: 'ruleGroup',
    path,
    ruleOrGroup: ruleGroup,
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
          disabled ||
          (dragging &&
            typeof canDrop === 'function' &&
            !canDrop({ dragging, hovering: { ...hoveringItem, path } }))
        ) {
          return false;
        }
        const parentItemPath = getParentPath(dragging.path);
        const itemIndex = dragging.path[dragging.path.length - 1];
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
