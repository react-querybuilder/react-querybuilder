import type { RuleProcessor } from '../../types/index.noReact';
import { toArray, trimIfString } from '../arrayUtils';
import { parseNumber } from '../parseNumber';
import { nullOrUndefinedOrEmpty, shouldRenderAsNumber } from './utils';

const shouldNegate = (op: string) => op.startsWith('not') || op.startsWith('doesnot');

const escapeDoubleQuotes = (
  v: string | number | boolean | object | null,
  escapeQuotes?: boolean
) => (typeof v !== 'string' || !escapeQuotes ? v : v.replaceAll(`"`, `\\"`));

/**
 * Default rule processor used by {@link formatQuery} for "cel" format.
 */
export const defaultRuleProcessorCEL: RuleProcessor = (
  { field, operator, value, valueSource },
  // istanbul ignore next
  { escapeQuotes, parseNumbers, preserveValueOrder } = {}
) => {
  const valueIsField = valueSource === 'field';
  const operatorTL = (operator === '=' ? '==' : operator).toLowerCase();
  const useBareValue =
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    shouldRenderAsNumber(value, parseNumbers);

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
          : `"${escapeDoubleQuotes(value, escapeQuotes)}"`
      }`;

    case 'contains':
    case 'doesnotcontain': {
      const negate = shouldNegate(operatorTL) ? '!' : '';
      return `${negate}${field}.contains(${
        valueIsField ? trimIfString(value) : `"${escapeDoubleQuotes(value, escapeQuotes)}"`
      })`;
    }

    case 'beginswith':
    case 'doesnotbeginwith': {
      const negate = shouldNegate(operatorTL) ? '!' : '';
      return `${negate}${field}.startsWith(${
        valueIsField ? trimIfString(value) : `"${escapeDoubleQuotes(value, escapeQuotes)}"`
      })`;
    }

    case 'endswith':
    case 'doesnotendwith': {
      const negate = shouldNegate(operatorTL) ? '!' : '';
      return `${negate}${field}.endsWith(${
        valueIsField ? trimIfString(value) : `"${escapeDoubleQuotes(value, escapeQuotes)}"`
      })`;
    }

    case 'null':
      return `${field} == null`;

    case 'notnull':
      return `${field} != null`;

    case 'in':
    case 'notin': {
      const [prefix, suffix] = shouldNegate(operatorTL) ? ['!(', ')'] : ['', ''];
      const valueAsArray = toArray(value);
      return `${prefix}${field} in [${valueAsArray
        .map(val =>
          valueIsField || shouldRenderAsNumber(val, parseNumbers)
            ? `${trimIfString(val)}`
            : `"${escapeDoubleQuotes(val, escapeQuotes)}"`
        )
        .join(', ')}]${suffix}`;
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
        const firstNum = shouldRenderAsNumber(first, true)
          ? parseNumber(first, { parseNumbers: true })
          : NaN;
        const secondNum = shouldRenderAsNumber(second, true)
          ? parseNumber(second, { parseNumbers: true })
          : NaN;
        let firstValue = isNaN(firstNum)
          ? valueIsField
            ? `${first}`
            : `"${escapeDoubleQuotes(first, escapeQuotes)}"`
          : firstNum;
        let secondValue = isNaN(secondNum)
          ? valueIsField
            ? `${second}`
            : `"${escapeDoubleQuotes(second, escapeQuotes)}"`
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
          ? `(${field} >= ${firstValue} && ${field} <= ${secondValue})`
          : `(${field} < ${firstValue} || ${field} > ${secondValue})`;
      } else {
        return '';
      }
    }
  }
  return '';
};
