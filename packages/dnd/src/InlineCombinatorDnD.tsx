import * as React from 'react';
import { useContext } from 'react';
import type { InlineCombinatorProps } from 'react-querybuilder';
import { standardClassnames, TestID } from 'react-querybuilder';
import { QueryBuilderDndContext } from './QueryBuilderDndContext';

/**
 * The drag-and-drop-enabled inline combinator component.
 *
 * @group Components
 */
export const InlineCombinatorDnD = ({
  component: CombinatorSelectorComponent,
  ...props
}: InlineCombinatorProps): React.JSX.Element => {
  const { adapter, canDrop, copyModeModifierKey, groupModeModifierKey } =
    useContext(QueryBuilderDndContext);

  const { dropRef, dropMonitorId, isOver } = adapter!.useInlineCombinatorDnD({
    path: props.path,
    schema: props.schema,
    rules: props.rules,
    canDrop,
    copyModeModifierKey: copyModeModifierKey ?? 'alt',
    groupModeModifierKey: groupModeModifierKey ?? 'ctrl',
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

/**
 * @group Hooks
 * @deprecated Access via the adapter instead: `adapter.useInlineCombinatorDnD(params)`.
 */
export { type AdapterUseInlineCombinatorDnDResult as UseInlineCombinatorDnDResult } from './adapter';
