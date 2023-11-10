/**
 * Extracts the {@link Option} type from a {@link FlexibleOptionList}.
 */
export type GetOptionType<OL extends FlexibleOptionList<FlexibleOption>> =
  OL extends FlexibleOptionList<infer Opt> ? Opt : never;

/**
 * Extracts the type of the identifying property from a {@link FlexibleOption}.
 */
export type GetOptionIdentifierType<Opt extends FlexibleOption> = Opt extends
  | Option<infer NameType>
  | ValueOption<infer NameType>
  ? NameType
  : string;

/**
 * A generic option. Used directly in {@link OptionList} or
 * as the child element of an {@link OptionGroup}.
 */
export interface Option<N extends string = string> {
  name: N;
  value?: N;
  label: string;
  [x: string]: any;
}

/**
 * Like {@link Option} but requiring `value` instead of `name`.
 */
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
export type FlexibleOption<N extends string = string> =
  | {
      name: N;
      value?: N;
      label: string;
      [x: string]: any;
    }
  | {
      name?: N;
      value: N;
      label: string;
      [x: string]: any;
    };

/**
 * Utility type to turn an {@link Option} into a {@link FlexibleOption}.
 */
export type ToFlexibleOption<Opt extends Option | ValueOption> = Opt extends
  | Option<infer NameType>
  | ValueOption<infer NameType>
  ? Omit<Opt, 'name' | 'value'> & { [x: string]: any } & FlexibleOption<NameType>
  : never;

/**
 * A generic {@link Option} requiring `name` _and_ `value` properties.
 * Props that extend {@link OptionList} accept {@link FlexibleOption}, but
 * corresponding props sent to subcomponents will always be translated to this
 * type first to ensure both `name` and `value` are available.
 */
export interface FullOption<N extends string = string> {
  name: N;
  value: N;
  label: string;
  [x: string]: any;
}

/**
 * Utility type to turn an {@link Option}, {@link ValueOption} or
 * {@link FlexibleOption} into a {@link FullOption}.
 */
export type ToFullOption<Opt extends FlexibleOption> = Opt extends FlexibleOption<infer NameType>
  ? Opt & FullOption<NameType>
  : never;

/**
 * @deprecated Renamed to `Option`.
 */
export type NameLabelPair<N extends string = string> = Option<N>;

/**
 * An {@link Option} group within an {@link OptionList}.
 */
export type OptionGroup<Opt extends FlexibleOption = Option> = {
  label: string;
  options: Opt[];
};

/**
 * A {@link FlexibleOption} group within a {@link FlexibleOptionList}.
 */
export type FlexibleOptionGroup<Opt extends FlexibleOption = FlexibleOption> = {
  label: string;
  options: Opt[];
};

/**
 * Either an array of {@link Option} or an array of {@link OptionGroup}.
 */
export type OptionList<Opt extends Option = Option> = Opt[] | OptionGroup<Opt>[];

/**
 * An array of options or option groups, like {@link OptionList}, but each member may
 * use either `name` or `value` as the primary identifier.
 */
export type FlexibleOptionList<Opt extends FlexibleOption> = Opt extends FlexibleOption
  ? ToFlexibleOption<Opt>[] | FlexibleOptionGroup<ToFlexibleOption<Opt>>[]
  : never;

/**
 * An array of options or option groups, like {@link OptionList}, but using
 * {@link FullOption} instead of {@link Option}. This means that every member is
 * guaranteed to have both `name` and `value`.
 */
export type FullOptionList<Opt extends FlexibleOption> = Opt extends FullOption
  ? Opt[] | OptionGroup<Opt>[]
  : ToFullOption<Opt>[] | OptionGroup<ToFullOption<Opt>>[];

/**
 * Map of option identifiers to their respective {@link Option}.
 */
export type FlexibleOptionMap<
  V extends FlexibleOption,
  K extends string = GetOptionIdentifierType<V>
> = {
  [k in K]?: V;
};

/**
 * Map of option identifiers to their respective {@link FullOption}.
 */
export type FullOptionMap<V extends FullOption, K extends string = GetOptionIdentifierType<V>> = {
  [k in K]?: V;
};

/**
 * Map of option identifiers to their respective {@link FullOption}.
 * Must include all possible strings from the identifier type.
 */
export type FullOptionRecord<
  V extends FullOption,
  K extends string = GetOptionIdentifierType<V>
> = Record<K, V>;
