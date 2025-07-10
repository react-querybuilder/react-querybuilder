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
import {
  defaultPlaceholderFieldGroupLabel,
  defaultPlaceholderFieldLabel,
  defaultPlaceholderFieldName,
  defaultPlaceholderOperatorGroupLabel,
  defaultPlaceholderOperatorLabel,
  defaultPlaceholderOperatorName,
  defaultPlaceholderValueGroupLabel,
  defaultPlaceholderValueLabel,
  defaultPlaceholderValueName,
} from '@react-querybuilder/core';
import type { Controls, FullField, TranslationsFull } from './types';

/**
 * Default configuration of translatable strings.
 *
 * @group Defaults
 */
// #region docs-translations
export const defaultTranslations: TranslationsFull = {
  fields: {
    title: 'Fields',
    placeholderName: defaultPlaceholderFieldName,
    placeholderLabel: defaultPlaceholderFieldLabel,
    placeholderGroupLabel: defaultPlaceholderFieldGroupLabel,
  } as const,
  operators: {
    title: 'Operators',
    placeholderName: defaultPlaceholderOperatorName,
    placeholderLabel: defaultPlaceholderOperatorLabel,
    placeholderGroupLabel: defaultPlaceholderOperatorGroupLabel,
  } as const,
  values: {
    title: 'Values',
    placeholderName: defaultPlaceholderValueName,
    placeholderLabel: defaultPlaceholderValueLabel,
    placeholderGroupLabel: defaultPlaceholderValueGroupLabel,
  } as const,
  matchMode: {
    title: 'Match mode',
  } as const,
  matchThreshold: {
    title: 'Match threshold',
  } as const,
  value: {
    title: 'Value',
  } as const,
  removeRule: {
    label: '⨯',
    title: 'Remove rule',
  } as const,
  removeGroup: {
    label: '⨯',
    title: 'Remove group',
  } as const,
  addRule: {
    label: '+ Rule',
    title: 'Add rule',
  } as const,
  addGroup: {
    label: '+ Group',
    title: 'Add group',
  } as const,
  combinators: {
    title: 'Combinators',
  } as const,
  notToggle: {
    label: 'Not',
    title: 'Invert this group',
  } as const,
  cloneRule: {
    label: '⧉',
    title: 'Clone rule',
  } as const,
  cloneRuleGroup: {
    label: '⧉',
    title: 'Clone group',
  } as const,
  shiftActionUp: {
    label: '˄',
    title: 'Shift up',
  } as const,
  shiftActionDown: {
    label: '˅',
    title: 'Shift down',
  } as const,
  dragHandle: {
    label: '⁞⁞',
    title: 'Drag handle',
  } as const,
  lockRule: {
    label: '🔓',
    title: 'Lock rule',
  } as const,
  lockGroup: {
    label: '🔓',
    title: 'Lock group',
  } as const,
  lockRuleDisabled: {
    label: '🔒',
    title: 'Unlock rule',
  } as const,
  lockGroupDisabled: {
    label: '🔒',
    title: 'Unlock group',
  } as const,
  valueSourceSelector: {
    title: 'Value source',
  } as const,
} satisfies TranslationsFull;
// #endregion

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
  matchModeEditor: MatchModeEditor,
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
