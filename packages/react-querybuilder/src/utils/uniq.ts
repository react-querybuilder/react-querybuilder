import type {
  FlexibleOption,
  FlexibleOptionGroup,
  OptionGroup,
  ToFullOption,
} from '../types/index.noReact';
import { toFullOption } from './toFullOption';

/**
 * Generates a new array of objects with duplicates removed
 * based on the `name` property.
 */
export const uniqByName = <T extends { name?: string; value?: string }>(
  originalArray: T[]
): T[] => {
  const names = new Set<string>();
  const newArray: any[] = [];
  originalArray.forEach(el => {
    if (!names.has((el.value ?? el.name)!)) {
      names.add((el.value ?? el.name)!);
      newArray.push(el);
    }
  });
  return newArray;
};

/**
 * Generates a new {@link OptionGroup} array with duplicates removed
 * based on the `name` property.
 */
export const uniqOptGroups = <T extends FlexibleOption>(
  originalArray: FlexibleOptionGroup<T>[]
): OptionGroup<ToFullOption<T>>[] => {
  type K = T extends FlexibleOption<infer KT> ? KT : never;
  const labels = new Set<string>();
  const names = new Set<K>();
  const newArray: OptionGroup<ToFullOption<T>>[] = [];
  originalArray.forEach(el => {
    if (!labels.has(el.label)) {
      labels.add(el.label);
      const optionsForThisGroup: ToFullOption<T>[] = [];
      el.options.forEach(opt => {
        if (!names.has((opt.value ?? opt.name) as K)) {
          names.add((opt.value ?? opt.name) as K);
          optionsForThisGroup.push(toFullOption(opt) as ToFullOption<T>);
        }
      });
      newArray.push({ ...el, options: optionsForThisGroup });
    }
  });
  return newArray;
};
