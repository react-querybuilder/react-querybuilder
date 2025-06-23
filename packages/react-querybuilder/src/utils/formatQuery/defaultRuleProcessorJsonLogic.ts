import type {
  FormatQueryFinalOptions,
  JsonLogicVar,
  RQBJsonLogic,
  RuleProcessor,
} from '../../types/index.noReact';
import { toArray } from '../arrayUtils';
import { isRuleGroup } from '../isRuleGroup';
import { parseNumber } from '../parseNumber';
import { defaultRuleGroupProcessorJsonLogic } from './defaultRuleGroupProcessorJsonLogic';
import { isValidValue, shouldRenderAsNumber } from './utils';

const convertOperator = (op: '<' | '<=' | '=' | '!=' | '>' | '>=') =>
  op
    .replace(/^(=)$/, '$1=')
    .replace(/^notnull$/i, '!=')
    .replace(/^null$/i, '==') as '<' | '<=' | '==' | '!=' | '===' | '!==' | '>' | '>=';

const negateIfNotOp = (op: string, jsonRule: RQBJsonLogic) =>
  op.startsWith('not') || op.startsWith('doesnot') ? { '!': jsonRule } : jsonRule;

/**
 * Default rule processor used by {@link formatQuery} for "jsonlogic" format.
 *
 * @group Export
 */
export const defaultRuleProcessorJsonLogic: RuleProcessor = (
  { field, operator, value, valueSource, match },
  options = {}
): RQBJsonLogic => {
  const { parseNumbers, preserveValueOrder } = options;
  const valueIsField = valueSource === 'field';
  const fieldObject: JsonLogicVar = { var: field };
  const fieldOrNumberRenderer = (v: string) =>
    valueIsField
      ? { var: `${v}` }
      : shouldRenderAsNumber(v, parseNumbers)
        ? parseNumber(v, { parseNumbers })
        : v;

  const { mode, threshold } = match ?? {};

  if (mode) {
    if (!isRuleGroup(value)) return false;

    const matchModeLC = mode.toLowerCase();

    const matchModeCoerced =
      matchModeLC === 'atleast' && match?.threshold === 1
        ? 'some'
        : matchModeLC === 'atmost' && match?.threshold === 0
          ? 'none'
          : matchModeLC;

    switch (matchModeCoerced) {
      case 'all':
      case 'none':
      case 'some':
        return {
          [matchModeCoerced]: [
            { var: field },
            value.rules.length === 1 && !isRuleGroup(value.rules[0])
              ? defaultRuleProcessorJsonLogic(value.rules[0], options)
              : defaultRuleGroupProcessorJsonLogic(value, options as FormatQueryFinalOptions),
          ],
        } as RQBJsonLogic;

      case 'atleast':
      case 'atmost':
      case 'exactly': {
        if (typeof threshold !== 'number' || threshold < 0) return false;

        const op =
          matchModeCoerced === 'atleast' ? '>=' : matchModeCoerced === 'atmost' ? '<=' : '==';

        const filteredCount = {
          reduce: [
            {
              filter: [
                { var: field },
                value.rules.length === 1 && !isRuleGroup(value.rules[0])
                  ? defaultRuleProcessorJsonLogic(value.rules[0], options)
                  : defaultRuleGroupProcessorJsonLogic(value, options as FormatQueryFinalOptions),
              ],
            },
            { '+': [1, { var: 'accumulator' }] },
            0,
          ],
        };

        if (threshold > 0 && threshold < 1) {
          const totalCount = {
            reduce: [{ var: field }, { '+': [1, { var: 'accumulator' }] }, 0],
          };
          return { [op]: [filteredCount, { '*': [totalCount, threshold] }] } as RQBJsonLogic;
        }
        return { [op]: [filteredCount, threshold] } as RQBJsonLogic;
      }
    }
  }

  const operatorLC = operator.toLowerCase();
  switch (operatorLC) {
    case '<':
    case '<=':
    case '=':
    case '!=':
    case '>':
    case '>=':
      return {
        [convertOperator(operatorLC)]: [fieldObject, fieldOrNumberRenderer(value)],
      } as RQBJsonLogic;

    case 'null':
    case 'notnull': {
      return {
        [`${operatorLC === 'notnull' ? '!' : '='}=`]: [fieldObject, null],
      } as RQBJsonLogic;
    }

    case 'in':
    case 'notin': {
      const valueAsArray = toArray(value).map(v => fieldOrNumberRenderer(v));
      return negateIfNotOp(operatorLC, { in: [fieldObject, valueAsArray] });
    }

    case 'between':
    case 'notbetween': {
      const valueAsArray = toArray(value);
      if (
        valueAsArray.length >= 2 &&
        isValidValue(valueAsArray[0]) &&
        isValidValue(valueAsArray[1])
      ) {
        let [first, second] = valueAsArray;
        if (
          !valueIsField &&
          shouldRenderAsNumber(first, true) &&
          shouldRenderAsNumber(second, true)
        ) {
          const firstNum = parseNumber(first, { parseNumbers: true });
          const secondNum = parseNumber(second, { parseNumbers: true });
          if (!preserveValueOrder && secondNum < firstNum) {
            const tempNum = secondNum;
            second = firstNum;
            first = tempNum;
          } else {
            first = firstNum;
            second = secondNum;
          }
        } else if (valueIsField) {
          first = { var: first };
          second = { var: second };
        }
        const jsonRule: RQBJsonLogic = { '<=': [first, fieldObject, second] };
        return negateIfNotOp(operatorLC, jsonRule);
      }
      return false;
    }

    case 'contains':
    case 'doesnotcontain': {
      const jsonRule: RQBJsonLogic = {
        in: [fieldOrNumberRenderer(value), fieldObject],
      };
      return negateIfNotOp(operatorLC, jsonRule);
    }

    case 'beginswith':
    case 'doesnotbeginwith': {
      const jsonRule: RQBJsonLogic = {
        startsWith: [fieldObject, fieldOrNumberRenderer(value)],
      };
      return negateIfNotOp(operatorLC, jsonRule);
    }

    case 'endswith':
    case 'doesnotendwith': {
      const jsonRule: RQBJsonLogic = {
        endsWith: [fieldObject, fieldOrNumberRenderer(value)],
      };
      return negateIfNotOp(operatorLC, jsonRule);
    }
  }
  return false;
};
