import { StyleSheet } from 'react-native';
import type { QueryBuilderNativeStyles } from './types';

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
  value: { borderWidth: 1 },
  valueEditorOption: {},
  valueEditorSelector: {},
  valueEditorSwitch: {},
  valueList: { flexDirection: 'row' },
  valueSourceOption: {},
  valueSourceSelector: { height: 30, width: 100 },
};

export const defaultNativeStyles = StyleSheet.create(defaultStylesObject);
