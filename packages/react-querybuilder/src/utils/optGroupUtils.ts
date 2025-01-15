import { produce } from 'immer';
import type { RequireAtLeastOne } from 'type-fest';
import type {
  BaseOption,
  BaseOptionMap,
  FlexibleOption,
  FlexibleOptionGroup,
  FlexibleOptionList,
  FullOption,
  FullOptionList,
  GetOptionIdentifierType,
  Option,
  OptionGroup,
  OptionList,
  ToFullOption,
  ValueOption,
  WithUnknownIndex,
} from '../types/index.noReact';
import { isPojo } from './misc';

const isOptionWithName = (opt: BaseOption): opt is Option =>
  isPojo(opt) && 'name' in opt && typeof opt.name === 'string';
const isOptionWithValue = (opt: BaseOption): opt is ValueOption =>
  isPojo(opt) && 'value' in opt && typeof opt.value === 'string';

/**
 * Converts an {@link Option} or {@link ValueOption} (i.e., {@link BaseOption})
 * into a {@link FullOption}. Full options are left unchanged.
 */
export function toFullOption<Opt extends BaseOption>(
  opt: Opt,
  baseProperties?: Record<string, unknown>
): ToFullOption<Opt> {
  const recipe: (o: Opt) => ToFullOption<Opt> = produce(draft => {
    const idObj: { name?: string; value?: string } = {};
    let needsUpdating = !!baseProperties;

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
 */
export function toFullOptionList<Opt extends BaseOption, OptList extends FlexibleOptionList<Opt>>(
  optList: OptList,
  baseProperties?: Record<string, unknown>
): FullOptionList<Opt> {
  if (!Array.isArray(optList)) {
    return [] as unknown as FullOptionList<Opt>;
  }

  const recipe: (ol: FlexibleOptionList<Opt>) => FullOptionList<Opt> = produce(draft => {
    if (isFlexibleOptionGroupArray(draft)) {
      for (const optGroup of draft) {
        for (const [idx, opt] of optGroup.options.entries())
          optGroup.options[idx] = toFullOption(opt, baseProperties);
      }
    } else {
      for (const [idx, opt] of (draft as Opt[]).entries())
        draft[idx] = toFullOption(opt, baseProperties);
    }
  });

  return recipe(optList);
}

/**
 * Converts a {@link FlexibleOptionList} into a {@link FullOptionList}.
 * Lists of full options are left unchanged.
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
 */
export const uniqByName = <
  T extends { name: string; value?: string } | { name?: string; value: string },
>(
  originalArray: T[]
): T[] => uniqByIdentifier(originalArray);

/**
 * Generates a new array of objects with duplicates removed based
 * on the identifying property (`value` or `name`)
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
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isOptionGroupArray = (arr: any): arr is OptionGroup<BaseOption>[] =>
  Array.isArray(arr) &&
  arr.length > 0 &&
  isPojo(arr[0]) &&
  'options' in arr[0] &&
  Array.isArray(arr[0].options);

/**
 * Determines if an array is a flat array of {@link FlexibleOption}.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
 */
export const isFlexibleOptionGroupArray = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
 * Determines if a {@link FlexibleOptionList} is a {@link OptionGroup} array of
 * {@link FullOption}.
 */
export const isFullOptionGroupArray = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
 */
export const getOption = <OptType extends Option = Option>(
  arr: OptionList<OptType>,
  name: string
): OptType | undefined =>
  (isFlexibleOptionGroupArray(arr, { allowEmpty: true })
    ? arr.flatMap(og => og.options)
    : arr
  ).find(op => op.value === name || op.name === name);

/**
 * Gets the first option from an {@link OptionList}.
 */
export const getFirstOption = <Opt extends BaseOption>(
  arr?: FlexibleOptionGroup<Opt>[] | Opt[]
): GetOptionIdentifierType<Opt> | null => {
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
};

/**
 * Flattens {@link FlexibleOptionGroup} arrays into {@link BaseOption} arrays.
 * If the array is already flat, it is returned as is.
 */
export const toFlatOptionArray = <T extends FullOption, OL extends FullOptionList<T>>(arr: OL) =>
  uniqByIdentifier(isOptionGroupArray(arr) ? arr.flatMap(og => og.options) : arr) as T[];

/**
 * Generates a new {@link OptionGroup} array with duplicates
 * removed based on the identifying property (`value` or `name`).
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
 */
export const uniqOptList = <T extends BaseOption>(
  originalArray: FlexibleOptionList<T>
): WithUnknownIndex<BaseOption & FullOption>[] | OptionGroup<ToFullOption<T>>[] => {
  if (isFlexibleOptionGroupArray(originalArray)) {
    return uniqOptGroups(originalArray) as OptionGroup<ToFullOption<T>>[];
  }
  return uniqByIdentifier((originalArray as BaseOption[]).map(o => toFullOption(o)));
};
