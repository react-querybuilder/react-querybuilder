import type { ComponentType } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type {
  ActionWithRulesProps,
  FullCombinator,
  FullField,
  FullOperator,
  FullOption,
  InlineCombinatorProps,
  NotToggleProps,
  QueryBuilderProps,
  RuleGroupProps,
  RuleGroupTypeAny,
  RuleProps,
  Schema,
  ShiftActionsProps,
  ValueEditorProps,
  ValueSelectorProps,
} from 'react-querybuilder';

/**
 * @group Props
 */
export type WrapEachPropertyInStyleProp<K> = { [P in keyof K]?: StyleProp<Required<K>[P]> };

interface WithOptionalStyles {
  styles?: Partial<QueryBuilderNativeStyles>;
}

interface WithOptionalStyleSheets {
  styles?: QueryBuilderNativeStyleSheets;
}

/**
 * @group Props
 */
export interface SchemaNative<F extends FullField, O extends string>
  extends Schema<F, O>,
    WithOptionalStyleSheets {}

/**
 * @group Props
 */
export interface WithSchemaNative<F extends FullField = FullField, O extends string = string> {
  schema: SchemaNative<F, O>;
}

/**
 * @group Props
 */
export type QueryBuilderNativeStyles = {
  actionElement: ViewStyle;
  actionElementText: TextStyle;
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

/**
 * @group Props
 */
export type QueryBuilderNativeStyleSheets = WrapEachPropertyInStyleProp<QueryBuilderNativeStyles>;

/**
 * @group Props
 */
export type RuleGroupNativeProps = RuleGroupProps & WithSchemaNative;

/**
 * @group Props
 */
export type RuleNativeProps = RuleProps & WithSchemaNative;

/**
 * @group Props
 */
export type NotToggleNativeProps = NotToggleProps & WithSchemaNative;

/**
 * @group Props
 */
export type InlineCombinatorNativeProps = InlineCombinatorProps & WithSchemaNative;

/**
 * @group Props
 */
export type ActionNativeProps = ActionWithRulesProps & WithSchemaNative;

/**
 * @group Props
 */
export type ShiftActionsNativeProps = ShiftActionsProps & WithSchemaNative;

/**
 * @group Props
 */
export type ValueSelectorNativeProps<OptType extends FullOption = FullOption> =
  ValueSelectorProps<OptType> & WithSchemaNative;

/**
 * @group Props
 */
export type ValueEditorNativeProps = ValueEditorProps &
  WithSchemaNative & {
    selectorComponent?: ComponentType<ValueSelectorNativeProps>;
  };

/**
 * @group Props
 */
// TODO: Something is wrong with this. Implementations
// (see /examples/native) don't pass typechecking.
export type QueryBuilderNativeProps<
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
> = QueryBuilderProps<RG, F, O, C> & WithOptionalStyles;
