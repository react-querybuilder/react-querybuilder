import type { Option, OptionGroup } from '../types/index.noReact';

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
