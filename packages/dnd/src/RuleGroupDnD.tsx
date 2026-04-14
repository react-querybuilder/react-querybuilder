import * as React from 'react';
import { useContext } from 'react';
import type { RuleGroupProps } from 'react-querybuilder';
import { QueryBuilderDndContext } from './QueryBuilderDndContext';

/**
 * Rule group component for drag-and-drop. Renders the provided rule group component
 * ({@link react-querybuilder!RuleGroup RuleGroup} by default), but forwards the drag-and-drop
 * context so that child rules and groups will render within the appropriate drag-and-drop wrappers.
 *
 * @group Components
 */
export const RuleGroupDnD = (props: RuleGroupProps): React.JSX.Element => {
  const rqbDndContext = useContext(QueryBuilderDndContext);

  const {
    adapter,
    canDrop,
    baseControls: { ruleGroup: BaseRuleGroupComponent },
    copyModeModifierKey,
    groupModeModifierKey,
    hideDefaultDragPreview,
  } = rqbDndContext;

  const dndRefs = adapter!.useRuleGroupDnD({
    disabled: !!props.parentDisabled || !!props.disabled,
    path: props.path,
    schema: props.schema,
    actions: props.actions,
    ruleGroup: props.ruleGroup,
    canDrop,
    copyModeModifierKey: copyModeModifierKey ?? 'alt',
    groupModeModifierKey: groupModeModifierKey ?? 'ctrl',
    hideDefaultDragPreview,
  });

  return <BaseRuleGroupComponent {...props} {...dndRefs} />;
};

/**
 * @group Hooks
 * @deprecated Access via the adapter instead: `adapter.useRuleGroupDnD(params)`.
 */
export { type AdapterUseRuleGroupDnDResult as UseRuleGroupDnDResult } from './adapter';
