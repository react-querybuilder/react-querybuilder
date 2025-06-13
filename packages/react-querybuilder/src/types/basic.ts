import type {
  BaseFullOption,
  FlexibleOption,
  FlexibleOptionList,
  FullOption,
  StringUnionToFullOptionArray,
  WithUnknownIndex,
} from './options';
import type { SetOptional, Simplify } from './type-fest';
import type { RuleValidator } from './validation';

/**
 * @see https://react-querybuilder.js.org/docs/tips/path
 */
export type Path = number[];

/**
 * String of classnames, array of classname strings, or object where the
 * keys are classnames and those with truthy values will be included.
 * Suitable for passing to the `clsx` package.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Classname = string | string[] | Record<string, any>;

/**
 * A source for the `value` property of a rule.
 */
export type ValueSource = 'value' | 'field';

/**
 * Type of {@link ValueEditor} that will be displayed.
 */
export type ValueEditorType =
  | 'text'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'textarea'
  | 'switch'
  | 'multiselect'
  | null;

/**
 * A valid array of potential value sources.
 *
 * @see {@link ValueSource}
 */
export type ValueSources = ['value'] | ['value', 'field'] | ['field', 'value'] | ['field'];

export type ValueSourceOptions = ToOptionArrays<ValueSources>;

type ToOptionArrays<Sources extends readonly string[]> = Sources extends unknown
  ? {
      [K in keyof Sources]: { name: Sources[K]; value: Sources[K]; label: Sources[K] };
    }
  : never;

type WithOptionalClassName<T> = T & { className?: Classname };

/**
 * HTML5 input types
 */
export type InputType =
  | 'button'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'hidden'
  | 'image'
  | 'month'
  | 'number'
  | 'password'
  | 'radio'
  | 'range'
  | 'reset'
  | 'search'
  | 'submit'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week'
  | (string & {});

/**
 * Quantification mode describing how many elements of the value array must pass
 * the filter for the rule itself to pass.
 *
 * For "atLeast", "atMost", and "exactly", the threshold value will be converted to
 * a percentage if the number is less than 1. Non-numeric values and numbers less
 * than 0 will be ignored.
 */
export interface MatchConfig {
  mode: MatchMode;
  threshold?: number | null | undefined;
}

export type MatchMode = 'all' | 'some' | 'none' | 'atLeast' | 'atMost' | 'exactly';
export type MatchModeOptions = StringUnionToFullOptionArray<MatchMode>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionElementEventHandler = (event?: any, context?: any) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ValueChangeEventHandler = (value?: any, context?: any) => void;

/**
 * Base for all Field types/interfaces.
 */
interface BaseFullField<
  FieldName extends string = string,
  OperatorName extends string = string,
  ValueName extends string = string,
  OperatorObj extends FullOption = FullOption<OperatorName>,
  ValueObj extends FullOption = FullOption<ValueName>,
> extends WithOptionalClassName<BaseFullOption<FieldName>> {
  id?: string;
  operators?: FlexibleOptionList<OperatorObj>;
  valueEditorType?: ValueEditorType | ((operator: OperatorName) => ValueEditorType);
  valueSources?: ValueSources | ((operator: OperatorName) => ValueSources);
  inputType?: InputType | null;
  values?: FlexibleOptionList<ValueObj>;
  matchModes?: boolean | MatchMode[] | FlexibleOption<MatchMode>[];
  /** Properties of items in the value. */
  subproperties?: FlexibleOptionList<ValueObj>;
  defaultOperator?: OperatorName;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any;
  placeholder?: string;
  validator?: RuleValidator;
  comparator?: string | ((f: FullField, operator: string) => boolean);
}

/**
 * Full field definition used in the `fields` prop of {@link QueryBuilder}.
 * This type requires both `name` and `value`, but the `fields` prop itself
 * can use a {@link FlexibleOption} where only one of `name` or `value` is
 * required (along with `label`), or {@link Field} where only `name` and
 * `label` are required.
 *
 * The `name`/`value`, `operators`, and `values` properties of this interface
 * can be narrowed with generics.
 *
 * @group Option Lists
 */
export type FullField<
  FieldName extends string = string,
  OperatorName extends string = string,
  ValueName extends string = string,
  OperatorObj extends FullOption = FullOption<OperatorName>,
  ValueObj extends FullOption = FullOption<ValueName>,
> = Simplify<
  FullOption<FieldName> & BaseFullField<FieldName, OperatorName, ValueName, OperatorObj, ValueObj>
>;

/**
 * Field definition used in the `fields` prop of {@link QueryBuilder}.
 * This type is an extension of {@link FullField} where only `name` and
 * `label` are required.
 *
 * The `name`/`value`, `operators`, and `values` properties of this interface
 * can be narrowed with generics.
 *
 * @group Option Lists
 */
export type Field<
  FieldName extends string = string,
  OperatorName extends string = string,
  ValueName extends string = string,
  OperatorObj extends FullOption = FullOption<OperatorName>,
