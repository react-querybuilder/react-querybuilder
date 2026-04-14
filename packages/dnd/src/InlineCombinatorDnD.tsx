import * as React from 'react';
import { useContext } from 'react';
import type { InlineCombinatorProps } from 'react-querybuilder';
import { standardClassnames, TestID } from 'react-querybuilder';
import { DragPreviewContext } from './DragPreviewContext';
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
  const { dragPreviewState } = useContext(DragPreviewContext);

  // When updateWhileDragging is active, suppress drop indicator
  const isUpdateWhileDragging = dragPreviewState !== null;

  const { dropRef, dropMonitorId, isOver } = adapter!.useInlineCombinatorDnD({
    path: props.path,
    schema: props.schema,
    rules: props.rules,
    canDrop,
    copyModeModifierKey: copyModeModifierKey ?? 'alt',
    groupModeModifierKey: groupModeModifierKey ?? 'ctrl',
  });

  // Suppress isOver when updateWhileDragging is active
  // v8 ignore next -- same pattern as RuleDnD/RuleGroupDnD; IC only used in specific mode
  const effectiveIsOver = isUpdateWhileDragging ? false : isOver;

  const wrapperClassName = [
    props.schema.suppressStandardClassnames || standardClassnames.betweenRules,
    (effectiveIsOver && !props.schema.classNames.dndOver) || false,
    (effectiveIsOver && !props.schema.suppressStandardClassnames && standardClassnames.dndOver) ||
      false,
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
