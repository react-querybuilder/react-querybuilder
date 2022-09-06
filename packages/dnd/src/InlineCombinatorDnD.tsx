import { QueryBuilderContext } from '@react-querybuilder/ctx';
import { useContext } from 'react';
import type { InlineCombinatorProps } from 'react-querybuilder';
import { c, defaultControlElements, standardClassnames, TestID } from 'react-querybuilder';
import { useInlineCombinatorDnD } from './hooks';
import { QueryBuilderDndContext } from './QueryBuilderDndContext';

export const InlineCombinatorDnD = (props: InlineCombinatorProps) => {
  const rqbContext = useContext(QueryBuilderContext);
  const { useDrop } = useContext(QueryBuilderDndContext);
  const { path, moveRule, independentCombinators } = props;

  const { dropRef, dropMonitorId, isOver } = useInlineCombinatorDnD({
    path,
    independentCombinators,
    moveRule,
    useDrop: useDrop!,
  });

  const dndOver = isOver ? standardClassnames.dndOver : '';
  const wrapperClassName = c(dndOver, standardClassnames.betweenRules);

  const CombinatorSelectorComponent =
    rqbContext.controlElements?.combinatorSelector ?? defaultControlElements.combinatorSelector;

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
