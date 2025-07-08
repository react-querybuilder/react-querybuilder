import { defaultOperatorNegationMap } from '../../defaults';
import type { ParserCommonOptions } from '../../types/import';
import type {
  DefaultOperatorName,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeAny,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  Except,
  MatchConfig,
  RQBJsonLogic,
  RQBJsonLogicVar,
  RuleGroupTypeAny,
  RuleType,
  ValueSource,
} from '../../types';
import { joinWith } from '../arrayUtils';
import { convertToIC } from '../convertQuery';
import { isRuleGroup, isRuleGroupType } from '../isRuleGroup';
import { isPojo } from '../misc';
import { objectKeys } from '../objectUtils';
import { fieldIsValidUtil, getFieldsArray } from '../parserUtils';
import { prepareRuleGroup } from '../prepareQueryObjects';
import {
  isJsonLogicAll,
  isJsonLogicAnd,
  isJsonLogicBetweenExclusive,
  isJsonLogicBetweenInclusive,
  isJsonLogicDoubleNegation,
  isJsonLogicEqual,
  isJsonLogicGreaterThan,
  isJsonLogicGreaterThanOrEqual,
  isJsonLogicInArray,
  isJsonLogicInString,
  isJsonLogicLessThan,
  isJsonLogicLessThanOrEqual,
  isJsonLogicNegation,
  isJsonLogicNone,
  isJsonLogicNotEqual,
  isJsonLogicOr,
  isJsonLogicSome,
  isJsonLogicStrictEqual,
  isJsonLogicStrictNotEqual,
  isRQBJsonLogicEndsWith,
  isRQBJsonLogicStartsWith,
  isRQBJsonLogicVar,
} from './utils';

/**
 * Options object for {@link parseJsonLogic}.
 */
export interface ParseJsonLogicOptions extends ParserCommonOptions {
  // oxlint-disable-next-line typescript/no-explicit-any
  jsonLogicOperations?: Record<string, (value: any) => RuleType | RuleGroupTypeAny | false>;
}

const emptyRuleGroup: DefaultRuleGroupType = { combinator: 'and', rules: [] };

/**
 * Converts a JsonLogic object into a query suitable for the
 * {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!DefaultRuleGroupType DefaultRuleGroupType}).
 */
function parseJsonLogic(rqbJsonLogic: string | RQBJsonLogic): DefaultRuleGroupType;
/**
 * Converts a JsonLogic object into a query suitable for the
 * {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!DefaultRuleGroupType DefaultRuleGroupType}).
 */
function parseJsonLogic(
  rqbJsonLogic: string | RQBJsonLogic,
  options: Except<ParseJsonLogicOptions, 'independentCombinators'> & {
    independentCombinators?: false;
  }
): DefaultRuleGroupType;
/**
 * Converts a JsonLogic object into a query suitable for the
 * {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!DefaultRuleGroupTypeIC DefaultRuleGroupTypeIC}).
 */
