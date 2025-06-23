import type { RuleProcessor } from '../../types/index.noReact';
import { toArray, trimIfString } from '../arrayUtils';
import { lc, nullOrUndefinedOrEmpty } from '../misc';
import { parseNumber } from '../parseNumber';
import { shouldRenderAsNumber } from './utils';

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
  { field, operator, value, valueSource },
  // istanbul ignore next
  { escapeQuotes, parseNumbers, preserveValueOrder } = {}
) => {
  const valueIsField = valueSource === 'field';
  const operatorTL = lc(operator === '=' ? '==' : operator);
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
