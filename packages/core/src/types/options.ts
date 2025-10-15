import type { Except, SetRequired, Simplify } from 'type-fest';

// This is the implementation from type-fest@4.
// TODO: Update to use the type-fest@latest implementation.
type RequireAtLeastOne<ObjectType, KeysType extends keyof ObjectType> = {
  // For each `Key` in `KeysType` make a mapped type:
  [Key in KeysType]-?: Required<Pick<ObjectType, Key>> & // 1. Make `Key`'s type required
    // 2. Make all other keys in `KeysType` optional
    Partial<Pick<ObjectType, Exclude<KeysType, Key>>>;
}[KeysType] &
  // 3. Add the remaining keys not in `KeysType`
  Except<ObjectType, KeysType>;

export type StringUnionToFlexibleOptionArray<Op extends string> = Array<
  Op extends unknown ? FlexibleOption<Op> : never
>;
export type StringUnionToFullOptionArray<Op extends string> = Array<
  Op extends unknown ? FullOption<Op> : never
>;

/**
 * Extracts the {@link Option} type from a {@link FlexibleOptionList}.
 *
 * @group Option Lists
 */
export type GetOptionType<OL extends FlexibleOptionList<FullOption>> =
  OL extends FlexibleOptionList<infer Opt> ? Opt : never;

/**
 * Extracts the type of the identifying property from a {@link Option},
 * {@link ValueOption}, or {@link FullOption}.
 *
 * @group Option Lists
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
 * Do not use this type directly; use {@link Option}, {@link ValueOption},
 * or {@link FullOption} instead. For specific option types, you can use
 * {@link FullField}, {@link FullOperator}, or {@link FullCombinator},
 * all of which extend {@link FullOption}.
 *
 * @group Option Lists
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
 *
 * @group Option Lists
 */
export type Option<N extends string = string> = Simplify<
  WithUnknownIndex<SetRequired<BaseOption<N>, 'name'>>
>;

/**
 * Like {@link Option} but requiring `value` instead of `name`.
 *
 * @group Option Lists
 */
export type ValueOption<N extends string = string> = Simplify<
  WithUnknownIndex<SetRequired<BaseOption<N>, 'value'>>
>;

/**
 * A generic {@link Option} with either a `name` or `value` as its primary identifier.
 * {@link OptionList}-type props on the {@link react-querybuilder!QueryBuilder QueryBuilder} component accept this type,
 * but corresponding props passed down to subcomponents will always be augmented
 * to {@link FullOption} first.
 *
 * @group Option Lists
 */
export type FlexibleOption<N extends string = string> = Simplify<
  WithUnknownIndex<RequireAtLeastOne<BaseOption<N>, 'name' | 'value'>>
>;

/**
 * Utility type to turn an {@link Option}, {@link ValueOption}, or {@link BaseOption}
 * into a {@link FlexibleOption}.
 *
 * @group Option Lists
 */
export type ToFlexibleOption<Opt extends BaseOption | string> = WithUnknownIndex<
  RequireAtLeastOne<Opt extends string ? FlexibleOption<Opt> : Opt, 'name' | 'value'>
>;

/**
 * A generic {@link Option} requiring both `name` _and_ `value` properties.
 * Props that extend {@link OptionList} accept {@link BaseOption}, but
 * corresponding props sent to subcomponents will always be augmented to this
 * type first to ensure both `name` and `value` are available.
 *
 * NOTE: Do not extend from this type directly. Use {@link BaseFullOption}
 * (optionally wrapped in {@link WithUnknownIndex}) instead, otherwise
 * the `unknown` index property will cause issues. See {@link Option} and
 * {@link ValueOption} for examples.
 *
 * @group Option Lists
 */
export type FullOption<N extends string = string> = Simplify<
  WithUnknownIndex<SetRequired<BaseOption<N>, 'name' | 'value'>>
>;

/**
 * This type is identical to {@link FullOption} but without the `unknown` index
 * property. Extend from this type instead of {@link FullOption} directly.
 *
 * @group Option Lists
 */
export type BaseFullOption<N extends string = string> = Simplify<
  SetRequired<BaseOption<N>, 'name' | 'value'>
>;

/**
 * Utility type to turn an {@link Option}, {@link ValueOption} or
 * {@link BaseOption} into a {@link FullOption}.
 *
 * @group Option Lists
 */
export type ToFullOption<Opt extends BaseOption> = Opt extends BaseFullOption
  ? Opt
  : Opt extends BaseOption<infer IdentifierType>
    ? WithUnknownIndex<Opt & FullOption<IdentifierType>>
    : never;

/**
 * @deprecated Renamed to {@link Option}.
 *
 * @group Option Lists
 */
export type NameLabelPair<N extends string = string> = Option<N>;

/**
 * A group of {@link Option}s, usually within an {@link OptionList}.
 *
 * @group Option Lists
 */
export interface OptionGroup<Opt extends BaseOption = FlexibleOption> {
  label: string;
  options: WithUnknownIndex<Opt>[];
}

/**
 * A group of {@link BaseOption}s, usually within a {@link FlexibleOptionList}.
 *
 * @group Option Lists
 */
export type FlexibleOptionGroup<Opt extends BaseOption | string = BaseOption> = {
  label: string;
  options: (Opt extends BaseFullOption ? Opt : ToFlexibleOption<Opt>)[];
};

/**
 * Either an array of {@link Option}s or an array of {@link OptionGroup}s.
 *
 * @group Option Lists
 */
export type OptionList<Opt extends Option = Option> = Opt[] | OptionGroup<Opt>[];

/**
 * An array of options or option groups, like {@link OptionList} but the option type
 * may use either `name` or `value` as the primary identifier.
 *
 * @group Option Lists
 */
export type FlexibleOptionList<Opt extends BaseOption> =
  | ToFlexibleOption<Opt>[]
  | FlexibleOptionGroup<ToFlexibleOption<Opt>>[];

/**
 * An array of options or option groups, like {@link OptionList} but the option type
 * may use either `name` or `value` as the primary identifier.
 *
 * @group Option Lists
 */
export type FlexibleOptionListProp<Opt extends BaseOption> =
  | (ToFlexibleOption<Opt> | GetOptionIdentifierType<Opt>)[]
  | FlexibleOptionGroup<ToFlexibleOption<Opt> | GetOptionIdentifierType<Opt>>[];

/**
 * An array of options or option groups, like {@link OptionList}, but using
 * {@link FullOption} instead of {@link Option}. This means that every member is
 * guaranteed to have both `name` and `value`.
 *
 * @group Option Lists
 */
export type FullOptionList<Opt extends BaseOption> = Opt extends BaseFullOption
  ? Opt[] | OptionGroup<Opt>[]
  : ToFullOption<Opt>[] | OptionGroup<ToFullOption<Opt>>[];

/**
 * Map of option identifiers to their respective {@link Option}.
 *
 * @group Option Lists
 */
export type BaseOptionMap<
  V extends BaseOption = BaseOption,
  K extends string = GetOptionIdentifierType<V>,
> = {
  [k in K]?: ToFlexibleOption<V>;
};

/**
 * Map of option identifiers to their respective {@link FullOption}.
 *
 * @group Option Lists
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
 *
 * @group Option Lists
 */
export type FullOptionRecord<
  V extends BaseFullOption,
  K extends string = GetOptionIdentifierType<V>,
> = Record<K, V>;
