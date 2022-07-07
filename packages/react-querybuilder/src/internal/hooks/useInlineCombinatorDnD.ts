import { useRef, type Ref } from 'react';
import { DNDType } from '../../defaults';
import type { DraggedItem, QueryActions } from '../../types';
import { getParentPath, isAncestor, pathsAreEqual } from '../../utils';

interface UseInlineCombinatorDndParams {
  path: number[];
  independentCombinators?: boolean;
  moveRule: QueryActions['moveRule'];
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  useDrop: typeof import('react-dnd')['useDrop'];
}

interface UseInlineCombinatorDnD {
  isOver: boolean;
  dropMonitorId: string | symbol | null;
  dropRef: Ref<HTMLDivElement>;
}

export const useInlineCombinatorDnD = ({
  path,
  independentCombinators,
  moveRule,
  useDrop,
}: UseInlineCombinatorDndParams): UseInlineCombinatorDnD => {
  const dropRef = useRef<HTMLDivElement>(null);

  const [{ isOver, dropMonitorId }, drop] = useDrop(
    () => ({
      accept: [DNDType.rule, DNDType.ruleGroup],
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
        dropMonitorId: monitor.getHandlerId(),
      }),
      drop: (item: DraggedItem, _monitor) => {
        const parentPath = getParentPath(path);
        const index = path[path.length - 1];
        moveRule(item.path, [...parentPath, index]);
      },
    }),
    [moveRule, path, independentCombinators]
  );

  drop(dropRef);

  return { dropRef, dropMonitorId, isOver };
};