function parseJsonLogic(
  rqbJsonLogic: string | RQBJsonLogic,
  options: Except<ParseJsonLogicOptions, 'independentCombinators'> & {
    independentCombinators: true;
  }
): DefaultRuleGroupTypeIC;
function parseJsonLogic(
  rqbJsonLogic: string | RQBJsonLogic,
  options: ParseJsonLogicOptions = {}
): DefaultRuleGroupTypeAny {
  const fieldsFlat = getFieldsArray(options.fields);
  const { getValueSources, listsAsArrays, jsonLogicOperations } = options;

  const fieldIsValid = (
    fieldName: string,
    operator: DefaultOperatorName,
    subordinateFieldName?: string
  ) =>
    fieldIsValidUtil({
      fieldName,
      fieldsFlat,
      operator,
      subordinateFieldName,
      getValueSources,
    });

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
    // Bail if the outermost logic is not a plain object
    if (outermost && !isPojo(logic)) {
      return false;
    }
    const [key, keyValue] = Object.entries(logic || {})?.[0] ?? [];

    // Custom operations process logic
    if (jsonLogicOperations && objectKeys(jsonLogicOperations).includes(key)) {
      const rule = jsonLogicOperations[key](keyValue) as DefaultRuleType;
      return rule
        ? outermost && !isRuleGroup(rule)
          ? { combinator: 'and', rules: [rule] }
          : rule
        : false;
    }

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
      if (rule) {
        if (
          !isRuleGroupType(rule) &&
          (rule.operator === 'between' ||
            rule.operator === 'in' ||
            rule.operator === 'contains' ||
            rule.operator === 'beginsWith' ||
            rule.operator === 'endsWith')
        ) {
          const newRule = { ...rule, operator: defaultOperatorNegationMap[rule.operator] };
          if (outermost) {
            return { combinator: 'and', rules: [newRule] };
          }
          return newRule;
        } else if (isJsonLogicBetweenExclusive(logic['!']) || isRuleGroupType(rule)) {
          return { ...rule, not: true };
        }
        return { combinator: 'and', rules: [rule], not: true };
      }
      return false;
    } else if (isJsonLogicDoubleNegation(logic)) {
      const rule = processLogic(logic['!!']);
      return rule || false;
    }

    // All other keys represent rules
    let rule: DefaultRuleType | false = false;
    let field = '';
    let operator: DefaultOperatorName = '=';
    // oxlint-disable-next-line typescript/no-explicit-any
    let value: any = '';
    let valueSource: ValueSource | undefined = undefined;

    if (
      // Basic boolean operations
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
      if (isRQBJsonLogicVar(first) && !isPojo(second)) {
        field = first.var;
        value = second;
      } else if (!isPojo(first) && isRQBJsonLogicVar(second)) {
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
        operator = value === null ? 'null' : '=';
      } else if (isJsonLogicNotEqual(logic) || isJsonLogicStrictNotEqual(logic)) {
        operator = value === null ? 'notNull' : '!=';
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
    } else if (
      (isJsonLogicAll(logic) && isRQBJsonLogicVar(logic['all'][0])) ||
      (isJsonLogicNone(logic) && isRQBJsonLogicVar(logic['none'][0])) ||
      (isJsonLogicSome(logic) && isRQBJsonLogicVar(logic['some'][0]))
    ) {
      // The array coverage functions must have a field as their first element.
      // Otherwise we'd be comparing values to values, which is not supported.
      const match: MatchConfig = {
        mode: isJsonLogicNone(logic) ? 'none' : isJsonLogicSome(logic) ? 'some' : 'all',
      };

      // oxlint-disable-next-line typescript/no-explicit-any
      const [{ var: field }, operation] = (logic as any)[match.mode];
      const matcher = processLogic(operation);

      // TODO: Support operations that evaluate array member properties
      if (!matcher) return false;

      rule = {
        field,
        operator: '=',
        match,
        value: isRuleGroup(matcher) ? matcher : { combinator: 'and', rules: [matcher] },
      };
    } else if (isJsonLogicBetweenExclusive(logic) && isRQBJsonLogicVar(logic['<'][1])) {
      field = logic['<'][1].var;
      const values = [logic['<'][0], logic['<'][2]];
      // istanbul ignore else
      if (
        values.every(v => isRQBJsonLogicVar(v)) ||
        values.every(el => typeof el === 'string') ||
        values.every(el => typeof el === 'number') ||
        values.every(el => typeof el === 'boolean')
      ) {
        return (
          processLogic({
            and: [{ '>': [{ var: field }, values[0]] }, { '<': [{ var: field }, values[1]] }],
          }) || /* istanbul ignore next */ false
        );
      }
    } else if (isJsonLogicBetweenInclusive(logic) && isRQBJsonLogicVar(logic['<='][1])) {
      field = logic['<='][1].var;
      operator = 'between';
      const values = [logic['<='][0], logic['<='][2]];
      if (logic['<='].every(v => isRQBJsonLogicVar(v))) {
        const vars = values as RQBJsonLogicVar[];
        valueSource = 'field';
        const fieldList = vars.map(el => el.var).filter(sf => fieldIsValid(field, operator, sf));
        value = listsAsArrays ? fieldList : joinWith(fieldList, ',');
      } else {
        // istanbul ignore else
        if (
          values.every(el => typeof el === 'string') ||
          values.every(el => typeof el === 'number') ||
          values.every(el => typeof el === 'boolean')
        ) {
          value = listsAsArrays
            ? values
            : joinWith(
                values.map(el => `${el}`),
                ','
              );
        }
      }

      if (fieldIsValid(field, operator) && value.length >= 2) {
        rule = { field, operator, value, valueSource };
      }
    } else if (isJsonLogicInArray(logic) && isRQBJsonLogicVar(keyValue[0])) {
      field = keyValue[0].var;
      operator = 'in';
      if (logic.in[1].every(v => isRQBJsonLogicVar(v))) {
        valueSource = 'field';
        const fieldList = logic.in[1]
          .map(el => el.var as string)
          .filter(sf => fieldIsValid(field, operator, sf));
        value = listsAsArrays ? fieldList : joinWith(fieldList, ',');
      } else {
        // istanbul ignore else
        if (
          logic.in[1].every(el => typeof el === 'string') ||
          logic.in[1].every(el => typeof el === 'number') ||
          logic.in[1].every(el => typeof el === 'boolean')
        ) {
          value = listsAsArrays
            ? logic.in[1]
            : joinWith(
                logic.in[1].map(el => `${el}`),
                ','
              );
        }
      }

      // istanbul ignore else
      if (value.length > 0) {
        rule = { field, operator, value, valueSource };
      }
    }

    return rule ? (outermost ? { combinator: 'and', rules: [rule] } : rule) : false;
  }

  const prepare = options.generateIDs ? prepareRuleGroup : <T>(g: T) => g;

  let logicRoot = rqbJsonLogic;
  if (typeof rqbJsonLogic === 'string') {
    try {
      logicRoot = JSON.parse(rqbJsonLogic);
    } catch {
      return prepare(emptyRuleGroup);
    }
  }

  const result = processLogic(logicRoot, true);
  const finalQuery: DefaultRuleGroupType = result || emptyRuleGroup;
  return prepare(
    options.independentCombinators ? convertToIC<DefaultRuleGroupTypeIC>(finalQuery) : finalQuery
  );
}

export { parseJsonLogic };
