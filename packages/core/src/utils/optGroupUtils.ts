import type { Draft } from 'immer';
import { produce } from 'immer';
import type { RequireAtLeastOne } from 'type-fest';
import { defaultPlaceholderLabel, defaultPlaceholderName } from '../defaults';
import type {
  BaseOption,
  BaseOptionMap,
  FlexibleOption,
  FlexibleOptionGroup,
  FlexibleOptionList,
  FlexibleOptionListProp,
  FullOption,
  FullOptionList,
  FullOptionMap,
  FullOptionRecord,
  GetOptionIdentifierType,
  Option,
  OptionGroup,
  Placeholder,
  ToFullOption,
  ValueOption,
  WithUnknownIndex,
} from '../types';
import { isPojo } from './misc';
import { objectKeys } from './objectUtils';

const isOptionWithName = (opt: BaseOption): opt is Option =>
  isPojo(opt) && 'name' in opt && typeof opt.name === 'string';
const isOptionWithValue = (opt: BaseOption): opt is ValueOption =>
  isPojo(opt) && 'value' in opt && typeof opt.value === 'string';

/**
 * Converts an {@link Option} or {@link ValueOption} (i.e., {@link BaseOption})
 * into a {@link FullOption}. Full options are left unchanged.
 *
 * @group Option Lists
 */
export function toFullOption<Opt extends BaseOption>(
  opt: Opt | string,
  baseProperties?: Record<string, unknown>,
  labelMap?: Record<string, unknown>
): ToFullOption<Opt> {
  const recipe: (o: Opt | string) => ToFullOption<Opt> = produce(draft => {
    const idObj: { name?: string; value?: string } = {};
    let needsUpdating = !!baseProperties;

    if (typeof draft === 'string') {
      return {
        ...baseProperties,
        name: draft,
        value: draft,
        label: labelMap?.[draft] ?? draft,
      } as Draft<Opt>;
    }

    if (isOptionWithName(draft) && !isOptionWithValue(draft)) {
      idObj.value = draft.name;
      needsUpdating = true;
    } else if (!isOptionWithName(draft) && isOptionWithValue(draft)) {
      idObj.name = draft.value;
      needsUpdating = true;
    }

    if (needsUpdating) {
      return Object.assign({}, baseProperties, draft, idObj);
    }
  });
  return recipe(opt);
}

/**
 * Converts an {@link OptionList} or {@link FlexibleOptionList} into a {@link FullOptionList}.
 * Lists of full options are left unchanged.
 *
 * @group Option Lists
 */
export function toFullOptionList<Opt extends BaseOption>(
  optList: unknown[],
  baseProperties?: Record<string, unknown>,
  labelMap?: Record<string, unknown>
): FullOptionList<Opt> {
  if (!Array.isArray(optList)) {
    return [] as unknown as FullOptionList<Opt>;
  }

  const recipe: (ol: FlexibleOptionList<Opt>) => FullOptionList<Opt> = produce(draft => {
    if (isFlexibleOptionGroupArray(draft)) {
      for (const optGroup of draft) {
        for (const [idx, opt] of optGroup.options.entries())
          optGroup.options[idx] = toFullOption(opt, baseProperties, labelMap);
      }
    } else {
      for (const [idx, opt] of (draft as Opt[]).entries())
        draft[idx] = toFullOption(opt, baseProperties, labelMap);
    }
  });

  return recipe(optList as FlexibleOptionList<Opt>);
}

/**
 * Converts a {@link FlexibleOptionList} into a {@link FullOptionList}.
 * Lists of full options are left unchanged.
 *
 * @group Option Lists
 */
export function toFullOptionMap<OptMap extends BaseOptionMap>(
  optMap: OptMap,
  baseProperties?: Record<string, unknown>
): OptMap extends BaseOptionMap<infer V, infer K> ? Partial<Record<K, ToFullOption<V>>> : never {
  type FullOptMapType =
    OptMap extends BaseOptionMap<infer VT, infer KT>
      ? Partial<Record<KT, ToFullOption<VT>>>
      : never;

  return Object.fromEntries(
    (Object.entries(optMap) as [string, FlexibleOption][]).map(([k, v]) => [
      k,
      toFullOption(v, baseProperties),
    ])
  ) as FullOptMapType;
}

