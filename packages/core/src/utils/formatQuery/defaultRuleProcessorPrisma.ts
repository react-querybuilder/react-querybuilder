import type { ParseNumbersPropConfig, RuleProcessor } from '../../types';
import { toArray } from '../arrayUtils';
import { lc } from '../misc';
import { parseNumber } from '../parseNumber';
import { isValidValue, prismaOperators, processMatchMode, shouldRenderAsNumber } from './utils';

const processNumber = <T>(
  value: unknown,
  fallback: T,
  parseNumbers?: ParseNumbersPropConfig | undefined
) =>
  shouldRenderAsNumber(value, !!parseNumbers || typeof value === 'bigint')
    ? Number(parseNumber(value, { parseNumbers: !!parseNumbers }))
    : fallback;

/**
 * Default rule processor used by {@link formatQuery} for "prisma" format.
 *
 * @group Export
 */
export const defaultRuleProcessorPrisma: RuleProcessor = (
  rule,
  // istanbul ignore next
  options = {}
) => {
  const { field, operator, value, valueSource } = rule;
  // istanbul ignore next
  const { parseNumbers, preserveValueOrder } = options;

  // Neither field-to-field comparisons nor match modes are supported in this format
  if (valueSource === 'field' || processMatchMode(rule)) return;

  const operatorLC = lc(operator);
  switch (operatorLC) {
    case '=':
      return { [field]: processNumber(value, value, parseNumbers) };

    case '!=':
    case '<':
    case '<=':
    case '>':
    case '>=': {
      const prismaOperator = prismaOperators[operatorLC];
      return {
        [field]: {
          [prismaOperator]: processNumber(value, value, parseNumbers),
        },
      };
    }

    case 'contains':
      return { [field]: { contains: value } };

    case 'beginswith':
      return { [field]: { startsWith: value } };

    case 'endswith':
      return { [field]: { endsWith: value } };

    case 'doesnotcontain':
      return { NOT: { [field]: { contains: value } } };

    case 'doesnotbeginwith':
      return { NOT: { [field]: { startsWith: value } } };

    case 'doesnotendwith':
      return { NOT: { [field]: { endsWith: value } } };

    case 'null':
      return { [field]: null };

    case 'notnull':
      return { [field]: { not: null } };

    case 'in':
    case 'notin': {
      const valueAsArray = toArray(value);
      return {
        [field]: {
          [prismaOperators[operatorLC]]: valueAsArray.map(val =>
            processNumber(val, val, parseNumbers)
          ),
        },
      };
    }

    case 'between':
    case 'notbetween': {
      const valueAsArray = toArray(value);
      if (
        valueAsArray.length >= 2 &&
        isValidValue(valueAsArray[0]) &&
        isValidValue(valueAsArray[1])
      ) {
        const [first, second] = valueAsArray;
        // For backwards compatibility, default to parsing numbers for between operators
        // unless parseNumbers is explicitly set to false
        const shouldParseNumbers = !(parseNumbers === false);
        const firstNum = shouldRenderAsNumber(first, shouldParseNumbers)
          ? parseNumber(first, { parseNumbers })
          : Number.NaN;
        const secondNum = shouldRenderAsNumber(second, shouldParseNumbers)
          ? parseNumber(second, { parseNumbers })
          : Number.NaN;
        let firstValue = Number.isNaN(firstNum) ? first : firstNum;
        let secondValue = Number.isNaN(secondNum) ? second : secondNum;
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

        return operatorLC === 'between'
          ? { [field]: { gte: firstValue, lte: secondValue } }
          : { OR: [{ [field]: { lt: firstValue } }, { [field]: { gt: secondValue } }] };
      } else {
        return '';
      }
    }
  }
  return '';
};
