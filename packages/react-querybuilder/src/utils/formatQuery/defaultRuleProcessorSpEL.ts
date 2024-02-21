import type { RuleProcessor } from '../../types/index.noReact';
import { toArray, trimIfString } from '../arrayUtils';
import { parseNumber } from '../parseNumber';
import { shouldRenderAsNumber } from './utils';

const shouldNegate = (op: string) => /^(does)?not/i.test(op);

const wrapInNegation = (clause: string, negate: boolean) => (negate ? `!(${clause})` : `${clause}`);

const escapeSingleQuotes = (
  v: string | number | boolean | object | null,
  escapeQuotes?: boolean
) => (typeof v !== 'string' || !escapeQuotes ? v : v.replaceAll(`'`, `\\'`));

/**
 * Default rule processor used by {@link formatQuery} for "spel" format.
 */
export const defaultRuleProcessorSpEL: RuleProcessor = (
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
          : `'${escapeSingleQuotes(value, escapeQuotes)}'`
      }`;

    case 'contains':
    case 'doesNotContain':
      return wrapInNegation(
        `${field} matches ${
          valueIsField || useBareValue
            ? trimIfString(value)
            : `'${escapeSingleQuotes(value, escapeQuotes)}'`
        }`,
        shouldNegate(operatorTL)
      );

    case 'beginsWith':
    case 'doesNotBeginWith': {
      const valueTL = valueIsField
        ? `'^'.concat(${trimIfString(value)})`
        : `'${
            (typeof value === 'string' && !value.startsWith('^')) || useBareValue ? '^' : ''
          }${escapeSingleQuotes(value, escapeQuotes)}'`;
      return wrapInNegation(`${field} matches ${valueTL}`, shouldNegate(operatorTL));
    }

    case 'endsWith':
    case 'doesNotEndWith': {
      const valueTL = valueIsField
        ? `${trimIfString(value)}.concat('$')`
        : `'${escapeSingleQuotes(value, escapeQuotes)}${
            (typeof value === 'string' && !value.endsWith('$')) || useBareValue ? '$' : ''
          }'`;
      return wrapInNegation(`${field} matches ${valueTL}`, shouldNegate(operatorTL));
    }

    case 'null':
      return `${field} == null`;

    case 'notNull':
      return `${field} != null`;

    case 'in':
    case 'notIn': {
      const negate = shouldNegate(operatorTL) ? '!' : '';
      const valueAsArray = toArray(value);
      if (valueAsArray.length > 0) {
        return `${negate}(${valueAsArray
          .map(
            val =>
              `${field} == ${
                valueIsField || shouldRenderAsNumber(val, parseNumbers)
                  ? `${trimIfString(val)}`
                  : `'${escapeSingleQuotes(val, escapeQuotes)}'`
              }`
          )
          .join(' or ')})`;
      } else {
        return '';
      }
    }

    case 'between':
    case 'notBetween': {
      const valueAsArray = toArray(value);
      if (valueAsArray.length >= 2 && !!valueAsArray[0] && !!valueAsArray[1]) {
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
            : `'${escapeSingleQuotes(first, escapeQuotes)}'`
          : firstNum;
        let secondValue = isNaN(secondNum)
          ? valueIsField
            ? `${second}`
            : `'${escapeSingleQuotes(second, escapeQuotes)}'`
          : secondNum;
        if (firstValue === firstNum && secondValue === secondNum && secondNum < firstNum) {
          const tempNum = secondNum;
          secondValue = firstNum;
          firstValue = tempNum;
        }
        if (operator === 'between') {
          return `(${field} >= ${firstValue} and ${field} <= ${secondValue})`;
        } else {
          return `(${field} < ${firstValue} or ${field} > ${secondValue})`;
        }
      } else {
        return '';
      }
    }
  }

  return '';
};
