import { standardClassnames, TestID } from './defaults';
import { c } from './internal';
import { useInlineCombinatorDnD } from './internal/hooks';
import type { CombinatorSelectorProps, QueryActions, Schema } from './types';

interface InlineCombinatorDndProps extends CombinatorSelectorProps {
  component: Schema['controls']['combinatorSelector'];
  path: number[];
  moveRule: QueryActions['moveRule'];
  independentCombinators: boolean;
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  useDrop: typeof import('react-dnd')['useDrop'];
}

export const InlineCombinatorDnD = ({
  component: CombinatorSelectorComponent,
  path,
  moveRule,
  independentCombinators,
  useDrop,
  ...props
}: InlineCombinatorDndProps) => {
  const { dropRef, dropMonitorId, isOver } = useInlineCombinatorDnD({
    path,
    independentCombinators,
    moveRule,
    useDrop,
  });

  const dndOver = isOver ? standardClassnames.dndOver : '';
  const wrapperClassName = c(dndOver, standardClassnames.betweenRules);

  return (
    <div
      key="dnd"
      ref={dropRef}
      className={wrapperClassName}
      data-dropmonitorid={dropMonitorId}
      data-testid={TestID.inlineCombinator}>
      <CombinatorSelectorComponent {...props} path={path} testID={TestID.combinators} />
    </div>
  );
};

InlineCombinatorDnD.displayName = 'InlineCombinatorDnD';
