/**
 * A generic option. Used directly in {@link OptionList} or
 * as the child element of an {@link OptionGroup}.
 */
export interface Option<N extends string = string> {
  name: N;
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
export type ToFlexibleOption<Opt = Option> = Opt extends Option<infer NameType>
  ? Omit<Opt, 'name' | 'value'> & { [x: string]: any } & FlexibleOption<NameType>
  : Opt extends ValueOption<infer NameType>
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
export type FlexibleOptionList<Opt = FlexibleOption> = Opt extends FlexibleOption
  ? Opt[] | FlexibleOptionGroup<Opt>[]
  : Opt extends Option
  ? ToFlexibleOption<Opt>[] | FlexibleOptionGroup<ToFlexibleOption<Opt>>[]
  : never;

/**
 * An array of options or option groups, like {@link OptionList}, but using
 * {@link FullOption} instead of {@link Option}. This means that every member is
 * guaranteed to have both `name` and `value`.
 */
export type FullOptionList<Opt extends Option = Option> =
  | ToFullOption<Opt>[]
  | OptionGroup<ToFullOption<Opt>>[];
