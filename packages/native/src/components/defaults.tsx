import type { Controls } from '@react-querybuilder/ts';
import { forwardRef } from 'react';
import { NativeActionElement } from './NativeActionElement';
import { NativeInlineCombinator } from './NativeInlineCombinator';
import { NativeNotToggle } from './NativeNotToggle';
import { NativeValueEditor } from './NativeValueEditor';
import { NativeValueEditorWeb } from './NativeValueEditorWeb';
import { NativeValueSelector } from './NativeValueSelector';
import { NativeValueSelectorWeb } from './NativeValueSelectorWeb';
import { RuleGroupNative } from './RuleGroupNative';
import { RuleNative } from './RuleNative';

export const defaultNativeControlElements: Controls = {
  addGroupAction: NativeActionElement,
  addRuleAction: NativeActionElement,
  cloneGroupAction: NativeActionElement,
  cloneRuleAction: NativeActionElement,
  combinatorSelector: NativeValueSelector,
  // TODO?: implement drag-and-drop
  dragHandle: forwardRef(() => null),
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
  valueEditor: NativeValueEditor,
  valueSourceSelector: NativeValueSelector,
};

export const defaultNativeWebControlElements: Controls = {
  ...defaultNativeControlElements,
  combinatorSelector: NativeValueSelectorWeb,
  fieldSelector: NativeValueSelectorWeb,
  operatorSelector: NativeValueSelectorWeb,
  valueEditor: NativeValueEditorWeb,
  valueSourceSelector: NativeValueSelectorWeb,
};
