import type { RuleProcessor } from '../../types/index.noReact';
import { toArray, trimIfString } from '../arrayUtils';
import { shouldRenderAsNumber } from './utils';

const shouldNegate = (op: string) => /^(does)?not/i.test(op);

const escapeDoubleQuotes = (v: any, escapeQuotes?: boolean) =>
  typeof v !== 'string' || !escapeQuotes ? v : v.replaceAll(`"`, `\\"`);

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
      if (valueAsArray.length > 0) {
        return `${negate ? '!(' : ''}${field} in [${valueAsArray
          .map(val =>
            valueIsField || shouldRenderAsNumber(val, parseNumbers)
              ? `${trimIfString(val)}`
              : `"${escapeDoubleQuotes(val, escapeQuotes)}"`
          )
          .join(', ')}]${negate ? ')' : ''}`;
      } else {
        return '';
      }
    }

    case 'between':
    case 'notBetween': {
      const valueAsArray = toArray(value);
      if (valueAsArray.length >= 2 && !!valueAsArray[0] && !!valueAsArray[1]) {
        const [first, second] = valueAsArray;
        const firstNum = shouldRenderAsNumber(first, true) ? parseFloat(first) : NaN;
        const secondNum = shouldRenderAsNumber(second, true) ? parseFloat(second) : NaN;
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
