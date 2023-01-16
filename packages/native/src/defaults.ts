import type { Controls } from '@react-querybuilder/ts';
import { forwardRef } from 'react';
import { StyleSheet } from 'react-native';
import {
  NativeActionElement,
  NativeInlineCombinator,
  NativeNotToggle,
  NativeValueEditor,
  NativeValueSelector,
} from './controls';
import { RuleGroupNative } from './RuleGroupNative';
import { RuleNative } from './RuleNative';
import type { QueryBuilderNativeStyles } from './types';

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

const defaultStylesObject: QueryBuilderNativeStyles = {
  combinatorOption: {},
  combinatorSelector: { height: 30, width: 100 },
  // TODO?: implement drag-and-drop
  dragHandle: {},
  fieldOption: {},
  fieldSelector: { height: 30, width: 100 },
  inlineCombinator: {},
  notToggle: { flexDirection: 'row' },
  notToggleLabel: {},
  notToggleSwitch: {},
  operatorOption: {},
  operatorSelector: { height: 30, width: 100 },
  rule: { flexDirection: 'row', paddingBottom: 10 },
  ruleGroup: { borderWidth: 1, marginBottom: 10 },
  ruleGroupBody: { paddingTop: 10, paddingRight: 10, paddingLeft: 10 },
  ruleGroupHeader: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingRight: 10,
    paddingLeft: 10,
  },
  value: {},
  valueEditorOption: {},
  valueEditorSelector: {},
  valueEditorSwitch: {},
  valueList: { flexDirection: 'row' },
  valueSourceOption: {},
  valueSourceSelector: { height: 30, width: 100 },
};

export const defaultStyles = StyleSheet.create(defaultStylesObject);
