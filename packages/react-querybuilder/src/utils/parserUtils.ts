import type {
  DefaultOperatorName,
  Field,
  OptionGroup,
  ValueSources,
} from '@react-querybuilder/ts/src/index.noReact';
import { filterFieldsByComparator } from '../internal/filterFieldsByComparator';
import { getValueSourcesUtil } from '../internal/getValueSourcesUtil';
import { uniqByName } from '../internal/uniq';
import { isOptionGroupArray } from './optGroupUtils';

export const isPojo = (obj: any): obj is Record<string, any> =>
  obj === null || typeof obj !== 'object' ? false : Object.getPrototypeOf(obj) === Object.prototype;

export const getFieldsArray = (fields?: Field[] | OptionGroup<Field>[] | Record<string, Field>) => {
  let fieldsFlat: Field[] = [];
  const fieldsArray = !fields
    ? []
    : Array.isArray(fields)
    ? fields
    : Object.keys(fields)
        .map(fld => ({ ...fields[fld], name: fld }))
        .sort((a, b) => a.label.localeCompare(b.label));
  if (isOptionGroupArray(fieldsArray)) {
    fieldsFlat = uniqByName(fieldsFlat.concat(...fieldsArray.map(opt => opt.options)));
  } else {
    fieldsFlat = uniqByName(fieldsArray);
  }
  return fieldsFlat;
};

export function fieldIsValidUtil({
  fieldsFlat,
  fieldName,
  operator,
  subordinateFieldName,
  getValueSources,
}: {
  fieldsFlat: Field[];
  getValueSources?: (field: string, operator: string) => ValueSources;
  fieldName: string;
  operator: DefaultOperatorName;
  subordinateFieldName?: string;
}) {
  // If fields option was an empty array or undefined, then all identifiers
  // are considered valid.
  if (fieldsFlat.length === 0) return true;

  let valid = false;

  const primaryField = fieldsFlat.find(ff => ff.name === fieldName);
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
        ) as Field[];
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
