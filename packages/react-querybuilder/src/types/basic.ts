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

/**
 * A generic option. Used directly in {@link OptionList} or
 * as the child element of an {@link OptionGroup}.
 */
export interface Option<N extends string = string> {
  name: N;
  label: string;
  [x: string]: any;
}

export type ValueOption<N extends string = string> = {
  name?: N;
  value: N;
  label: string;
};

/**
 * A generic {@link Option} with either a `name` or `value` as its primary identifier.
 * {@link OptionList}-type props accept this type, but corresponding props sent to
 * subcomponents will always be translated to {@link FullOption} first.
 */
export type FlexibleOption<N extends string = string> = {
  label: string;
  [x: string]: any;
} & ({ name: N; value?: N } | { name?: N; value: N });

/**
 * A generic {@link Option} requiring `name` _and_ `value` properties.
 * Props that extend {@link OptionList} accept {@link FlexibleOption}, but
 * corresponding props sent to subcomponents will always be translated to this
 * type first to ensure both `name` and `value` are available.
 */
export type FullOption<N extends string = string> = Option<N> & ValueOption;

/**
 * Utility type to turn an {@link Option} into a {@link FullOption}.
 */
export type ToFullOption<Opt extends Option = Option> = Opt extends Option<infer NameType>
  ? Opt & FullOption<NameType>
  : never;

/**
 * @deprecated Renamed to `Option`.
 */
export type NameLabelPair<N extends string = string> = Option<N>;

/**
 * An {@link Option} group within an {@link OptionList}.
 */
export type OptionGroup<Opt extends Option = Option> = {
  label: string;
  options: Opt[];
};

/**
 * Either an array of {@link Option} or an array of {@link OptionGroup}.
 */
export type OptionList<Opt extends Option = Option> = Opt[] | OptionGroup<Opt>[];

/**
 * Like {@link OptionList}, but using {@link FullOption} instead of {@link Option}.
 */
export type FullOptionList<Opt extends Option = Option> =
  | ToFullOption<Opt>[]
  | OptionGroup<ToFullOption<Opt>>[];

interface HasOptionalClassName {
  className?: Classname;
}

/**
 * Field definition used in the `fields` prop of {@link QueryBuilder}.
 * The `name`, `operators`, and `values` properties can be narrowed
 * with generics.
 */
export interface Field<
  FieldName extends string = string,
  OperatorName extends string = string,
  ValueName extends string = string,
  OperatorObj extends Option = Option<OperatorName>,
  ValueObj extends Option = Option<ValueName>
> extends Option<FieldName>,
    HasOptionalClassName {
  id?: string;
  operators?: OptionList<OperatorObj>;
  valueEditorType?: ValueEditorType | ((operator: OperatorName) => ValueEditorType);
  valueSources?: ValueSources | ((operator: OperatorName) => ValueSources);
  inputType?: string | null;
  values?: OptionList<ValueObj>;
  defaultOperator?: OperatorName;
  defaultValue?: any;
  placeholder?: string;
  validator?: RuleValidator;
  comparator?: string | ((f: Field, operator: string) => boolean);
}

/**
 * Utility type to make one or more properties required.
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Allowed values of the `arity` {@link Operator} property. A value of `"unary"` or
 * a number less than two will cause the default {@link ValueEditor} to render `null`.
 */
export type Arity = number | 'unary' | 'binary' | 'ternary';

/**
 * Operator definition used in the `operators`/`getOperators` props of {@link QueryBuilder}.
 * The `name` property can be narrowed with a generic.
 */
export interface Operator<N extends string = string> extends Option<N>, HasOptionalClassName {
  arity?: Arity;
}

/**
 * Combinator definition used in the `combinators` prop of {@link QueryBuilder}.
 * The `name` property can be narrowed with a generic.
 */
export interface Combinator<N extends string = string> extends Option<N>, HasOptionalClassName {}

/**
 * Methods used by {@link parseNumbers}. `"native"` will force the use of `parseFloat`,
 * whether the string matches {@link numericRegex} or not.
 */
export type ParseNumbersMethod = boolean | 'strict' | 'native';