/**
 * @deprecated Renamed to {@link uniqByIdentifier}.
 *
 * @group Option Lists
 */
export const uniqByName = <
  T extends { name: string; value?: string } | { name?: string; value: string },
>(
  originalArray: T[]
): T[] => uniqByIdentifier(originalArray);

/**
 * Generates a new array of objects with duplicates removed based
 * on the identifying property (`value` or `name`)
 *
 * @group Option Lists
 */
export const uniqByIdentifier = <
  T extends RequireAtLeastOne<{ name: string; value: string }, 'name' | 'value'>,
>(
  originalArray: T[]
): T[] => {
  const names = new Set<string>();
  const newArray: T[] = [];
  for (const el of originalArray) {
    if (!names.has((el.value ?? el.name)!)) {
      names.add((el.value ?? el.name)!);
      newArray.push(el);
    }
  }
  return originalArray.length === newArray.length ? originalArray : newArray;
};

/**
 * Determines if an {@link OptionList} is an {@link OptionGroup} array.
 *
 * @group Option Lists
 */
// oxlint-disable-next-line typescript/no-explicit-any
export const isOptionGroupArray = (arr: any): arr is OptionGroup<BaseOption>[] =>
  Array.isArray(arr) &&
  arr.length > 0 &&
  isPojo(arr[0]) &&
  'options' in arr[0] &&
  Array.isArray(arr[0].options);

/**
 * Determines if an array is a flat array of {@link FlexibleOption}.
 *
 * @group Option Lists
 */
// oxlint-disable-next-line typescript/no-explicit-any
export const isFlexibleOptionArray = (arr: any): arr is FlexibleOption[] => {
  let isFOA = false;
  if (Array.isArray(arr)) {
    for (const o of arr) {
      if (isOptionWithName(o) || isOptionWithValue(o)) {
        isFOA = true;
      } else {
        return false;
      }
    }
  }
  return isFOA;
};

/**
 * Determines if an array is a flat array of {@link FullOption}.
 *
 * @group Option Lists
 */
// oxlint-disable-next-line typescript/no-explicit-any
export const isFullOptionArray = (arr: any): arr is FullOption[] => {
  let isFOA = false;
  if (Array.isArray(arr)) {
    for (const o of arr) {
      if (isOptionWithName(o) && isOptionWithValue(o)) {
        isFOA = true;
      } else {
        return false;
      }
    }
  }
  return isFOA;
};

/**
 * Determines if a {@link FlexibleOptionList} is a {@link FlexibleOptionGroup} array.
 *
 * @group Option Lists
 */
export const isFlexibleOptionGroupArray = (
  // oxlint-disable-next-line typescript/no-explicit-any
  arr: any,
  { allowEmpty = false }: { allowEmpty?: boolean } = {}
): arr is FlexibleOptionGroup[] => {
  let isFOGA = false;
  if (Array.isArray(arr)) {
    for (const og of arr) {
      if (
        isPojo(og) &&
        'options' in og &&
        (isFlexibleOptionArray(og.options) ||
          (allowEmpty && Array.isArray(og.options) && og.options.length === 0))
      ) {
        isFOGA = true;
      } else {
        return false;
      }
    }
  }
  return isFOGA;
};

/**
 * Determines if a {@link FlexibleOptionList} is a {@link OptionGroup} array of {@link FullOption}.
 *
 * @group Option Lists
 */
export const isFullOptionGroupArray = (
  // oxlint-disable-next-line typescript/no-explicit-any
  arr: any,
  { allowEmpty = false }: { allowEmpty?: boolean } = {}
): arr is OptionGroup<FullOption>[] => {
  let isFOGA = false;
  if (Array.isArray(arr)) {
    for (const og of arr) {
      if (
        isPojo(og) &&
        'options' in og &&
        (isFullOptionArray(og.options) ||
          (allowEmpty && Array.isArray(og.options) && og.options.length === 0))
      ) {
        isFOGA = true;
      } else {
        return false;
      }
    }
  }
  return isFOGA;
};

