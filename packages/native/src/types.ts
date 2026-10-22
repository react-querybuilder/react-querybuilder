import type { ComponentType } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type {
  ActionProps,
  FullCombinator,
  FullField,
  FullOperator,
  FullOption,
  InlineCombinatorProps,
  MatchModeEditorProps,
  NotToggleProps,
  QueryBuilderProps,
  RuleGroupProps,
  RuleGroupTypeAny,
  RuleProps,
  Schema,
  ShiftActionsProps,
  UndoRedoActionsProps,
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
  extends Schema<F, O>, WithOptionalStyleSheets {}

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
  undoRedoActions: ViewStyle;
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
export interface RuleGroupNativeProps extends RuleGroupProps, WithSchemaNative {
  schema: RuleGroupProps['schema'] & SchemaNative<FullField, string>;
}

/**
 * @group Props
 */
export interface RuleNativeProps extends RuleProps, WithSchemaNative {
  schema: RuleProps['schema'] & SchemaNative<FullField, string>;
}

/**
 * @group Props
 */
export interface NotToggleNativeProps extends NotToggleProps, WithSchemaNative {
  schema: NotToggleProps['schema'] & SchemaNative<FullField, string>;
}

/**
 * @group Props
 */
export interface InlineCombinatorNativeProps extends InlineCombinatorProps, WithSchemaNative {
  schema: InlineCombinatorProps['schema'] & SchemaNative<FullField, string>;
}

/**
 * @group Props
 */
export interface ActionNativeProps extends ActionProps, WithSchemaNative {
  schema: ActionProps['schema'] & SchemaNative<FullField, string>;
}

/**
 * @group Props
 */
export interface ShiftActionsNativeProps extends ShiftActionsProps, WithSchemaNative {
  schema: ShiftActionsProps['schema'] & SchemaNative<FullField, string>;
}

/**
 * @group Props
 */
export interface UndoRedoActionsNativeProps extends UndoRedoActionsProps, WithSchemaNative {
  schema: UndoRedoActionsProps['schema'] & SchemaNative<FullField, string>;
}

/**
 * @group Props
 */
export interface ValueSelectorNativeProps<OptType extends FullOption = FullOption>
  extends ValueSelectorProps<OptType>, WithSchemaNative {
  schema: ValueSelectorProps<OptType>['schema'] & SchemaNative<FullField, string>;
}

/**
 * @group Props
 */
export interface ValueEditorNativeProps extends ValueEditorProps, WithSchemaNative {
  schema: ValueEditorProps['schema'] & SchemaNative<FullField, string>;
  selectorComponent?: ComponentType<ValueSelectorNativeProps>;
}

/**
 * @group Props
 */
export interface MatchModeEditorNativeProps extends MatchModeEditorProps, WithSchemaNative {
  schema: MatchModeEditorProps['schema'] & SchemaNative<FullField, string>;
  selectorComponent?: ComponentType<ValueSelectorNativeProps>;
}

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
