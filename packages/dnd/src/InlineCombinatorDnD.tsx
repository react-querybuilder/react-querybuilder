import * as React from 'react';
import { useContext } from 'react';
import type { InlineCombinatorProps } from 'react-querybuilder';
import { standardClassnames, TestID } from 'react-querybuilder';
import { useInlineCombinatorDnD } from './hooks';
import { QueryBuilderDndContext } from './QueryBuilderDndContext';

/**
 * The drag-and-drop-enabled inline combinator component.
 */
export const InlineCombinatorDnD = ({
  component: CombinatorSelectorComponent,
  ...props
}: InlineCombinatorProps): React.JSX.Element => {
  const { canDrop, useDrop } = useContext(QueryBuilderDndContext);

  const { dropRef, dropMonitorId, isOver } = useInlineCombinatorDnD({
    ...props,
    component: CombinatorSelectorComponent,
    useDrop: useDrop!,
    canDrop,
  });

  const wrapperClassName = [
    props.schema.suppressStandardClassnames || standardClassnames.betweenRules,
    (isOver && !props.schema.classNames.dndOver) || false,
    (isOver && !props.schema.suppressStandardClassnames && standardClassnames.dndOver) || false,
  ]
    .filter(c => typeof c === 'string')
    .join(' ');

  return (
    <div
      key="dnd"
      ref={dropRef}
      className={wrapperClassName}
      data-dropmonitorid={dropMonitorId}
      data-testid={TestID.inlineCombinator}>
      <CombinatorSelectorComponent {...props} testID={TestID.combinators} />
    </div>
  );
};
