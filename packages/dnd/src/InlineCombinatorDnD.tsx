import { useContext } from 'react';
import type { InlineCombinatorProps } from 'react-querybuilder';
import { c, standardClassnames, TestID } from 'react-querybuilder';
import { useInlineCombinatorDnD } from './hooks';
import { QueryBuilderDndContext } from './QueryBuilderDndContext';

export const InlineCombinatorDnD = ({
  component: CombinatorSelectorComponent,
  path,
  independentCombinators,
  ...props
}: InlineCombinatorProps) => {
  const { useDrop } = useContext(QueryBuilderDndContext);

  const { dropRef, dropMonitorId, isOver } = useInlineCombinatorDnD({
    path,
    independentCombinators,
    useDrop: useDrop!,
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
