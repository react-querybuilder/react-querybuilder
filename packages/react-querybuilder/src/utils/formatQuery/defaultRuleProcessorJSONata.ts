import type { RuleProcessor } from '../../types/index.noReact';
import { toArray, trimIfString } from '../arrayUtils';
import { parseNumber } from '../parseNumber';
import { nullOrUndefinedOrEmpty, shouldRenderAsNumber } from './utils';

const shouldNegate = (op: string) => /^(does)?not/i.test(op);

const quote = (v: string | number | boolean | object | null, escapeQuotes?: boolean) =>
  `"${typeof v !== 'string' || !escapeQuotes ? v : v.replaceAll(`"`, `\\"`)}"`;

const negate = (clause: string, negate: boolean) => (negate ? `$not(${clause})` : `${clause}`);

const escapeStringRegex = (s: string) =>
  `${s}`.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');

/**
 * Default rule processor used by {@link formatQuery} for "jsonata" format.
 */
export const defaultRuleProcessorJSONata: RuleProcessor = (
  { field, operator, value, valueSource },
  // istanbul ignore next
  { escapeQuotes, parseNumbers = true } = {}
) => {
  const valueIsField = valueSource === 'field';
  const useBareValue =
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    shouldRenderAsNumber(value, parseNumbers);

  switch (operator) {
    case '<':
    case '<=':
    case '=':
    case '!=':
    case '>':
    case '>=':
      return `${field} ${operator} ${
        valueIsField || useBareValue ? trimIfString(value) : quote(value, escapeQuotes)
      }`;

    case 'contains':
    case 'doesNotContain':
      return negate(
        `$contains(${field}, ${valueIsField ? trimIfString(value) : quote(value, escapeQuotes)})`,
        shouldNegate(operator)
      );

    case 'beginsWith':
    case 'doesNotBeginWith':
      return negate(
        valueIsField
          ? `$substring(${field}, 0, $length(${trimIfString(value)})) = ${trimIfString(value)}`
          : `$contains(${field}, /^${escapeStringRegex(value)}/)`,
        shouldNegate(operator)
      );

    case 'endsWith':
    case 'doesNotEndWith':
      return negate(
        valueIsField
          ? `$substring(${field}, $length(${field}) - $length(${trimIfString(value)})) = ${trimIfString(value)}`
          : `$contains(${field}, /${escapeStringRegex(value)}$/)`,
        shouldNegate(operator)
      );

    case 'null':
      return `${field} = null`;

    case 'notNull':
      return `${field} != null`;

    case 'in':
    case 'notIn': {
      const valueAsArray = toArray(value);
      return negate(
        `${field} in [${valueAsArray
          .map(val =>
            valueIsField || shouldRenderAsNumber(val, parseNumbers)
              ? `${trimIfString(val)}`
              : quote(val, escapeQuotes)
          )
          .join(', ')}]`,
        shouldNegate(operator)
      );
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
        let firstValue = isNaN(firstNum) ? (valueIsField ? `${first}` : first) : firstNum;
        let secondValue = isNaN(secondNum) ? (valueIsField ? `${second}` : second) : secondNum;

        if (firstValue === firstNum && secondValue === secondNum && secondNum < firstNum) {
          const tempNum = secondNum;
          secondValue = firstNum;
          firstValue = tempNum;
        }

        const renderAsNumbers =
          shouldRenderAsNumber(first, parseNumbers) && shouldRenderAsNumber(second, parseNumbers);

        const expression = `${field} >= ${valueIsField ? first : renderAsNumbers ? firstValue : quote(firstValue, escapeQuotes)} and ${field} <= ${valueIsField ? second : renderAsNumbers ? secondValue : quote(secondValue, escapeQuotes)}`;

        return operator === 'between' ? `(${expression})` : negate(expression, true);
      } else {
        return '';
      }
    }
  }
  return '';
};
