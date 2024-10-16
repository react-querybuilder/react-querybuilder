import type { Controls, FullField } from '../types';
import { ActionElement } from './ActionElement';
import { DragHandle } from './DragHandle';
import { InlineCombinator } from './InlineCombinator';
import { NotToggle } from './NotToggle';
import { Rule } from './Rule';
import { RuleGroup, RuleGroupBodyComponents, RuleGroupHeaderComponents } from './RuleGroup';
import { ShiftActions } from './ShiftActions';
import { ValueEditor } from './ValueEditor';
import { ValueSelector } from './ValueSelector';

/**
 * Default components used by {@link QueryBuilder}.
 */
export const defaultControlElements: {
  actionElement: typeof ActionElement;
  addGroupAction: typeof ActionElement;
  addRuleAction: typeof ActionElement;
  cloneGroupAction: typeof ActionElement;
  cloneRuleAction: typeof ActionElement;
  combinatorSelector: typeof ValueSelector;
  dragHandle: typeof DragHandle;
  fieldSelector: typeof ValueSelector;
  inlineCombinator: typeof InlineCombinator;
  lockGroupAction: typeof ActionElement;
  lockRuleAction: typeof ActionElement;
  notToggle: typeof NotToggle;
  operatorSelector: typeof ValueSelector;
  removeGroupAction: typeof ActionElement;
  removeRuleAction: typeof ActionElement;
  rule: typeof Rule;
  ruleGroup: typeof RuleGroup;
  ruleGroupBodyElements: typeof RuleGroupBodyComponents;
  ruleGroupHeaderElements: typeof RuleGroupHeaderComponents;
  shiftActions: typeof ShiftActions;
  valueEditor: typeof ValueEditor;
  valueSelector: typeof ValueSelector;
  valueSourceSelector: typeof ValueSelector;
} = {
  actionElement: ActionElement,
  addGroupAction: ActionElement,
  addRuleAction: ActionElement,
  cloneGroupAction: ActionElement,
  cloneRuleAction: ActionElement,
  combinatorSelector: ValueSelector,
  dragHandle: DragHandle,
  fieldSelector: ValueSelector,
  inlineCombinator: InlineCombinator,
  lockGroupAction: ActionElement,
  lockRuleAction: ActionElement,
  notToggle: NotToggle,
  operatorSelector: ValueSelector,
  removeGroupAction: ActionElement,
  removeRuleAction: ActionElement,
  rule: Rule,
  ruleGroup: RuleGroup,
  ruleGroupBodyElements: RuleGroupBodyComponents,
  ruleGroupHeaderElements: RuleGroupHeaderComponents,
  shiftActions: ShiftActions,
  valueEditor: ValueEditor,
  valueSelector: ValueSelector,
  valueSourceSelector: ValueSelector,
} satisfies Controls<FullField, string>;
