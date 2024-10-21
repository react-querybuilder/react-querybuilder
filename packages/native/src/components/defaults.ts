import { forwardRef } from 'react';
import type { Controls, FullField } from 'react-querybuilder';
import { RuleGroupBodyComponents, RuleGroupHeaderComponents } from 'react-querybuilder';
import { NativeActionElement } from './NativeActionElement';
import { NativeInlineCombinator } from './NativeInlineCombinator';
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
};

export const defaultNativeWebControlElements: Controls<FullField, string> = {
  ...defaultNativeControlElements,
  combinatorSelector: NativeValueSelectorWeb,
  fieldSelector: NativeValueSelectorWeb,
  operatorSelector: NativeValueSelectorWeb,
  valueEditor: NativeValueEditorWeb,
  valueSelector: NativeValueSelectorWeb,
  valueSourceSelector: NativeValueSelectorWeb,
};
