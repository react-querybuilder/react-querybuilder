import type { Field, OptionList } from '../types/index.noReact';
import { isOptionGroupArray } from './optGroupUtils';

/**
 * For a given {@link Field}, returns the `fields` list filtered for
 * other fields that match by `comparator`. Only fields *other than the
 * one in question* will ever be included, even if `comparator` is `null`
 * or `undefined`. If `comparator` is a string, fields with the same value
 * for that property will be included. If `comparator` is a function, each
 * field will be passed to the function along with the `operator` and fields
 * for which the function returns `true` will be included.
 */
export const filterFieldsByComparator = (
  /** The field in question. */
  field: Field,
  /** The full {@link Field} list to be filtered. */
  fields: OptionList<Field>,
  operator: string
) => {
  if (!field.comparator) {
    const filterOutSameName = (f: Field) => f.name !== field.name;
    if (isOptionGroupArray(fields)) {
      return fields.map(og => ({
        ...og,
        options: og.options.filter(filterOutSameName),
      }));
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
    return field.comparator!(fieldToCompare, operator);
  };

  if (isOptionGroupArray(fields)) {
    return fields
      .map(og => ({ ...og, options: og.options.filter(filterByComparator) }))
      .filter(og => og.options.length > 0);
  }

  return fields.filter(filterByComparator);
};
