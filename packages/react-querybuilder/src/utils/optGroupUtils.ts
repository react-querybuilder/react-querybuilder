import type { RequireAtLeastOne } from 'type-fest';
import type {
  BaseOption,
  FlexibleOptionGroup,
  FlexibleOptionList,
  FullOption,
  FullOptionList,
  GetOptionIdentifierType,
  Option,
  OptionGroup,
  OptionList,
  ToFullOption,
  WithUnknownIndex,
} from '../types/index.noReact';
import { isPojo } from './misc';
import { toFullOption } from './toFullOption';

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
 * Determines if a {@link FlexibleOptionList} is a {@link FlexibleOptionGroup} array.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isFlexibleOptionGroupArray = (arr: any): arr is FlexibleOptionGroup[] => {
  if (Array.isArray(arr)) {
    for (const og of arr) {
      if (isPojo(og) && 'options' in og) {
        for (const opt of og.options) {
          if (isPojo(opt) && ('name' in opt || 'value' in opt)) {
            return true;
          }
          return false;
        }
      }
    }
  }
  return false;
};

/**
 * Determines if a {@link FlexibleOptionList} is a {@link OptionGroup} array of
 * {@link FullOption}.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isFullOptionGroupArray = (arr: any): arr is OptionGroup<FullOption>[] => {
  if (Array.isArray(arr)) {
    for (const og of arr) {
      if (isPojo(og) && 'options' in og) {
        for (const opt of og.options) {
          if (isPojo(opt) && 'name' in opt && 'value' in opt) {
            return true;
          }
          return false;
        }
      }
    }
  }
  return false;
};

/**
 * Gets the option from an {@link OptionList} with the given `name`. Handles
 * {@link Option} arrays as well as {@link OptionGroup} arrays.
 */
export const getOption = <OptType extends Option = Option>(
  arr: OptionList<OptType>,
  name: string
): OptType | undefined =>
  (isOptionGroupArray(arr) ? arr.flatMap(og => og.options) : arr).find(
    op => op.value === name || op.name === name
  );

/**
 * Gets the first option from an {@link OptionList}.
 */
export const getFirstOption = <Opt extends BaseOption>(
  arr?: FlexibleOptionGroup<Opt>[] | Opt[]
): GetOptionIdentifierType<Opt> | null => {
  if (!Array.isArray(arr) || arr.length === 0) {
    return null;
  } else if (isFlexibleOptionGroupArray(arr)) {
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
