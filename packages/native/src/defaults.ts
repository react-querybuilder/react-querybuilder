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
  notToggle: NativeNotToggle,
  valueEditor: NativeValueEditor,
  addGroupAction: NativeActionElement,
  addRuleAction: NativeActionElement,
  cloneGroupAction: NativeActionElement,
  cloneRuleAction: NativeActionElement,
  combinatorSelector: NativeValueSelector,
  fieldSelector: NativeValueSelector,
  operatorSelector: NativeValueSelector,
  lockRuleAction: NativeActionElement,
  lockGroupAction: NativeActionElement,
  removeGroupAction: NativeActionElement,
  removeRuleAction: NativeActionElement,
  valueSourceSelector: NativeValueSelector,
  inlineCombinator: NativeInlineCombinator,
  // TODO?: implement drag-and-drop
  dragHandle: forwardRef(() => null),
  rule: RuleNative,
  ruleGroup: RuleGroupNative,
};
