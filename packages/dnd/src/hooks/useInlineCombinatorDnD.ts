import type { Ref } from 'react';
import { useRef } from 'react';
import type {
  DndDropTargetType,
  DraggedItem,
  DropCollection,
  DropEffect,
  DropResult,
  InlineCombinatorProps,
  RuleGroupTypeAny,
  RuleType,
} from 'react-querybuilder';
import { getParentPath, isAncestor, pathsAreEqual } from 'react-querybuilder';
import type { QueryBuilderDndContextProps } from '../types';

type UseInlineCombinatorDndParams = InlineCombinatorProps &
  Pick<QueryBuilderDndContextProps, 'canDrop'> &
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  Pick<typeof import('react-dnd'), 'useDrop'>;

interface UseInlineCombinatorDnD {
  isOver: boolean;
  dropMonitorId: string | symbol | null;
  dropRef: Ref<HTMLDivElement>;
  dropEffect?: DropEffect;
}

export const useInlineCombinatorDnD = ({
  path,
  canDrop,
  schema: { independentCombinators },
  useDrop,
  rules,
}: UseInlineCombinatorDndParams): UseInlineCombinatorDnD => {
  const dropRef = useRef<HTMLDivElement>(null);

  // The "hovering" item is the rule or group which precedes this inline combinator.
  const hoveringItem = (rules ?? /* istanbul ignore next */ [])[path[path.length - 1] - 1] as
    | RuleType
    | RuleGroupTypeAny;

  const [{ isOver, dropMonitorId }, drop] = useDrop!<DraggedItem, DropResult, DropCollection>(
    () => ({
      accept: ['rule', 'ruleGroup'] as DndDropTargetType[],
      canDrop: dragging => {
        const { path: itemPath } = dragging;
        if (
          dragging &&
          typeof canDrop === 'function' &&
          !canDrop({ dragging, hovering: { ...hoveringItem, path } })
        ) {
          return false;
        }
        const parentHoverPath = getParentPath(path);
        const parentItemPath = getParentPath(itemPath);
        const hoverIndex = path[path.length - 1];
        const itemIndex = itemPath[itemPath.length - 1];

        // Disallow drop if...
        // prettier-ignore
        return !(
          // 1) the item is an ancestor of the drop target,
          isAncestor(itemPath, path) ||
          // 2) the item is hovered over itself (which should never
          // happen since combinators don't have drag handles),
          pathsAreEqual(itemPath, path) ||
          (pathsAreEqual(parentHoverPath, parentItemPath) && hoverIndex - 1 === itemIndex) ||
          // 3) independentCombinators is true and the drop target is just above the hovering item
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
