import type {
  DefaultOperatorName,
  DefaultRuleGroupType,
  DefaultRuleType,
  Field,
  ParseJsonLogicOptions,
  RQBJsonLogic,
  ValueSource,
} from '@react-querybuilder/ts/dist/types/src/index.noReact';
import type { ReservedOperations } from 'json-logic-js';
import { filterFieldsByComparator } from '../../internal/filterFieldsByComparator';
import { getValueSourcesUtil } from '../../internal/getValueSourcesUtil';
import { uniqByName } from '../../internal/uniq';
import { isOptionGroupArray } from '../optGroupUtils';
import {
  isJsonLogicAnd,
  isJsonLogicDoubleNegation,
  isJsonLogicEqual,
  isJsonLogicGreaterThan,
  isJsonLogicGreaterThanOrEqual,
  isJsonLogicInArray,
  isJsonLogicInString,
  isJsonLogicLessThan,
  isJsonLogicLessThanOrEqual,
  isJsonLogicNegation,
  isJsonLogicNotEqual,
  isJsonLogicOr,
  isJsonLogicStrictEqual,
  isJsonLogicStrictNotEqual,
  isRQBJsonLogicEndsWith,
  isRQBJsonLogicStartsWith,
  isRQBJsonLogicVar,
} from './utils';

const emptyRuleGroup: DefaultRuleGroupType = { combinator: 'and', rules: [] };

/**
 * Converts a JsonLogic object into a query suitable for
 * the QueryBuilder component's `query` or `defaultQuery` props.
 */
export const parseJsonLogic = (
  rqbJsonLogic: RQBJsonLogic,
  options?: ParseJsonLogicOptions
): DefaultRuleGroupType => {
  const listsAsArrays = !!options?.listsAsArrays;
  let fieldsFlat: Field[] = [];
  const getValueSources = options?.getValueSources;

  if (options) {
    const { fields } = options;
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

  // Overload 1: Always return a rule group or false for the outermost logic object
  function processLogic(logic: RQBJsonLogic, outermost: true): DefaultRuleGroupType | false;
  // Overload 2: If not the outermost object, return value could also be a rule
  function processLogic(
    logic: RQBJsonLogic,
    outermost?: false
  ): DefaultRuleGroupType | DefaultRuleType | false;
  // Implementation
  function processLogic(
    logic: RQBJsonLogic,
    outermost?: boolean
  ): DefaultRuleGroupType | DefaultRuleType | false {
    // Bail if the outermost logic is not an object
    if (outermost && typeof logic !== 'object') {
      return false;
    }
    const key = Object.keys(logic)[0] as ReservedOperations;
    // @ts-expect-error `key in logic === true`, but TS doesn't know that
    const keyValue = logic[key];
    // Rule groups
    if (isJsonLogicAnd(logic)) {
      return {
        combinator: 'and',
        rules: logic.and.map(l => processLogic(l)).filter(Boolean) as (
          | DefaultRuleType
          | DefaultRuleGroupType
        )[],
      };
    } else if (isJsonLogicOr(logic)) {
      return {
        combinator: 'or',
        rules: logic.or.map(l => processLogic(l)).filter(Boolean) as (
          | DefaultRuleType
          | DefaultRuleGroupType
        )[],
      };
    } else if (isJsonLogicNegation(logic)) {
      const rule = processLogic(logic['!']);
      return rule ? { combinator: 'and', rules: [rule], not: true } : false;
    } else if (isJsonLogicDoubleNegation(logic)) {
      const rule = processLogic(logic['!!']);
      return rule || false;
    }

    // All other keys represent rules
    let rule: DefaultRuleType | false = false;
    let field = '';
    let operator: DefaultOperatorName = '=';
    let value: any = '';
    let valueSource: ValueSource | undefined = undefined;

    // Basic boolean operations
    if (
      isJsonLogicEqual(logic) ||
      isJsonLogicStrictEqual(logic) ||
      isJsonLogicNotEqual(logic) ||
      isJsonLogicStrictNotEqual(logic) ||
      isJsonLogicGreaterThan(logic) ||
      isJsonLogicGreaterThanOrEqual(logic) ||
      isJsonLogicLessThan(logic) ||
      isJsonLogicLessThanOrEqual(logic) ||
      isJsonLogicInString(logic) ||
      isRQBJsonLogicStartsWith(logic) ||
      isRQBJsonLogicEndsWith(logic)
    ) {
      const [first, second] = keyValue;
      if (isRQBJsonLogicVar(first) && typeof second !== 'object') {
        field = first.var;
        value = second;
      } else if (typeof first !== 'object' && isRQBJsonLogicVar(second)) {
        field = second.var;
        value = first;
      } else if (isRQBJsonLogicVar(first) && isRQBJsonLogicVar(second)) {
        field = first.var;
        value = second.var;
        valueSource = 'field';
      } else {
        return false;
      }

      // Translate operator if necessary
      if (isJsonLogicEqual(logic) || isJsonLogicStrictEqual(logic)) {
        operator = '=';
      } else if (isJsonLogicNotEqual(logic) || isJsonLogicStrictNotEqual(logic)) {
        operator = '!=';
      } else if (isJsonLogicInString(logic)) {
        operator = 'contains';
      } else if (isRQBJsonLogicStartsWith(logic)) {
        operator = 'beginsWith';
      } else if (isRQBJsonLogicEndsWith(logic)) {
        operator = 'endsWith';
      } else {
        operator = key as DefaultOperatorName;
      }

      if (fieldIsValid(field, operator, valueSource === 'field' ? value : undefined)) {
        rule = { field, operator, value, valueSource };
      }
    } else if (isJsonLogicInArray(logic) && isRQBJsonLogicVar(keyValue[0])) {
      field = keyValue[0].var;
      operator = 'in';
      if (logic.in[1].every(isRQBJsonLogicVar)) {
        valueSource = 'field';
        const fieldList = logic.in[1]
          .map(el => el.var as string)
          .filter(sf => fieldIsValid(field, operator, sf));
        value = listsAsArrays ? fieldList : fieldList.join(',');
      } else {
        // istanbul ignore else
        if (
          logic.in[1].every(el => typeof el === 'string') ||
          logic.in[1].every(el => typeof el === 'number') ||
          logic.in[1].every(el => typeof el === 'boolean')
        ) {
          value = listsAsArrays ? logic.in[1] : logic.in[1].map(el => `${el}`).join(',');
        }
      }

      // istanbul ignore else
      if (value.length > 0) {
        rule = { field, operator, value, valueSource };
      }
    }

    return !rule ? false : outermost ? { combinator: 'and', rules: [rule], not: false } : rule;
  }

  let logicRoot = rqbJsonLogic;
  if (typeof rqbJsonLogic === 'string') {
    try {
      logicRoot = JSON.parse(rqbJsonLogic);
    } catch (err) {
      return emptyRuleGroup;
    }
  }

  const result = processLogic(logicRoot, true);
  return !result ? emptyRuleGroup : result;
};
