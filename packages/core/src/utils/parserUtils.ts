import type {
  DefaultOperatorName,
  FullField,
  FullOption,
  OptionList,
  ValueSource,
  ValueSourceFlexibleOptions,
  ValueSources,
} from '../types';
import { filterFieldsByComparator } from './filterFieldsByComparator';
import { getValueSourcesUtil } from './getValueSourcesUtil';
import { isFlexibleOptionArray, toFlatOptionArray, toFullOption } from './optGroupUtils';

export const getFieldsArray = (
  fields?: OptionList<FullField> | Record<string, FullField>
): FullOption[] => {
  const fieldsArray = fields
    ? Array.isArray(fields)
      ? fields
      : Object.keys(fields)
          .map(fld => ({ ...fields[fld], name: fld }))
          // oxlint-disable-next-line no-array-sort
          .sort((a, b) => a.label.localeCompare(b.label))
    : [];
  return toFlatOptionArray(fieldsArray);
};

export function fieldIsValidUtil(params: {
  fieldsFlat: FullField[];
  getValueSources?: (field: string, operator: string) => ValueSources | ValueSourceFlexibleOptions;
  fieldName: string;
  operator: DefaultOperatorName;
  subordinateFieldName?: string;
}): boolean {
  const { fieldsFlat, fieldName, operator, subordinateFieldName, getValueSources } = params;

  const vsIncludes = (vs: ValueSource) => {
    const vss = getValueSourcesUtil(primaryField, operator, getValueSources);
    return isFlexibleOptionArray(vss) && vss.some(vso => vso.value === vs || vso.name === vs);
  };

  // If fields option was an empty array or undefined, then all identifiers
  // are considered valid.
  if (fieldsFlat.length === 0) return true;

  let valid = false;

  const primaryField = toFullOption(fieldsFlat.find(ff => ff.name === fieldName)!);
  if (primaryField) {
    valid = !(
      !subordinateFieldName &&
      operator !== 'notNull' &&
      operator !== 'null' &&
      !vsIncludes('value')
    );

    if (valid && !!subordinateFieldName) {
      if (vsIncludes('field') && fieldName !== subordinateFieldName) {
        const validSubordinateFields = filterFieldsByComparator(
          primaryField,
          fieldsFlat,
          operator
        ) as FullField[];
        if (!validSubordinateFields.some(vsf => vsf.name === subordinateFieldName)) {
          valid = false;
        }
      } else {
        valid = false;
      }
    }
  }

  return valid;
}
