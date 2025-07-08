import type { FullField, FullOption, OptionList, WithUnknownIndex } from '../types';
import { isFlexibleOptionGroupArray, toFullOption } from './optGroupUtils';

const filterByComparator = (field: FullField, operator: string, fieldToCompare: FullField) => {
  const fullField = toFullOption(field);
  const fullFieldToCompare = toFullOption(fieldToCompare);
  if (fullField.value === fullFieldToCompare.value) {
    return false;
  }
  if (typeof fullField.comparator === 'string') {
    return fullField[fullField.comparator] === fullFieldToCompare[fullField.comparator];
  }
  return fullField.comparator?.(fullFieldToCompare, operator) ?? /* istanbul ignore next */ false;
};

/**
 * For a given {@link FullField}, returns the `fields` list filtered for
 * other fields that match by `comparator`. Only fields *other than the
 * one in question* will ever be included, even if `comparator` is `null`
 * or `undefined`. If `comparator` is a string, fields with the same value
 * for that property will be included. If `comparator` is a function, each
 * field will be passed to the function along with the `operator` and fields
 * for which the function returns `true` will be included.
 *
 * @group Option Lists
 */
export const filterFieldsByComparator = (
  /** The field in question. */
  field: FullField,
  /** The full {@link FullField} list to be filtered. */
  fields: OptionList<FullField>,
  operator: string
):
  | FullField<string, string, string, FullOption<string>, FullOption<string>>[]
  | {
      options: WithUnknownIndex<
        FullField<string, string, string, FullOption<string>, FullOption<string>>
      >[];
      label: string;
    }[] => {
  if (!field.comparator) {
    const filterOutSameField = (f: FullField) =>
      (f.value ?? /* istanbul ignore next */ f.name) !==
      (field.value ?? /* istanbul ignore next */ field.name);
    if (isFlexibleOptionGroupArray(fields)) {
      return fields.map(og => ({
        ...og,
        options: og.options.filter(v => filterOutSameField(v)),
      }));
    }
    return fields.filter(v => filterOutSameField(v));
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
