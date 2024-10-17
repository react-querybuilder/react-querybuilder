import type {
  DefaultOperatorName,
  FullField,
  FullOption,
  OptionList,
  ValueSources,
} from '../types/index.noReact';
import { filterFieldsByComparator } from './filterFieldsByComparator';
import { getValueSourcesUtil } from './getValueSourcesUtil';
import { toFlatOptionArray, toFullOption } from './optGroupUtils';

export const getFieldsArray = (
  fields?: OptionList<FullField> | Record<string, FullField>
): FullOption[] => {
  const fieldsArray = fields
    ? Array.isArray(fields)
      ? fields
      : Object.keys(fields)
          .map(fld => ({ ...fields[fld], name: fld }))
          .sort((a, b) => a.label.localeCompare(b.label))
    : [];
  return toFlatOptionArray(fieldsArray);
};

export function fieldIsValidUtil(params: {
  fieldsFlat: FullField[];
  getValueSources?: (field: string, operator: string) => ValueSources;
  fieldName: string;
  operator: DefaultOperatorName;
  subordinateFieldName?: string;
}): boolean {
  const { fieldsFlat, fieldName, operator, subordinateFieldName, getValueSources } = params;

  // If fields option was an empty array or undefined, then all identifiers
  // are considered valid.
  if (fieldsFlat.length === 0) return true;

  let valid = false;

  const primaryField = toFullOption(fieldsFlat.find(ff => ff.name === fieldName)!);
  if (primaryField) {
    valid =
      !subordinateFieldName &&
      operator !== 'notNull' &&
      operator !== 'null' &&
      !getValueSourcesUtil(primaryField, operator, getValueSources).includes('value' as never)
        ? false
        : true;

    if (valid && !!subordinateFieldName) {
      if (
        getValueSourcesUtil(primaryField, operator, getValueSources).includes('field' as never) &&
        fieldName !== subordinateFieldName
      ) {
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
