import type { Controls, FullField } from '../types';
import { ActionElement } from './ActionElement';
import { DragHandle } from './DragHandle';
import { InlineCombinator } from './InlineCombinator';
import { NotToggle } from './NotToggle';
import { Rule } from './Rule';
import { RuleGroup } from './RuleGroup';
import { ShiftActions } from './ShiftActions';
import { ValueEditor } from './ValueEditor';
import { ValueSelector } from './ValueSelector';

/**
 * Default components used by {@link QueryBuilder}.
 */
export const defaultControlElements = {
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
  shiftActions: ShiftActions,
  valueEditor: ValueEditor,
  valueSelector: ValueSelector,
  valueSourceSelector: ValueSelector,
} satisfies Controls<FullField, string>;
