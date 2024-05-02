import type { RuleProcessor } from '../../types/index.noReact';
import { toArray, trimIfString } from '../arrayUtils';
import { parseNumber } from '../parseNumber';
import { nullOrUndefinedOrEmpty, shouldRenderAsNumber } from './utils';

const shouldNegate = (op: string) => /^(does)?not/i.test(op);

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
  { escapeQuotes, parseNumbers } = {}
) => {
  const valueIsField = valueSource === 'field';
  const operatorTL = operator.replace(/^=$/, '==');
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
    case 'doesNotContain': {
      const negate = shouldNegate(operatorTL) ? '!' : '';
      return `${negate}${field}.contains(${
        valueIsField ? trimIfString(value) : `"${escapeDoubleQuotes(value, escapeQuotes)}"`
      })`;
    }

    case 'beginsWith':
    case 'doesNotBeginWith': {
      const negate = shouldNegate(operatorTL) ? '!' : '';
      return `${negate}${field}.startsWith(${
        valueIsField ? trimIfString(value) : `"${escapeDoubleQuotes(value, escapeQuotes)}"`
      })`;
    }

    case 'endsWith':
    case 'doesNotEndWith': {
      const negate = shouldNegate(operatorTL) ? '!' : '';
      return `${negate}${field}.endsWith(${
        valueIsField ? trimIfString(value) : `"${escapeDoubleQuotes(value, escapeQuotes)}"`
      })`;
    }

    case 'null':
      return `${field} == null`;

    case 'notNull':
      return `${field} != null`;

    case 'in':
    case 'notIn': {
      const negate = shouldNegate(operatorTL);
      const valueAsArray = toArray(value);
      return `${negate ? '!(' : ''}${field} in [${valueAsArray
        .map(val =>
          valueIsField || shouldRenderAsNumber(val, parseNumbers)
            ? `${trimIfString(val)}`
            : `"${escapeDoubleQuotes(val, escapeQuotes)}"`
        )
        .join(', ')}]${negate ? ')' : ''}`;
    }

    case 'between':
    case 'notBetween': {
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

        if (firstValue === firstNum && secondValue === secondNum && secondNum < firstNum) {
          const tempNum = secondNum;
          secondValue = firstNum;
          firstValue = tempNum;
        }

        if (operator === 'between') {
          return `(${field} >= ${firstValue} && ${field} <= ${secondValue})`;
        } else {
          return `(${field} < ${firstValue} || ${field} > ${secondValue})`;
        }
      } else {
        return '';
      }
    }
  }
  return '';
};
