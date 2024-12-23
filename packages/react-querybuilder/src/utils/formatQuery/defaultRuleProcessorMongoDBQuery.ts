import type { RuleProcessor } from '../../types/index.noReact';
import { toArray } from '../arrayUtils';
import { parseNumber } from '../parseNumber';
import { isValidValue, mongoOperators, shouldRenderAsNumber } from './utils';

/**
 * Default rule processor used by {@link formatQuery} for "mongodb_query" format.
 */
export const defaultRuleProcessorMongoDBQuery: RuleProcessor = (
  { field, operator, value, valueSource },
  // istanbul ignore next
  { parseNumbers } = {}
) => {
  const valueIsField = valueSource === 'field';

  if (operator === '=' && !valueIsField) {
    return {
      [field]: shouldRenderAsNumber(value, parseNumbers)
        ? parseNumber(value, { parseNumbers: 'strict' })
        : value,
    };
  }

  switch (operator) {
    case '<':
    case '<=':
    case '=':
    case '!=':
    case '>':
    case '>=': {
      const mongoOperator = mongoOperators[operator];
      return valueIsField
        ? { $expr: { [mongoOperator]: [`$${field}`, `$${value}`] } }
        : {
            [field]: {
              [mongoOperator]: shouldRenderAsNumber(value, parseNumbers)
                ? parseNumber(value, { parseNumbers: 'strict' })
                : value,
            },
          };
    }

    case 'contains':
      return valueIsField
        ? { $where: `this.${field}.includes(this.${value})` }
        : { [field]: { $regex: value } };

    case 'beginsWith':
      return valueIsField
        ? { $where: `this.${field}.startsWith(this.${value})` }
        : { [field]: { $regex: `^${value}` } };

    case 'endsWith':
      return valueIsField
        ? { $where: `this.${field}.endsWith(this.${value})` }
        : { [field]: { $regex: `${value}$` } };

    case 'doesNotContain':
      return valueIsField
        ? { $where: `!this.${field}.includes(this.${value})` }
        : { [field]: { $not: { $regex: value } } };

    case 'doesNotBeginWith':
      return valueIsField
        ? { $where: `!this.${field}.startsWith(this.${value})` }
        : { [field]: { $not: { $regex: `^${value}` } } };

    case 'doesNotEndWith':
      return valueIsField
        ? { $where: `!this.${field}.endsWith(this.${value})` }
        : { [field]: { $not: { $regex: `${value}$` } } };

    case 'null':
      return { [field]: null };

    case 'notNull':
      return { [field]: { $ne: null } };

    case 'in':
    case 'notIn': {
      const valueAsArray = toArray(value);
      return valueIsField
        ? {
            $where: `${operator === 'notIn' ? '!' : ''}[${valueAsArray
              .map(val => `this.${val}`)
              .join(',')}].includes(this.${field})`,
          }
        : {
            [field]: {
              [mongoOperators[operator]]: valueAsArray.map(val =>
                shouldRenderAsNumber(val, parseNumbers)
                  ? parseNumber(val, { parseNumbers: 'strict' })
                  : val
              ),
            },
          };
    }

    case 'between':
    case 'notBetween': {
      const valueAsArray = toArray(value);
      if (
        valueAsArray.length >= 2 &&
        isValidValue(valueAsArray[0]) &&
        isValidValue(valueAsArray[1])
      ) {
        const [first, second] = valueAsArray;
        const firstNum = shouldRenderAsNumber(first, true)
          ? parseNumber(first, { parseNumbers: 'strict' })
          : NaN;
        const secondNum = shouldRenderAsNumber(second, true)
          ? parseNumber(second, { parseNumbers: 'strict' })
          : NaN;
        const firstValue = valueIsField ? first : isNaN(firstNum) ? first : firstNum;
        const secondValue = valueIsField ? second : isNaN(secondNum) ? second : secondNum;
        if (operator === 'between') {
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
