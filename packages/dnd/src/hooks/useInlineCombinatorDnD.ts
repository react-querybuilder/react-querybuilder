import type {
  DndDropTargetType,
  DraggedItem,
  DropCollection,
  DropEffect,
  DropResult,
} from '@react-querybuilder/ts';
import type { Ref } from 'react';
import { useRef } from 'react';
import { getParentPath, isAncestor, pathsAreEqual } from 'react-querybuilder';

interface UseInlineCombinatorDndParams {
  path: number[];
  independentCombinators?: boolean;
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  useDrop: typeof import('react-dnd')['useDrop'];
}

interface UseInlineCombinatorDnD {
  isOver: boolean;
  dropMonitorId: string | symbol | null;
  dropRef: Ref<HTMLDivElement>;
  dropEffect?: DropEffect;
}

export const useInlineCombinatorDnD = ({
  path,
  independentCombinators,
  useDrop,
}: UseInlineCombinatorDndParams): UseInlineCombinatorDnD => {
  const dropRef = useRef<HTMLDivElement>(null);

  const [{ isOver, dropMonitorId }, drop] = useDrop<DraggedItem, DropResult, DropCollection>(
    () => ({
      accept: ['rule', 'ruleGroup'] as DndDropTargetType[],
      canDrop: (item: DraggedItem) => {
        const parentHoverPath = getParentPath(path);
        const parentItemPath = getParentPath(item.path);
        const hoverIndex = path[path.length - 1];
        const itemIndex = item.path[item.path.length - 1];

        // Don't allow drop if 1) item is ancestor of drop target,
        // 2) item is hovered over itself (this should never happen since
        // combinators don't have drag handles), or 3) combinators are
        // independent and the drop target is just above the hovering item.
        return !(
          isAncestor(item.path, path) ||
          pathsAreEqual(item.path, path) ||
          (pathsAreEqual(parentHoverPath, parentItemPath) && hoverIndex - 1 === itemIndex) ||
          (independentCombinators &&
            pathsAreEqual(parentHoverPath, parentItemPath) &&
            hoverIndex === itemIndex - 1)
        );
      },
      collect: monitor => ({
        isOver: monitor.canDrop() && monitor.isOver(),
        dropMonitorId: monitor.getHandlerId() ?? '',
        dropEffect: (monitor.getDropResult() ?? {}).dropEffect,
      }),
      drop: () => ({ type: 'inlineCombinator', path }),
    }),
    [path, independentCombinators]
  );

  drop(dropRef);

  return { dropRef, dropMonitorId, isOver };
};
