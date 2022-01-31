import { Field, OptionGroup } from '../types';
import { isOptionGroupArray } from './optGroupUtils';

export const filterFieldsByComparator = (field: Field, fields: Field[] | OptionGroup<Field>[]) => {
  if (!field.comparator) {
    const filterOutSameName = (f: Field) => f.name !== field.name;
    if (isOptionGroupArray(fields)) {
      return fields.map(og => ({ ...og, options: og.options.filter(filterOutSameName) }));
    }
    return fields.filter(filterOutSameName);
  }

  const filterByComparator = (fieldToCompare: Field) => {
    if (field.name === fieldToCompare.name) {
      return false;
    }
    if (typeof field.comparator === 'string') {
      return field[field.comparator] === fieldToCompare[field.comparator];
    }
    return field.comparator!(fieldToCompare);
  };

  if (isOptionGroupArray(fields)) {
    return fields
      .map(og => ({ ...og, options: og.options.filter(filterByComparator) }))
      .filter(og => og.options.length > 0);
  }

  return fields.filter(filterByComparator);
};
