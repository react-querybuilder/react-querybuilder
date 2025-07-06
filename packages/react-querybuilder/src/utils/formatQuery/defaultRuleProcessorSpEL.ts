import type {
  FormatQueryFinalOptions,
  RuleGroupType,
  RuleProcessor,
} from '../../types/index.noReact';
import { toArray, trimIfString } from '../arrayUtils';
import { lc, nullOrUndefinedOrEmpty } from '../misc';
import { parseNumber } from '../parseNumber';
import { transformQuery } from '../transformQuery';
import { defaultRuleGroupProcessorSpEL } from './defaultRuleGroupProcessorSpEL';
import { processMatchMode, shouldRenderAsNumber } from './utils';

const shouldNegate = (op: string) => op.startsWith('not') || op.startsWith('doesnot');

const wrapInNegation = (clause: string, negate: boolean) => (negate ? `!(${clause})` : `${clause}`);

const escapeSingleQuotes = (
  v: string | number | boolean | object | null,
  escapeQuotes?: boolean
) => (typeof v !== 'string' || !escapeQuotes ? v : v.replaceAll(`'`, `\\'`));

/**
 * Default rule processor used by {@link formatQuery} for "spel" format.
 *
 * @group Export
 */
export const defaultRuleProcessorSpEL: RuleProcessor = (
  rule,
  // istanbul ignore next
  opts = {}
) => {
  const { field, operator, value, valueSource } = rule;
  const { escapeQuotes, parseNumbers, preserveValueOrder } = opts;
  const valueIsField = valueSource === 'field';
  const operatorTL = lc(operator === '=' ? '==' : operator);
  const useBareValue =
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    shouldRenderAsNumber(value, parseNumbers);

  const matchEval = processMatchMode(rule);

  if (matchEval === false) {
    return '';
  } else if (matchEval) {
    const { mode, threshold } = matchEval;

    const nestedArrayFilter = defaultRuleGroupProcessorSpEL(
      transformQuery(rule.value as RuleGroupType, {
        ruleProcessor: r => ({ ...r, field: `${r.field || '#this'}` }),
      }),
      opts as FormatQueryFinalOptions
    );

    const totalCount = `${field}.size()`;
    const filteredCount = `${field}.?[${nestedArrayFilter}].size()`;

    switch (mode) {
      case 'all':
        return `${filteredCount} == ${totalCount}`;

      case 'none':
        return `${filteredCount} == 0`;

      case 'some':
        return `${filteredCount} >= 1`;

      case 'atleast':
      case 'atmost':
      case 'exactly': {
        const op = mode === 'atleast' ? '>=' : mode === 'atmost' ? '<=' : '==';

        if (threshold > 0 && threshold < 1) {
          return `${filteredCount} ${op} (${totalCount} * ${threshold})`;
        }
        return `${filteredCount} ${op} ${threshold}`;
      }
    }
  }

  switch (operatorTL) {
    case '<':
    case '<=':
    case '==':
    case '!=':
    case '>':
    case '>=':
      return `${field} ${operatorTL} ${
        valueIsField || useBareValue
          ? trimIfString(value)
          : `'${escapeSingleQuotes(value, escapeQuotes)}'`
      }`;

    case 'contains':
    case 'doesnotcontain':
      return wrapInNegation(
        `${field} matches ${
          valueIsField || useBareValue
            ? trimIfString(value)
            : `'${escapeSingleQuotes(value, escapeQuotes)}'`
        }`,
        shouldNegate(operatorTL)
      );

    case 'beginswith':
    case 'doesnotbeginwith': {
      const valueTL = valueIsField
        ? `'^'.concat(${trimIfString(value)})`
        : `'${
            (typeof value === 'string' && !value.startsWith('^')) || useBareValue ? '^' : ''
          }${escapeSingleQuotes(value, escapeQuotes)}'`;
      return wrapInNegation(`${field} matches ${valueTL}`, shouldNegate(operatorTL));
    }

    case 'endswith':
    case 'doesnotendwith': {
      const valueTL = valueIsField
        ? `${trimIfString(value)}.concat('$')`
        : `'${escapeSingleQuotes(value, escapeQuotes)}${
            (typeof value === 'string' && !value.endsWith('$')) || useBareValue ? '$' : ''
          }'`;
      return wrapInNegation(`${field} matches ${valueTL}`, shouldNegate(operatorTL));
    }

    case 'null':
      return `${field} == null`;

    case 'notnull':
      return `${field} != null`;

    case 'in':
    case 'notin': {
      const negate = shouldNegate(operatorTL) ? '!' : '';
      const valueAsArray = toArray(value);
      return valueAsArray.length > 0
        ? `${negate}(${valueAsArray
            .map(
              val =>
                `${field} == ${
                  valueIsField || shouldRenderAsNumber(val, parseNumbers)
                    ? `${trimIfString(val)}`
                    : `'${escapeSingleQuotes(val, escapeQuotes)}'`
                }`
            )
            .join(' or ')})`
        : '';
    }

    case 'between':
    case 'notbetween': {
      const valueAsArray = toArray(value);
      if (
        valueAsArray.length >= 2 &&
        !nullOrUndefinedOrEmpty(valueAsArray[0]) &&
        !nullOrUndefinedOrEmpty(valueAsArray[1])
      ) {
        const [first, second] = valueAsArray;
        // For backwards compatibility in SpEL format, between operators should parse numbers
        // unless parseNumbers is explicitly set to false
        const shouldParseNumbers = !(parseNumbers === false);
        const firstNum = shouldRenderAsNumber(first, shouldParseNumbers)
          ? parseNumber(first, { parseNumbers: shouldParseNumbers })
          : Number.NaN;
        const secondNum = shouldRenderAsNumber(second, shouldParseNumbers)
          ? parseNumber(second, { parseNumbers: shouldParseNumbers })
          : Number.NaN;
        let firstValue = Number.isNaN(firstNum)
          ? valueIsField
            ? `${first}`
            : `'${escapeSingleQuotes(first, escapeQuotes)}'`
          : firstNum;
        let secondValue = Number.isNaN(secondNum)
          ? valueIsField
            ? `${second}`
            : `'${escapeSingleQuotes(second, escapeQuotes)}'`
          : secondNum;
        if (
          !preserveValueOrder &&
          firstValue === firstNum &&
          secondValue === secondNum &&
          secondNum < firstNum
        ) {
          const tempNum = secondNum;
          secondValue = firstNum;
          firstValue = tempNum;
        }
        return operatorTL === 'between'
          ? `(${field} >= ${firstValue} and ${field} <= ${secondValue})`
          : `(${field} < ${firstValue} or ${field} > ${secondValue})`;
      } else {
        return '';
      }
    }
  }

  return '';
};
