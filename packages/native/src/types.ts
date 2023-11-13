import type { ComponentType } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type {
  ActionProps,
  Combinator,
  Field,
  InlineCombinatorProps,
  NotToggleProps,
  Operator,
  QueryBuilderProps,
  RuleGroupProps,
  RuleGroupTypeAny,
  RuleProps,
  Schema,
  ShiftActionsProps,
  ToFlexibleOption,
  ToFullOption,
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

export interface SchemaNative<F extends ToFullOption<Field>, O extends string>
  extends Schema<F, O>,
    WithOptionalStyleSheets {}

export interface WithSchemaNative {
  schema: SchemaNative<any, any>;
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
  shiftActions: ViewStyle;
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

export type ShiftActionsNativeProps = ShiftActionsProps & WithSchemaNative;

export type ValueSelectorNativeProps = ValueSelectorProps & WithSchemaNative;

export type ValueEditorNativeProps = ValueEditorProps &
  WithSchemaNative & {
    selectorComponent?: ComponentType<ValueSelectorNativeProps>;
  };

export type QueryBuilderNativeProps<
  RG extends RuleGroupTypeAny,
  F extends ToFlexibleOption<Field>,
  O extends ToFlexibleOption<Operator>,
  C extends ToFlexibleOption<Combinator>
> = QueryBuilderProps<RG, F, O, C> & WithOptionalStyles;
