import type { SetOptional } from 'type-fest';
import type {
  BaseFullOption,
  FlexibleOptionList,
  FullOption,
  Option,
  WithUnknownIndex,
} from './options';
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

interface HasOptionalClassName {
  className?: Classname;
}

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
 * Base for all Field types/interfaces.
 */
interface BaseFullField<
  FieldName extends string = string,
  OperatorName extends string = string,
  ValueName extends string = string,
  OperatorObj extends Option = Option<OperatorName>,
  ValueObj extends Option = Option<ValueName>,
> extends BaseFullOption<FieldName>,
    HasOptionalClassName {
  id?: string;
  operators?: FlexibleOptionList<OperatorObj>;
  valueEditorType?: ValueEditorType | ((operator: OperatorName) => ValueEditorType);
  valueSources?: ValueSources | ((operator: OperatorName) => ValueSources);
  inputType?: InputType | null;
  values?: FlexibleOptionList<ValueObj>;
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
 */
export interface FullField<
  FieldName extends string = string,
  OperatorName extends string = string,
  ValueName extends string = string,
  OperatorObj extends Option = Option<OperatorName>,
  ValueObj extends Option = Option<ValueName>,
> extends FullOption<FieldName>,
    BaseFullField<FieldName, OperatorName, ValueName, OperatorObj, ValueObj> {}

/**
 * Field definition used in the `fields` prop of {@link QueryBuilder}.
 * This type is an extension of {@link FullField} where only `name` and
 * `label` are required.
 *
 * The `name`/`value`, `operators`, and `values` properties of this interface
 * can be narrowed with generics.
 */
export type Field<
  FieldName extends string = string,
  OperatorName extends string = string,
  ValueName extends string = string,
  OperatorObj extends Option = Option<OperatorName>,
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
 */
export type FieldByValue<
  FieldName extends string = string,
  OperatorName extends string = string,
  ValueName extends string = string,
  OperatorObj extends Option = Option<OperatorName>,
> = WithUnknownIndex<
  { name?: FieldName } & Pick<
    BaseFullField<FieldName, OperatorName, ValueName, OperatorObj>,
    Exclude<keyof BaseFullField, 'name'>
  >
>;

// TODO: Dynamically generate the list of explicitly-named properties.
// The code below is a non-working attempt.
// export type Field<
//   FieldName extends string = string,
//   OperatorName extends string = string,
//   ValueName extends string = string,
//   OperatorObj extends Option = Option<OperatorName>,
// > = { value?: FieldName } & Pick<
//   FullField<FieldName, OperatorName, ValueName, OperatorObj>,
//   Exclude<keyof FullField<FieldName, OperatorName, ValueName, OperatorObj>, 'value'>
// > & { [key: string]: unknown };

// Another non-working way of defining `Field`:
// export type Field<
//   FieldName extends string = string,
//   OperatorName extends string = string,
//   ValueName extends string = string,
//   OperatorObj extends Option = Option<OperatorName>,
// > = SetOptional<FullField<FieldName, OperatorName, ValueName, OperatorObj>, 'value'>;

/**
 * Utility type to make one or more properties required.
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

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
 */
export interface FullOperator<N extends string = string>
  extends FullOption<N>,
    HasOptionalClassName {
  arity?: Arity;
}

/**
 * Operator definition used in the `operators`/`getOperators` props of
 * {@link QueryBuilder}. This type is an extension of {@link FullOperator}
 * where only `name` and `label` are required.
 *
 * The `name`/`value` properties of this interface can be narrowed with generics.
 */
export type Operator<N extends string = string> = WithUnknownIndex<
  SetOptional<BaseFullOption<N>, 'value'> &
    HasOptionalClassName & {
      arity?: Arity;
    }
>;

/**
 * Operator definition used in the `operators`/`getOperators` props of
 * {@link QueryBuilder}. This type is an extension of {@link FullOperator}
 * where only `value` and `label` are required.
 *
 * The `name`/`value` properties of this interface can be narrowed with generics.
 */
export type OperatorByValue<N extends string = string> = WithUnknownIndex<
  SetOptional<BaseFullOption<N>, 'name'> &
    HasOptionalClassName & {
      arity?: Arity;
    }
>;

/**
 * Full combinator definition used in the `combinators` prop of {@link QueryBuilder}.
 * This type requires both `name` and `value`, but the `combinators` prop itself
 * can use a {@link FlexibleOption} where only one of `name` or `value` is required,
 * or {@link Combinator} where only `name` is required.
 *
 * The `name`/`value` properties of this interface can be narrowed with generics.
 */
export interface FullCombinator<N extends string = string>
  extends FullOption<N>,
    HasOptionalClassName {}

/**
 * Combinator definition used in the `combinators` prop of {@link QueryBuilder}.
 * This type is an extension of {@link FullCombinator} where only `name` and
 * `label` are required.
 *
 * The `name`/`value` properties of this interface can be narrowed with generics.
 */
export type Combinator<N extends string = string> = WithUnknownIndex<
  SetOptional<BaseFullOption<N>, 'value'> & HasOptionalClassName
>;

/**
 * Combinator definition used in the `combinators` prop of {@link QueryBuilder}.
 * This type is an extension of {@link FullCombinator} where only `value` and
 * `label` are required.
 *
 * The `name`/`value` properties of this interface can be narrowed with generics.
 */
export type CombinatorByValue<N extends string = string> = WithUnknownIndex<
  SetOptional<BaseFullOption<N>, 'name'> & HasOptionalClassName
>;

/**
 * Methods used by {@link parseNumbers}.
 * - `false` avoids parsing
 * - `true`/`"enhanced"` (default) uses `numeric-quantity`
 * - `"strict"` is the same as `true`, but bails out when trailing invalid characters are present
 * - `"native"` forces the use of `parseFloat`, returning `NaN` when parsing fails
 */
export type ParseNumbersMethod = boolean | 'enhanced' | 'native' | 'strict';

/**
 * Signature of `accessibleDescriptionGenerator` prop, used by {@link QueryBuilder} to generate
 * accessible descriptions for each {@link RuleGroup}.
 */
export type AccessibleDescriptionGenerator = (props: { path: Path; qbId: string }) => string;
