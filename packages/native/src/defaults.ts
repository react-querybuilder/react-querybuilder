import type { Controls } from '@react-querybuilder/ts';
import { forwardRef } from 'react';
import {
  NativeActionElement,
  NativeInlineCombinator,
  NativeNotToggle,
  NativeValueEditor,
  NativeValueSelector,
} from './controls';
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
