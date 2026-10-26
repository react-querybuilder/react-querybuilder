import type { FullField } from '@react-querybuilder/core';
import { ActionElement } from './components/ActionElement';
import { DragHandle } from './components/DragHandle';
import { InlineCombinator } from './components/InlineCombinator';
import { MatchModeEditor } from './components/MatchModeEditor';
import { NotToggle } from './components/NotToggle';
import { Rule } from './components/Rule';
import {
  RuleGroup,
  RuleGroupBodyComponents,
  RuleGroupHeaderComponents,
} from './components/RuleGroup';
import { ShiftActions } from './components/ShiftActions';
import { ValueEditor } from './components/ValueEditor';
import { ValueSelector } from './components/ValueSelector';
import type { Controls } from './types';

/**
 * Default components used by {@link QueryBuilder}.
 *
 * @group Defaults
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
  matchModeEditor: typeof MatchModeEditor;
  muteGroupAction: typeof ActionElement;
  muteRuleAction: typeof ActionElement;
  notToggle: typeof NotToggle;
  operatorSelector: typeof ValueSelector;
  removeGroupAction: typeof ActionElement;
  removeRuleAction: typeof ActionElement;
  rule: typeof Rule;
  ruleGroup: typeof RuleGroup;
  ruleGroupBodyElements: typeof RuleGroupBodyComponents;
  ruleGroupHeaderElements: typeof RuleGroupHeaderComponents;
  shiftActions: typeof ShiftActions;
  undoRedoActions: null;
  ungroupAction: typeof ActionElement;
  valueEditor: typeof ValueEditor;
  valueSelector: typeof ValueSelector;
  valueSourceSelector: typeof ValueSelector;
} = {
  // Getters avoid TDZ errors from circular imports (e.g. Rule → ... → useMergedContext → defaults)
  get actionElement() {
    return ActionElement;
  },
  get addGroupAction() {
    return ActionElement;
  },
  get addRuleAction() {
    return ActionElement;
  },
  get cloneGroupAction() {
    return ActionElement;
  },
  get cloneRuleAction() {
    return ActionElement;
  },
  get combinatorSelector() {
    return ValueSelector;
  },
  get dragHandle() {
    return DragHandle;
  },
  get fieldSelector() {
    return ValueSelector;
  },
  get inlineCombinator() {
    return InlineCombinator;
  },
  get lockGroupAction() {
    return ActionElement;
  },
  get lockRuleAction() {
    return ActionElement;
  },
  get matchModeEditor() {
    return MatchModeEditor;
  },
  get muteGroupAction() {
    return ActionElement;
  },
  get muteRuleAction() {
    return ActionElement;
  },
  get notToggle() {
    return NotToggle;
  },
  get operatorSelector() {
    return ValueSelector;
  },
  get removeGroupAction() {
    return ActionElement;
  },
  get removeRuleAction() {
    return ActionElement;
  },
  get rule() {
    return Rule;
  },
  get ruleGroup() {
    return RuleGroup;
  },
  get ruleGroupBodyElements() {
    return RuleGroupBodyComponents;
  },
  get ruleGroupHeaderElements() {
    return RuleGroupHeaderComponents;
  },
  get shiftActions() {
    return ShiftActions;
  },
  // Requires the history recorder from `react-querybuilder/history`; see `showUndoRedo`.
  undoRedoActions: null,
  get ungroupAction() {
    return ActionElement;
  },
  get valueEditor() {
    return ValueEditor;
  },
  get valueSelector() {
    return ValueSelector;
  },
  get valueSourceSelector() {
    return ValueSelector;
  },
} satisfies Controls<FullField, string>;