/**
 * Gets the option from an {@link OptionList} with the given `name`. Handles
 * {@link Option} arrays as well as {@link OptionGroup} arrays.
 *
 * @group Option Lists
 */
export function getOption<OptType extends FullOption>(
  arr: FullOptionList<OptType>,
  name: string
): OptType | undefined;
export function getOption<OptType extends ValueOption>(
  arr: FlexibleOptionList<OptType>,
  name: string
): OptType | undefined;
export function getOption<OptType extends Option>(
  arr: FlexibleOptionList<OptType>,
  name: string
): OptType | undefined;
export function getOption<OptType extends BaseOption>(
  arr: FlexibleOptionList<OptType>,
  name: string
): OptType | undefined {
  const options = isFlexibleOptionGroupArray(arr, { allowEmpty: true })
    ? arr.flatMap(og => og.options)
    : arr;
  return options.find(op => op.value === name || op.name === name) as OptType | undefined;
}

/**
 * Gets the first option from an {@link OptionList}.
 *
 * @group Option Lists
 */
export function getFirstOption<Opt extends FullOption>(
  arr?: OptionGroup<Opt>[] | Opt[]
): GetOptionIdentifierType<Opt> | null;
export function getFirstOption<Opt extends ValueOption>(
  arr?: OptionGroup<Opt>[] | Opt[]
): GetOptionIdentifierType<Opt> | null;
export function getFirstOption<Opt extends Option>(
  arr?: OptionGroup<Opt>[] | Opt[]
): GetOptionIdentifierType<Opt> | null;
export function getFirstOption<Opt extends BaseOption>(
  arr?: FlexibleOptionGroup<Opt>[] | Opt[]
): GetOptionIdentifierType<Opt> | null {
  if (!Array.isArray(arr) || arr.length === 0) {
    return null;
  } else if (isFlexibleOptionGroupArray(arr, { allowEmpty: true })) {
    for (const og of arr) {
      if (og.options.length > 0) {
        return (og.options[0].value ?? og.options[0].name) as GetOptionIdentifierType<Opt>;
      }
    }
    // istanbul ignore next
    return null;
  }

  return (arr[0].value ?? arr[0].name) as GetOptionIdentifierType<Opt>;
}

/**
 * Flattens {@link FlexibleOptionGroup} arrays into {@link BaseOption} arrays.
 * If the array is already flat, it is returned as is.
 *
 * @group Option Lists
 */
export const toFlatOptionArray = <T extends FullOption, OL extends FullOptionList<T>>(arr: OL) =>
  uniqByIdentifier(isOptionGroupArray(arr) ? arr.flatMap(og => og.options) : arr) as T[];

/**
 * Generates a new {@link OptionGroup} array with duplicates
 * removed based on the identifying property (`value` or `name`).
 *
 * @group Option Lists
 */
export const uniqOptGroups = <T extends BaseOption>(
  originalArray: FlexibleOptionGroup<T>[]
): OptionGroup<ToFullOption<T>>[] => {
  type K = T extends BaseOption<infer KT> ? KT : never;
  const labels = new Set<string>();
  const names = new Set<K>();
  const newArray: OptionGroup<ToFullOption<T>>[] = [];
  for (const el of originalArray) {
    if (!labels.has(el.label)) {
      labels.add(el.label);
      const optionsForThisGroup: WithUnknownIndex<ToFullOption<T>>[] = [];
      for (const opt of el.options) {
        if (!names.has((opt.value ?? opt.name) as K)) {
          names.add((opt.value ?? opt.name) as K);
          optionsForThisGroup.push(toFullOption(opt) as WithUnknownIndex<ToFullOption<T>>);
        }
      }
      newArray.push({ ...el, options: optionsForThisGroup });
    }
  }
  return newArray;
};

