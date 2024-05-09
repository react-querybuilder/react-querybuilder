import type {
  DefaultOperatorName,
  FullField,
  OptionList,
  ValueSources,
} from '../types/index.noReact';
import { filterFieldsByComparator } from './filterFieldsByComparator';
import { getValueSourcesUtil } from './getValueSourcesUtil';
import { toFlatOptionArray } from './optGroupUtils';
import { toFullOption } from './toFullOption';

export const getFieldsArray = (fields?: OptionList<FullField> | Record<string, FullField>) => {
  const fieldsArray = !fields
    ? []
    : Array.isArray(fields)
      ? fields
      : Object.keys(fields)
          .map(fld => ({ ...fields[fld], name: fld }))
          .sort((a, b) => a.label.localeCompare(b.label));
  return toFlatOptionArray(fieldsArray);
};

export function fieldIsValidUtil(params: {
  fieldsFlat: FullField[];
  getValueSources?: (field: string, operator: string) => ValueSources;
  fieldName: string;
  operator: DefaultOperatorName;
  subordinateFieldName?: string;
}) {
  const { fieldsFlat, fieldName, operator, subordinateFieldName, getValueSources } = params;

  // If fields option was an empty array or undefined, then all identifiers
  // are considered valid.
  if (fieldsFlat.length === 0) return true;

  let valid = false;

  const primaryField = toFullOption(fieldsFlat.find(ff => ff.name === fieldName)!);
  if (primaryField) {
    if (
      !subordinateFieldName &&
      operator !== 'notNull' &&
      operator !== 'null' &&
      !getValueSourcesUtil(primaryField, operator, getValueSources).some(vs => vs === 'value')
    ) {
      valid = false;
    } else {
      valid = true;
    }

    if (valid && !!subordinateFieldName) {
      if (
        getValueSourcesUtil(primaryField, operator, getValueSources).some(vs => vs === 'field') &&
        fieldName !== subordinateFieldName
      ) {
        const validSubordinateFields = filterFieldsByComparator(
          primaryField,
          fieldsFlat,
          operator
        ) as FullField[];
        if (!validSubordinateFields.find(vsf => vsf.name === subordinateFieldName)) {
          valid = false;
        }
      } else {
        valid = false;
      }
    }
  }

  return valid;
}
