import type {
  ActionProps,
  InlineCombinatorProps,
  NotToggleProps,
  QueryBuilderProps,
  RuleGroupProps,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleProps,
  Schema,
  ValueEditorProps,
  ValueSelectorProps,
} from '@react-querybuilder/ts';
import type { ComponentType } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export type WrapEachPropertyInStyleProp<K> = { [P in keyof K]?: StyleProp<Required<K>[P]> };

interface WithOptionalStyles {
  styles?: Partial<QueryBuilderNativeStyles>;
}

interface WithOptionalStyleSheets {
  styles?: QueryBuilderNativeStyleSheets;
}

export interface SchemaNative extends Schema, WithOptionalStyleSheets {}

export interface WithSchemaNative {
  schema: SchemaNative;
}

export interface QueryBuilderNativeStyles {
  combinatorOption: TextStyle;
  combinatorSelector: TextStyle;
  dragHandle: ViewStyle;
  fieldOption: TextStyle;
  fieldSelector: TextStyle;
  inlineCombinator: TextStyle;
  notToggle: ViewStyle;
  notToggleLabel: TextStyle;
  notToggleSwitch: ViewStyle;
  operatorOption: TextStyle;
  operatorSelector: TextStyle;
  rule: ViewStyle;
  ruleGroup: ViewStyle;
  ruleGroupBody: ViewStyle;
  ruleGroupHeader: ViewStyle;
  value: TextStyle;
  valueEditorOption: TextStyle;
  valueEditorSelector: TextStyle;
  valueEditorSwitch: ViewStyle;
  valueList: ViewStyle;
  valueSourceOption: TextStyle;
  valueSourceSelector: TextStyle;
}

export type QueryBuilderNativeStyleSheets = WrapEachPropertyInStyleProp<QueryBuilderNativeStyles>;

export type RuleGroupNativeProps = RuleGroupProps & WithSchemaNative;

export type RuleNativeProps = RuleProps & WithSchemaNative;

export type NotToggleNativeProps = NotToggleProps & WithSchemaNative;

export type InlineCombinatorNativeProps = InlineCombinatorProps & WithSchemaNative;

export type ActionNativeProps = ActionProps & WithSchemaNative;

export type ValueSelectorNativeProps = ValueSelectorProps &
  WithSchemaNative & {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    pickerComponent?: typeof import('@react-native-picker/picker').Picker;
  };

export type ValueEditorNativeProps = ValueEditorProps &
  WithSchemaNative & {
    selectorComponent?: ComponentType<ValueSelectorNativeProps>;
  };

export type QueryBuilderNativeProps<RG extends RuleGroupType | RuleGroupTypeIC = RuleGroupType> =
  QueryBuilderProps<RG> & WithOptionalStyles;