/**
 * Generates a new {@link Option} or {@link OptionGroup} array with duplicates
 * removed based on the identifier property (`value` or `name`).
 *
 * @group Option Lists
 */
export const uniqOptList = <T extends BaseOption>(
  originalArray: FlexibleOptionList<T>
): WithUnknownIndex<BaseOption & FullOption>[] | OptionGroup<ToFullOption<T>>[] => {
  if (isFlexibleOptionGroupArray(originalArray)) {
    return uniqOptGroups(originalArray) as OptionGroup<ToFullOption<T>>[];
  }
  return uniqByIdentifier((originalArray as BaseOption[]).map(o => toFullOption(o)));
};

export interface PreparedOptionList<O extends FullOption> {
  defaultOption: FullOption;
  optionList: O[] | OptionGroup<O>[];
  optionsMap: Partial<FullOptionRecord<FullOption>>;
}

export interface PrepareOptionListParams<O extends FullOption> {
  placeholder?: Placeholder;
  optionList?: FlexibleOptionListProp<O> | BaseOptionMap<O>;
  baseOption?: Record<string, unknown>;
  labelMap?: Record<string, string>;
  autoSelectOption?: boolean;
}

export const prepareOptionList = <O extends FullOption>(
  props: PrepareOptionListParams<O>
): PreparedOptionList<O> => {
  type OptionIdentifier = GetOptionIdentifierType<O>;

  // istanbul ignore next
  const {
    optionList: optionListPropOriginal,
    baseOption = {},
    labelMap = {},
    placeholder: {
      placeholderName = defaultPlaceholderName,
      placeholderLabel = defaultPlaceholderLabel,
      placeholderGroupLabel = defaultPlaceholderLabel,
    } = {},
    autoSelectOption = true,
  } = props;

  const defaultOption = {
    id: placeholderName,
    name: placeholderName,
    value: placeholderName,
    label: placeholderLabel,
  } as FullOption;

  const optionsProp = optionListPropOriginal ?? ([defaultOption] as FlexibleOptionList<O>);

  let optionList: O[] | OptionGroup<O>[] = [];
  const opts = (
    Array.isArray(optionsProp)
      ? toFullOptionList(optionsProp, baseOption, labelMap)
      : (objectKeys(toFullOptionMap(optionsProp, baseOption)) as unknown as OptionIdentifier[])
          .map<
            FullOption<OptionIdentifier>
          >(opt => ({ ...optionsProp[opt]!, name: opt, value: opt }))
          .sort((a, b) => a.label.localeCompare(b.label))
  ) as FullOptionList<O>;
  if (isFlexibleOptionGroupArray(opts)) {
    optionList = autoSelectOption
      ? (uniqOptGroups(opts) as FullOptionList<O>)
      : (uniqOptGroups([
          {
            label: placeholderGroupLabel,
            options: [defaultOption],
          },
          ...opts,
        ]) as FullOptionList<O>);
  } else {
    optionList = autoSelectOption
      ? (uniqByIdentifier(opts as O[]) as FullOptionList<O>)
      : (uniqByIdentifier([defaultOption, ...(opts as O[])]) as FullOptionList<O>);
  }

  let optionsMap: Partial<FullOptionRecord<FullOption>> = {};
  if (!Array.isArray(optionsProp)) {
    const op = toFullOptionMap(optionsProp, baseOption) as FullOptionMap<
      FullOption,
      OptionIdentifier
    >;
    optionsMap = autoSelectOption ? op : { ...op, [placeholderName]: defaultOption };
  } else {
    if (isFlexibleOptionGroupArray(optionList)) {
      for (const og of optionList) {
        for (const opt of og.options) {
          optionsMap[(opt.value ?? /* istanbul ignore next */ opt.name) as OptionIdentifier] =
            toFullOption(opt, baseOption) as FullOption;
        }
      }
    } else {
      for (const opt of optionList) {
        optionsMap[(opt.value ?? /* istanbul ignore next */ opt.name) as OptionIdentifier] =
          toFullOption(opt, baseOption) as FullOption;
      }
    }
  }

  return { defaultOption, optionList, optionsMap };
};