> = WithUnknownIndex<
  { value?: FieldName } & Pick<
    BaseFullField<FieldName, OperatorName, ValueName, OperatorObj>,
    Exclude<keyof BaseFullField, 'value'>
  >
>;

/**
 * Field definition used in the `fields` prop of {@link QueryBuilder}.
 * This type is an extension of {@link FullField} where only `value` and
 * `label` are required.
 *
 * The `name`/`value`, `operators`, and `values` properties of this interface
 * can be narrowed with generics.
 *
 * @group Option Lists
 */
export type FieldByValue<
  FieldName extends string = string,
  OperatorName extends string = string,
  ValueName extends string = string,
  OperatorObj extends FullOption = FullOption<OperatorName>,
> = WithUnknownIndex<
  { name?: FieldName } & Pick<
    BaseFullField<FieldName, OperatorName, ValueName, OperatorObj>,
    Exclude<keyof BaseFullField, 'name'>
  >
>;

/**
 * Utility type to make one or more properties required.
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Utility type to make all properties non-nullable.
 */
export type RemoveNullability<T extends Record<string, unknown>> = {
  [k in keyof T]: NonNullable<T[k]>;
};

/**
 * Allowed values of the {@link FullOperator} property `arity`. A value of `"unary"` or
 * a number less than two will cause the default {@link ValueEditor} to render `null`.
 */
export type Arity = number | 'unary' | 'binary' | 'ternary';

/**
 * Full operator definition used in the `operators`/`getOperators` props of
 * {@link QueryBuilder}. This type requires both `name` and `value`, but the
 * `operators`/`getOperators` props themselves can use a {@link FlexibleOption}
 * where only one of `name` or `value` is required, or {@link FullOperator} where
 * only `name` is required.
 *
 * The `name`/`value` properties of this interface can be narrowed with generics.
 *
 * @group Option Lists
 */
export interface FullOperator<N extends string = string>
  extends WithOptionalClassName<FullOption<N>> {
  arity?: Arity;
}

/**
 * Operator definition used in the `operators`/`getOperators` props of
 * {@link QueryBuilder}. This type is an extension of {@link FullOperator}
 * where only `name` and `label` are required.
 *
 * The `name`/`value` properties of this interface can be narrowed with generics.
 *
 * @group Option Lists
 */
export type Operator<N extends string = string> = WithUnknownIndex<
  SetOptional<BaseFullOption<N>, 'value'> &
    WithOptionalClassName<{
      arity?: Arity;
    }>
>;

/**
 * Operator definition used in the `operators`/`getOperators` props of
 * {@link QueryBuilder}. This type is an extension of {@link FullOperator}
 * where only `value` and `label` are required.
 *
 * The `name`/`value` properties of this interface can be narrowed with generics.
 *
 * @group Option Lists
 */
export type OperatorByValue<N extends string = string> = WithUnknownIndex<
  SetOptional<BaseFullOption<N>, 'name'> &
    WithOptionalClassName<{
      arity?: Arity;
    }>
>;

/**
 * Full combinator definition used in the `combinators` prop of {@link QueryBuilder}.
 * This type requires both `name` and `value`, but the `combinators` prop itself
 * can use a {@link FlexibleOption} where only one of `name` or `value` is required,
 * or {@link Combinator} where only `name` is required.
 *
 * The `name`/`value` properties of this interface can be narrowed with generics.
 *
 * @group Option Lists
 */
export type FullCombinator<N extends string = string> = WithOptionalClassName<FullOption<N>>;

/**
 * Combinator definition used in the `combinators` prop of {@link QueryBuilder}.
 * This type is an extension of {@link FullCombinator} where only `name` and
 * `label` are required.
 *
 * The `name`/`value` properties of this interface can be narrowed with generics.
 *
 * @group Option Lists
 */
export type Combinator<N extends string = string> = WithUnknownIndex<
  WithOptionalClassName<SetOptional<BaseFullOption<N>, 'value'>>
>;

/**
 * Combinator definition used in the `combinators` prop of {@link QueryBuilder}.
 * This type is an extension of {@link FullCombinator} where only `value` and
 * `label` are required.
 *
 * The `name`/`value` properties of this interface can be narrowed with generics.
 *
 * @group Option Lists
 */
export type CombinatorByValue<N extends string = string> = WithUnknownIndex<
  WithOptionalClassName<SetOptional<BaseFullOption<N>, 'name'>>
>;

type ParseNumberMethodName = 'enhanced' | 'native' | 'strict';

/**
 * Parsing algorithms used by {@link parseNumber}.
 */
export type ParseNumberMethod = boolean | ParseNumberMethodName;

type ParseNumbersModerationLevel = '-limited' | '';

/**
 * Options for the `parseNumbers` prop of {@link QueryBuilder}.
 */
export type ParseNumbersPropConfig =
  | boolean
  | `${ParseNumberMethodName}${ParseNumbersModerationLevel}`;

/**
 * Signature of `accessibleDescriptionGenerator` prop, used by {@link QueryBuilder} to generate
 * accessible descriptions for each {@link RuleGroup}.
 */
export type AccessibleDescriptionGenerator = (props: { path: Path; qbId: string }) => string;
