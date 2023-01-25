import type { TextStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import type { QueryBuilderNativeStyles } from './types';

export const defaultNativeSelectStyles = {
  selector: { height: 30, width: 100 } as TextStyle,
  option: {} as TextStyle,
} as const;

const defaultStylesObject: QueryBuilderNativeStyles = {
  combinatorOption: defaultNativeSelectStyles.option,
  combinatorSelector: defaultNativeSelectStyles.selector,
  // TODO?: implement drag-and-drop
  dragHandle: {},
  fieldOption: defaultNativeSelectStyles.option,
  fieldSelector: defaultNativeSelectStyles.selector,
  inlineCombinator: {},
  notToggle: { flexDirection: 'row' },
  notToggleLabel: {},
  notToggleSwitch: {},
  operatorOption: defaultNativeSelectStyles.option,
  operatorSelector: defaultNativeSelectStyles.selector,
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
  valueEditorOption: defaultNativeSelectStyles.option,
  valueEditorSelector: defaultNativeSelectStyles.selector,
  valueEditorSwitch: {},
  valueList: { flexDirection: 'row' },
  valueSourceOption: defaultNativeSelectStyles.option,
  valueSourceSelector: defaultNativeSelectStyles.selector,
};

export const defaultNativeStyles = StyleSheet.create(defaultStylesObject);
