import { useDrop } from 'react-dnd';
import { dndTypes, standardClassnames } from './defaults';
import { CombinatorSelectorProps, DraggedItem, Schema } from './types';
import { c, getParentPath, isAncestor, pathsAreEqual } from './utils';

interface InlineCombinatorProps extends CombinatorSelectorProps {
  component: Schema['controls']['combinatorSelector'];
  path: number[];
  moveRule: Schema['moveRule'];
  independentCombinators: boolean;
}

export const InlineCombinator = ({
  component: CombinatorSelectorComponent,
  path,
  moveRule,
  independentCombinators,
  ...props
}: InlineCombinatorProps) => {
  const [{ isOver, dropMonitorId }, drop] = useDrop(
    () => ({
      accept: [dndTypes.rule, dndTypes.ruleGroup],
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
      collect: (monitor) => ({
        isOver: monitor.canDrop() && monitor.isOver(),
        dropMonitorId: monitor.getHandlerId()
      }),
      drop: (item: DraggedItem, _monitor) => {
        const parentPath = getParentPath(path);
        const index = path[path.length - 1];
        moveRule(item.path, [...parentPath, index]);
      }
    }),
    [moveRule, path, independentCombinators]
  );

  const dndOver = isOver ? standardClassnames.dndOver : '';
  const wrapperClassName = c(dndOver, standardClassnames.betweenRules);

  return (
    <div
      ref={drop}
      className={wrapperClassName}
      data-dropmonitorid={dropMonitorId}
      data-testid="inline-combinator">
      <CombinatorSelectorComponent {...props} />
    </div>
  );
};

InlineCombinator.displayName = 'InlineCombinator';
