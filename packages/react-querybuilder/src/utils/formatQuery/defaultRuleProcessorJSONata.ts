import type { RuleProcessor } from '../../types/index.noReact';
import { toArray, trimIfString } from '../arrayUtils';
import { parseNumber } from '../parseNumber';
import { nullOrUndefinedOrEmpty, getQuotedFieldName, shouldRenderAsNumber } from './utils';

const shouldNegate = (op: string) => /^(does)?not/i.test(op);

const quote = (v: string | number | boolean | object | null, escapeQuotes?: boolean) =>
  `"${typeof v !== 'string' || !escapeQuotes ? v : v.replaceAll(`"`, `\\"`)}"`;

const negate = (clause: string, negate: boolean) => (negate ? `$not(${clause})` : `${clause}`);

const escapeStringRegex = (s: string) =>
  `${s}`.replaceAll(/[$()*+.?[\\\]^{|}]/g, String.raw`\$&`).replaceAll('-', String.raw`\x2d`);

/**
 * Default rule processor used by {@link formatQuery} for "jsonata" format.
 */
export const defaultRuleProcessorJSONata: RuleProcessor = (
  { field, operator, value, valueSource },
  // istanbul ignore next
  {
    escapeQuotes,
    parseNumbers = true,
    quoteFieldNamesWith = ['', ''] as [string, string],
    fieldIdentifierSeparator = '',
  } = {}
) => {
  const valueIsField = valueSource === 'field';
  const useBareValue =
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    shouldRenderAsNumber(value, parseNumbers);

  const qfn = (f: string) =>
    getQuotedFieldName(f, { quoteFieldNamesWith, fieldIdentifierSeparator });

  switch (operator) {
    case '<':
    case '<=':
    case '=':
    case '!=':
    case '>':
    case '>=':
      return `${qfn(field)} ${operator} ${
        valueIsField
          ? qfn(trimIfString(value))
          : useBareValue
            ? trimIfString(value)
            : quote(value, escapeQuotes)
      }`;

    case 'contains':
    case 'doesNotContain':
      return negate(
        `$contains(${qfn(field)}, ${valueIsField ? qfn(trimIfString(value)) : quote(value, escapeQuotes)})`,
        shouldNegate(operator)
      );

    case 'beginsWith':
    case 'doesNotBeginWith':
      return negate(
        valueIsField
          ? `$substring(${qfn(field)}, 0, $length(${qfn(trimIfString(value))})) = ${qfn(trimIfString(value))}`
          : `$contains(${qfn(field)}, /^${escapeStringRegex(value)}/)`,
        shouldNegate(operator)
      );

    case 'endsWith':
    case 'doesNotEndWith':
      return negate(
        valueIsField
          ? `$substring(${qfn(field)}, $length(${qfn(field)}) - $length(${qfn(trimIfString(value))})) = ${qfn(trimIfString(value))}`
          : `$contains(${qfn(field)}, /${escapeStringRegex(value)}$/)`,
        shouldNegate(operator)
      );

    case 'null':
      return `${qfn(field)} = null`;

    case 'notNull':
      return `${qfn(field)} != null`;

    case 'in':
    case 'notIn': {
      const valueAsArray = toArray(value);
      return negate(
        `${qfn(field)} in [${valueAsArray
          .map(val =>
            valueIsField
              ? `${qfn(trimIfString(val))}`
              : shouldRenderAsNumber(val, parseNumbers)
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
        valueAsArray.length < 2 ||
        nullOrUndefinedOrEmpty(valueAsArray[0]) ||
        nullOrUndefinedOrEmpty(valueAsArray[1])
      ) {
        return '';
      }

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

      const expression = `${qfn(field)} >= ${valueIsField ? qfn(first) : renderAsNumbers ? firstValue : quote(firstValue, escapeQuotes)} and ${qfn(field)} <= ${valueIsField ? qfn(second) : renderAsNumbers ? secondValue : quote(secondValue, escapeQuotes)}`;

      return operator === 'between' ? `(${expression})` : negate(expression, true);
    }
  }

  return '';
};
