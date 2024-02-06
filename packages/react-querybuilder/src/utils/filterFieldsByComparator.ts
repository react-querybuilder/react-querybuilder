import type { Field, FlexibleOptionList, ToFlexibleOption } from '../types/index.noReact';
import { isFlexibleOptionGroupArray } from './optGroupUtils';
import { toFullOption } from './toFullOption';

type FlexibleField = ToFlexibleOption<Field>;

const filterByComparator = (
  field: FlexibleField,
  operator: string,
  fieldToCompare: FlexibleField
) => {
  const fullField = toFullOption(field);
  const fullFieldToCompare = toFullOption(fieldToCompare);
  if (fullField.value === fullFieldToCompare.value) {
    return false;
  }
  if (typeof fullField.comparator === 'string') {
    return fullField[fullField.comparator] === fullFieldToCompare[fullField.comparator];
  }
  return fullField.comparator!(fullFieldToCompare, operator);
};

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
  field: FlexibleField,
  /** The full {@link Field} list to be filtered. */
  fields: FlexibleOptionList<Field>,
  operator: string
) => {
  if (!field.comparator) {
    const filterOutSameField = (f: FlexibleField) =>
      (f.value ?? f.name) !== (field.value ?? field.name);
    if (isFlexibleOptionGroupArray(fields)) {
      return fields.map(og => ({
        ...og,
        options: og.options.filter(filterOutSameField),
      }));
    }
    return fields.filter(filterOutSameField);
  }

  if (isFlexibleOptionGroupArray(fields)) {
    return fields
      .map(og => ({
        ...og,
        options: og.options.filter(f => filterByComparator(field, operator, f)),
      }))
      .filter(og => og.options.length > 0);
  }

  return fields.filter(f => filterByComparator(field, operator, f));
};
