import { forwardRef } from 'react';
import type { Controls, FullField } from 'react-querybuilder';
import { RuleGroupBodyComponents, RuleGroupHeaderComponents } from 'react-querybuilder';
import { NativeActionElement } from './NativeActionElement';
import { NativeInlineCombinator } from './NativeInlineCombinator';
import { NativeMatchModeSelector } from './NativeMatchModeSelector';
import { NativeMatchModeSelectorWeb } from './NativeMatchModeSelectorWeb';
import { NativeNotToggle } from './NativeNotToggle';
import { NativeShiftActions } from './NativeShiftActions';
import { NativeValueEditor } from './NativeValueEditor';
import { NativeValueEditorWeb } from './NativeValueEditorWeb';
import { NativeValueSelector } from './NativeValueSelector';
import { NativeValueSelectorWeb } from './NativeValueSelectorWeb';
import { RuleGroupNative } from './RuleGroupNative';
import { RuleNative } from './RuleNative';

export const defaultNativeControlElements: Controls<FullField, string> = {
  actionElement: NativeActionElement,
  addGroupAction: NativeActionElement,
  addRuleAction: NativeActionElement,
  cloneGroupAction: NativeActionElement,
  cloneRuleAction: NativeActionElement,
  combinatorSelector: NativeValueSelector,
  // TODO?: implement drag-and-drop
  dragHandle: forwardRef(/* istanbul ignore next */ () => null),
  fieldSelector: NativeValueSelector,
  inlineCombinator: NativeInlineCombinator,
  lockGroupAction: NativeActionElement,
  lockRuleAction: NativeActionElement,
  notToggle: NativeNotToggle,
  operatorSelector: NativeValueSelector,
  removeGroupAction: NativeActionElement,
  removeRuleAction: NativeActionElement,
  rule: RuleNative,
  ruleGroup: RuleGroupNative,
  ruleGroupBodyElements: RuleGroupBodyComponents,
  ruleGroupHeaderElements: RuleGroupHeaderComponents,
  shiftActions: NativeShiftActions,
  valueEditor: NativeValueEditor,
  valueSelector: NativeValueSelector,
  valueSourceSelector: NativeValueSelector,
  matchModeSelector: NativeMatchModeSelector,
};

export const defaultNativeWebControlElements: Controls<FullField, string> = {
  ...defaultNativeControlElements,
  combinatorSelector: NativeValueSelectorWeb,
  fieldSelector: NativeValueSelectorWeb,
  matchModeSelector: NativeMatchModeSelectorWeb,
  operatorSelector: NativeValueSelectorWeb,
  valueEditor: NativeValueEditorWeb,
  valueSelector: NativeValueSelectorWeb,
  valueSourceSelector: NativeValueSelectorWeb,
};
