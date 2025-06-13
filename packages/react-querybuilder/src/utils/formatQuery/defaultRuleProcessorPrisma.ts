import type { RuleProcessor } from '../../types/index.noReact';
import { toArray } from '../arrayUtils';
import { parseNumber } from '../parseNumber';
import { isValidValue, prismaOperators, shouldRenderAsNumber } from './utils';

const processNumber = <T>(value: unknown, fallback: T, parseNumbers: boolean) =>
  shouldRenderAsNumber(value, parseNumbers || typeof value === 'bigint')
    ? Number(parseNumber(value, { parseNumbers: 'strict' }))
    : fallback;

/**
 * Default rule processor used by {@link formatQuery} for "prisma" format.
 *
 * @group Export
 */
export const defaultRuleProcessorPrisma: RuleProcessor = (
  { field, operator, value, valueSource },
  // istanbul ignore next
  { parseNumbers = true, preserveValueOrder } = {}
) => {
  if (valueSource === 'field') return;

  const operatorLC = operator.toLowerCase();
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
        const firstNum = processNumber(first, NaN, true);
        const secondNum = processNumber(second, NaN, true);
        let firstValue = isNaN(firstNum) ? first : firstNum;
        let secondValue = isNaN(secondNum) ? second : secondNum;
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
