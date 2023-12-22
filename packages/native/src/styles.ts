import type { TextStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import type { QueryBuilderNativeStyles } from './types';

export const defaultNativeSelectStyles = {
  selector: { borderWidth: 1, height: 32, width: 100 } as TextStyle,
  option: {} as TextStyle,
} as const;

const defaultStylesObject = {
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
  ruleGroup: {
    backgroundColor: 'rgba(0, 75, 183, 0.2)',
    borderColor: '#8081a2',
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 10,
  },
  ruleGroupBody: { paddingTop: 10, paddingRight: 10, paddingLeft: 10 },
  ruleGroupHeader: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingRight: 10,
    paddingLeft: 10,
  },
  shiftActions: { flexDirection: 'column' },
  value: { borderWidth: 1, height: 32, width: 150 },
  valueEditorOption: defaultNativeSelectStyles.option,
  valueEditorSelector: defaultNativeSelectStyles.selector,
  valueEditorSwitch: {},
  valueList: { flexDirection: 'row' },
  valueSourceOption: defaultNativeSelectStyles.option,
  valueSourceSelector: defaultNativeSelectStyles.selector,
} satisfies QueryBuilderNativeStyles;

export const defaultNativeStyles = StyleSheet.create(defaultStylesObject);
