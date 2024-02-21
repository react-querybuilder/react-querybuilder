import type { ComponentType } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type {
  ActionProps,
  FullCombinator,
  FullField,
  FullOption,
  InlineCombinatorProps,
  NotToggleProps,
  FullOperator,
  QueryBuilderProps,
  RuleGroupProps,
  RuleGroupTypeAny,
  RuleProps,
  Schema,
  ShiftActionsProps,
  ValueEditorProps,
  ValueSelectorProps,
} from 'react-querybuilder';
export type WrapEachPropertyInStyleProp<K> = { [P in keyof K]?: StyleProp<Required<K>[P]> };

interface WithOptionalStyles {
  styles?: Partial<QueryBuilderNativeStyles>;
}

interface WithOptionalStyleSheets {
  styles?: QueryBuilderNativeStyleSheets;
}

export interface SchemaNative<F extends FullField, O extends string>
  extends Schema<F, O>,
    WithOptionalStyleSheets {}

export interface WithSchemaNative<F extends FullField = FullField, O extends string = string> {
  schema: SchemaNative<F, O>;
}

export type QueryBuilderNativeStyles = {
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
  shiftActions: ViewStyle;
  value: TextStyle;
  valueEditorOption: TextStyle;
  valueEditorSelector: TextStyle;
  valueEditorSwitch: ViewStyle;
  valueList: ViewStyle;
  valueSourceOption: TextStyle;
  valueSourceSelector: TextStyle;
};

export type QueryBuilderNativeStyleSheets = WrapEachPropertyInStyleProp<QueryBuilderNativeStyles>;

export type RuleGroupNativeProps = RuleGroupProps & WithSchemaNative;

export type RuleNativeProps = RuleProps & WithSchemaNative;

export type NotToggleNativeProps = NotToggleProps & WithSchemaNative;

export type InlineCombinatorNativeProps = InlineCombinatorProps & WithSchemaNative;

export type ActionNativeProps = ActionProps & WithSchemaNative;

export type ShiftActionsNativeProps = ShiftActionsProps & WithSchemaNative;

export type ValueSelectorNativeProps<OptType extends FullOption = FullOption> =
  ValueSelectorProps<OptType> & WithSchemaNative;

export type ValueEditorNativeProps = ValueEditorProps &
  WithSchemaNative & {
    selectorComponent?: ComponentType<ValueSelectorNativeProps>;
  };

export type QueryBuilderNativeProps<
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
> = QueryBuilderProps<RG, F, O, C> & WithOptionalStyles;
