import { isOptionGroupArray } from '..';
import { filterFieldsByComparator, getValueSourcesUtil, uniqByName } from '../../internal';
import type {
  DefaultOperatorName,
  DefaultRuleGroupTypeAny,
  DefaultRuleType,
  Field,
  OptionGroup,
  ValueSources,
} from '../../types/index.noReact';
import { celParser } from './celParser';
import type { CELExpression } from './types';
import { convertRelop, isCELRelation } from './utils';

export const parseCEL = (
  cel: string,
  options: {
    fields?: Field[] | OptionGroup<Field>[] | Record<string, Field>;
    getValueSources?: (f: string, o: string) => ValueSources;
    independentCombinators?: boolean;
  } = {}
): DefaultRuleGroupTypeAny => {
  let ic = false;
  let fieldsFlat: Field[] = [];
  const getValueSources = options?.getValueSources;

  if (options) {
    const { independentCombinators, fields } = options;
    ic = !!independentCombinators;
    /* istanbul ignore else */
    if (fields) {
      const fieldsArray = Array.isArray(fields)
        ? fields
        : Object.keys(fields)
            .map(fld => ({ ...fields[fld], name: fld }))
            .sort((a, b) => a.label.localeCompare(b.label));
      if (isOptionGroupArray(fieldsArray)) {
        fieldsFlat = uniqByName(fieldsFlat.concat(...fieldsArray.map(opt => opt.options)));
      } else {
        fieldsFlat = uniqByName(fieldsArray);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function fieldIsValid(
    fieldName: string,
    operator: DefaultOperatorName,
    subordinateFieldName?: string
  ) {
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

  const processCELExpression = (
    expr: CELExpression
  ): DefaultRuleType | DefaultRuleGroupTypeAny | null => {
    if (isCELRelation(expr)) {
      const operator = convertRelop(expr.operator);
      const rule: DefaultRuleType = {
        field: JSON.stringify(expr.left),
        operator,
        value: JSON.stringify(expr.right),
      };
      return ic ? { rules: [rule] } : { combinator: 'and', rules: [rule] };
    }
    return null;
  };

  const { value } = celParser.parse(cel);
  if (value) {
    const result = processCELExpression(value);
    if (result) {
      if ('rules' in result) {
        return result;
      }
      return { rules: [result], ...(ic ? {} : { combinator: 'and' }) };
    }
  }
  return { rules: [], ...(ic ? {} : { combinator: 'and' }) };
};
