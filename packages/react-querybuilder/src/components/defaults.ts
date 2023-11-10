import type { Controls, Field } from '../types';
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
export const defaultControlElements: Controls<Field, string> = {
  addGroupAction: ActionElement,
  removeGroupAction: ActionElement,
  cloneGroupAction: ActionElement,
  cloneRuleAction: ActionElement,
  addRuleAction: ActionElement,
  removeRuleAction: ActionElement,
  combinatorSelector: ValueSelector,
  inlineCombinator: InlineCombinator,
  fieldSelector: ValueSelector,
  operatorSelector: ValueSelector,
  valueEditor: ValueEditor,
  notToggle: NotToggle,
  ruleGroup: RuleGroup,
  rule: Rule,
  shiftActions: ShiftActions,
  dragHandle: DragHandle,
  lockRuleAction: ActionElement,
  lockGroupAction: ActionElement,
  valueSourceSelector: ValueSelector,
};
