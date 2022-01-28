import { Field, OptionGroup } from '../types';
import { isOptionGroupArray } from './optGroupUtils';

export const filterFieldsByComparator = (field: Field, fields: Field[] | OptionGroup<Field>[]) => {
  if (!field.comparator) {
    return fields;
  }

  const filterByComparator = (fieldToCompare: Field) => {
    if (field.name === fieldToCompare.name) {
      return false;
    }
    if (typeof field.comparator === 'string') {
      return field[field.comparator] === fieldToCompare[field.comparator];
    }
    const comparator = field.comparator ?? (() => true);
    return comparator(fieldToCompare);
  };

  if (isOptionGroupArray(fields)) {
    return fields
      .map(og => ({ ...og, options: og.options.filter(filterByComparator) }))
      .filter(og => og.options.length > 0);
  }

  return fields.filter(filterByComparator);
};
