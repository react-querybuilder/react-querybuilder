import type { Option, OptionGroup } from '../types/index.noReact';

/**
 * Generates a new array of objects with duplicates removed
 * based on the `name` property.
 */
export const uniqByName = <T extends { name: string }>(originalArray: T[]): T[] => {
  const names = new Set<string>();
  const newArray: any[] = [];
  originalArray.forEach(el => {
    if (!names.has(el.name)) {
      names.add(el.name);
      newArray.push(el);
    }
  });
  return newArray;
};

/**
 * Generates a new {@link OptionGroup} array with duplicates removed
 * based on the `name` property.
 */
export const uniqOptGroups = <T extends Option>(originalArray: OptionGroup<T>[]) => {
  const labels = new Set<string>();
  const names = new Set<string>();
  const newArray: OptionGroup<T>[] = [];
  originalArray.forEach(el => {
    if (!labels.has(el.label)) {
      labels.add(el.label);
      const optionsForThisGroup: T[] = [];
      el.options.forEach(opt => {
        if (!names.has(opt.name)) {
          names.add(opt.name);
          optionsForThisGroup.push(opt);
        }
      });
      newArray.push({ ...el, options: optionsForThisGroup });
    }
  });
  return newArray;
};
