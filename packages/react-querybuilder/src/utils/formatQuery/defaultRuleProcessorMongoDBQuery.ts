import type { RuleProcessor } from '../../types/index.noReact';
import { toArray } from '../arrayUtils';
import { parseNumber } from '../parseNumber';
import { isValidValue, mongoOperators, shouldRenderAsNumber } from './utils';

const processNumber = <T>(value: unknown, fallback: T, parseNumbers = false) =>
  shouldRenderAsNumber(value, parseNumbers || typeof value === 'bigint')
    ? Number(parseNumber(value, { parseNumbers: 'strict' }))
    : fallback;

/**
 * Default rule processor used by {@link formatQuery} for "mongodb_query" format.
 *
 * @group Export
 */
export const defaultRuleProcessorMongoDBQuery: RuleProcessor = (
  { field, operator, value, valueSource },
  // istanbul ignore next
  { parseNumbers, preserveValueOrder } = {}
) => {
  const valueIsField = valueSource === 'field';

  if (operator === '=' && !valueIsField) {
    return { [field]: processNumber(value, value, parseNumbers) };
  }

  const operatorLC = operator.toLowerCase();
  switch (operatorLC) {
    case '<':
    case '<=':
    case '=':
    case '!=':
    case '>':
    case '>=': {
      const mongoOperator = mongoOperators[operatorLC];
      return valueIsField
        ? { $expr: { [mongoOperator]: [`$${field}`, `$${value}`] } }
        : { [field]: { [mongoOperator]: processNumber(value, value, parseNumbers) } };
    }

    case 'contains':
      return valueIsField
        ? { $where: `this.${field}.includes(this.${value})` }
        : { [field]: { $regex: value } };

    case 'beginswith':
      return valueIsField
        ? { $where: `this.${field}.startsWith(this.${value})` }
        : { [field]: { $regex: `^${value}` } };

    case 'endswith':
      return valueIsField
        ? { $where: `this.${field}.endsWith(this.${value})` }
        : { [field]: { $regex: `${value}$` } };

    case 'doesnotcontain':
      return valueIsField
        ? { $where: `!this.${field}.includes(this.${value})` }
        : { [field]: { $not: { $regex: value } } };

    case 'doesnotbeginwith':
      return valueIsField
        ? { $where: `!this.${field}.startsWith(this.${value})` }
        : { [field]: { $not: { $regex: `^${value}` } } };

    case 'doesnotendwith':
      return valueIsField
        ? { $where: `!this.${field}.endsWith(this.${value})` }
        : { [field]: { $not: { $regex: `${value}$` } } };

    case 'null':
      return { [field]: null };

    case 'notnull':
      return { [field]: { $ne: null } };

    case 'in':
    case 'notin': {
      const valueAsArray = toArray(value);
      return valueIsField
        ? {
            $where: `${operatorLC === 'notin' ? '!' : ''}[${valueAsArray
              .map(val => `this.${val}`)
              .join(',')}].includes(this.${field})`,
          }
        : {
            [field]: {
              [mongoOperators[operatorLC]]: valueAsArray.map(val =>
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
        let firstValue = valueIsField ? first : isNaN(firstNum) ? first : firstNum;
        let secondValue = valueIsField ? second : isNaN(secondNum) ? second : secondNum;
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

        if (operatorLC === 'between') {
          return valueIsField
            ? {
                $and: [
                  { $expr: { $gte: [`$${field}`, `$${firstValue}`] } },
                  { $expr: { $lte: [`$${field}`, `$${secondValue}`] } },
                ],
              }
            : { [field]: { $gte: firstValue, $lte: secondValue } };
        } else {
          return valueIsField
            ? {
                $or: [
                  { $expr: { $lt: [`$${field}`, `$${firstValue}`] } },
                  { $expr: { $gt: [`$${field}`, `$${secondValue}`] } },
                ],
              }
            : { $or: [{ [field]: { $lt: firstValue } }, { [field]: { $gt: secondValue } }] };
        }
      } else {
        return '';
      }
    }
  }
  return '';
};
