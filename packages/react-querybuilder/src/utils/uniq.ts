import type { RequireAtLeastOne } from 'type-fest';
import type {
  BaseOption,
  FlexibleOptionGroup,
  FlexibleOptionList,
  OptionGroup,
  ToFullOption,
  WithUnknownIndex,
} from '../types/index.noReact';
import { isFlexibleOptionGroupArray } from './optGroupUtils';
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
  originalArray.forEach(el => {
    if (!names.has((el.value ?? el.name)!)) {
      names.add((el.value ?? el.name)!);
      newArray.push(el);
    }
  });
  return originalArray.length === newArray.length ? originalArray : newArray;
};

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
  originalArray.forEach(el => {
    if (!labels.has(el.label)) {
      labels.add(el.label);
      const optionsForThisGroup: WithUnknownIndex<ToFullOption<T>>[] = [];
      el.options.forEach(opt => {
        if (!names.has((opt.value ?? opt.name) as K)) {
          names.add((opt.value ?? opt.name) as K);
          optionsForThisGroup.push(toFullOption(opt) as WithUnknownIndex<ToFullOption<T>>);
        }
      });
      newArray.push({ ...el, options: optionsForThisGroup });
    }
  });
  return newArray;
};

/**
 * Generates a new {@link Option} or {@link OptionGroup} array with duplicates
 * removed based on the identifier property (`value` or `name`).
 */
export const uniqOptList = <T extends BaseOption>(originalArray: FlexibleOptionList<T>) => {
  if (isFlexibleOptionGroupArray(originalArray)) {
    return uniqOptGroups(originalArray) as OptionGroup<ToFullOption<T>>[];
  }
  return uniqByIdentifier((originalArray as BaseOption[]).map(o => toFullOption(o)));
};
