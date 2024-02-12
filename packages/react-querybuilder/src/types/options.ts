import type { RequireAtLeastOne, SetOptional, SetRequired } from 'type-fest';

/**
 * Extracts the {@link Option} type from a {@link FlexibleOptionList}.
 */
export type GetOptionType<OL extends FlexibleOptionList<FullOption>> =
  OL extends FlexibleOptionList<infer Opt> ? Opt : never;

/**
 * Extracts the type of the identifying property from a {@link BaseOption}.
 */
export type GetOptionIdentifierType<Opt extends BaseOption> = Opt extends
  | Option<infer NameType>
  | ValueOption<infer NameType>
  ? NameType
  : string;

/**
 * Adds an `unknown` index property to an interface.
 */
export type WithUnknownIndex<T> = T & { [key: string]: unknown };

/**
 * Do not use this type directly. Use {@link Option}, {@link ValueOption},
 * {@link FullOption}, or {@link BaseOption} instead. For specific
 * option lists, you can use {@link FullField}, {@link FullOperator}, or
 * {@link FullCombinator}, all of which extend {@link FullOption}.
 */
export interface BaseOption<N extends string = string> {
  name?: N;
  value?: N;
  label: string;
  disabled?: boolean;
}

/**
 * A generic option. Used directly in {@link OptionList} or
 * as the child element of an {@link OptionGroup}.
 */
export interface Option<N extends string = string> extends SetOptional<FullOption<N>, 'value'> {}

/**
 * Like {@link Option} but requiring `value` instead of `name`.
 */
export interface ValueOption<N extends string = string>
  extends SetOptional<FullOption<N>, 'name'> {}

/**
 * A generic {@link Option} with either a `name` or `value` as its primary identifier.
 * {@link OptionList}-type props on the {@link QueryBuilder} component accept this type,
 * but corresponding props passed down to subcomponents will always be translated
 * to {@link FullOption} first.
 */
export type FlexibleOption<N extends string = string> = WithUnknownIndex<
  RequireAtLeastOne<BaseOption<N>, 'name' | 'value'>
>;

/**
 * Utility type to turn an {@link Option} into a {@link BaseOption}.
 */
export type ToFlexibleOption<Opt extends BaseOption> = WithUnknownIndex<
  RequireAtLeastOne<Opt, 'name' | 'value'>
>;

/**
 * A generic {@link Option} requiring both `name` _and_ `value` properties.
 * Props that extend {@link OptionList} accept {@link BaseOption}, but
 * corresponding props sent to subcomponents will always be translated to this
 * type first to ensure both `name` and `value` are available.
 *
 * NOTE: Do not extend from this type directly. Use {@link BaseFullOption}
 * (optionally wrappped in {@link WithUnknownIndex}) instead, otherwise
 * the `unknown` index property will cause issues.
 */
export interface FullOption<N extends string = string>
  extends WithUnknownIndex<SetRequired<BaseOption<N>, 'name' | 'value'>> {}

/**
 * This type is identical to {@link FullOption} but without the `unknown` index
 * property. Extend from this type instead of {@link FullOption} directly.
 */
export interface BaseFullOption<N extends string = string>
  extends SetRequired<BaseOption<N>, 'name' | 'value'> {}

/**
 * Utility type to turn an {@link Option}, {@link ValueOption} or
 * {@link BaseOption} into a {@link FullOption}.
 */
export type ToFullOption<Opt extends BaseOption> = Opt extends BaseFullOption
  ? Opt
  : Opt extends BaseOption<infer IdentifierType>
    ? WithUnknownIndex<Opt & FullOption<IdentifierType>>
    : never;

/**
 * @deprecated Renamed to `Option`.
 */
export interface NameLabelPair<N extends string = string> extends Option<N> {}

/**
 * An {@link Option} group within an {@link OptionList}.
 */
export interface OptionGroup<Opt extends BaseOption = FlexibleOption> {
  label: string;
  options: WithUnknownIndex<Opt>[];
}

/**
 * A {@link BaseOption} group within a {@link FlexibleOptionList}.
 */
export type FlexibleOptionGroup<Opt extends BaseOption = BaseOption> = {
  label: string;
  options: (Opt extends BaseFullOption ? Opt : ToFlexibleOption<Opt>)[];
};

/**
 * Either an array of {@link Option} or an array of {@link OptionGroup}.
 */
export type OptionList<Opt extends Option = Option> = Opt[] | OptionGroup<Opt>[];

/**
 * An array of options or option groups, like {@link OptionList}, but each member may
 * use either `name` or `value` as the primary identifier.
 */
export type FlexibleOptionList<Opt extends BaseOption> =
  | ToFlexibleOption<Opt>[]
  | FlexibleOptionGroup<ToFlexibleOption<Opt>>[];

/**
 * An array of options or option groups, like {@link OptionList}, but using
 * {@link FullOption} instead of {@link Option}. This means that every member is
 * guaranteed to have both `name` and `value`.
 */
export type FullOptionList<Opt extends BaseOption> = Opt extends BaseFullOption
  ? Opt[] | OptionGroup<Opt>[]
  : ToFullOption<Opt>[] | OptionGroup<ToFullOption<Opt>>[];

/**
 * Map of option identifiers to their respective {@link Option}.
 */
export type BaseOptionMap<
  V extends BaseOption = BaseOption,
  K extends string = GetOptionIdentifierType<V>,
> = {
  [k in K]?: ToFlexibleOption<V>;
};

/**
 * Map of option identifiers to their respective {@link FullOption}.
 */
export type FullOptionMap<
  V extends BaseFullOption,
  K extends string = GetOptionIdentifierType<V>,
> = {
  [k in K]?: V;
};

/**
 * Map of option identifiers to their respective {@link FullOption}.
 * Must include all possible strings from the identifier type.
 */
export type FullOptionRecord<
  V extends BaseFullOption,
  K extends string = GetOptionIdentifierType<V>,
> = Record<K, V>;
