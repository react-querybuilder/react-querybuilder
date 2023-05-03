import type { Controls } from '../types';
import { ActionElement } from './ActionElement';
import { DragHandle } from './DragHandle';
import { InlineCombinator } from './InlineCombinator';
import { NotToggle } from './NotToggle';
import { Rule } from './Rule';
import { RuleGroup } from './RuleGroup';
import { ValueEditor } from './ValueEditor';
import { ValueSelector } from './ValueSelector';

export const defaultControlElements: Controls = {
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
  dragHandle: DragHandle,
  lockRuleAction: ActionElement,
  lockGroupAction: ActionElement,
  valueSourceSelector: ValueSelector,
};
