import { c, standardClassnames, TestID } from 'react-querybuilder';
import { useInlineCombinatorDnD } from './internal/hooks';
import type { InlineCombinatorDndProps } from './types';

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
