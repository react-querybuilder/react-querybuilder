import type { RuleProcessor } from '../../types/index.noReact';
import { toArray } from '../arrayUtils';
import { parseNumber } from '../parseNumber';
import { isValidValue, mongoOperators, shouldRenderAsNumber } from './utils';

// Just a little shortcut.
const str = JSON.stringify;

/**
 * Default rule processor used by {@link formatQuery} for "mongodb" format.
 */
export const defaultRuleProcessorMongoDB: RuleProcessor = (
  { field, operator, value, valueSource },
  // istanbul ignore next
  { parseNumbers } = {}
) => {
  const valueIsField = valueSource === 'field';

  if (operator === '=' && !valueIsField) {
    return str({
      [field]: shouldRenderAsNumber(value, parseNumbers)
        ? parseNumber(value, { parseNumbers: 'strict' })
        : value,
    });
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
        ? str({ $expr: { [mongoOperator]: [`$${field}`, `$${value}`] } })
        : str({
            [field]: {
              [mongoOperator]: shouldRenderAsNumber(value, parseNumbers)
                ? parseNumber(value, { parseNumbers: 'strict' })
                : value,
            },
          });
    }

    case 'contains':
      return valueIsField
        ? str({ $where: `this.${field}.includes(this.${value})` })
        : str({ [field]: { $regex: value } });

    case 'beginsWith':
      return valueIsField
        ? str({ $where: `this.${field}.startsWith(this.${value})` })
        : str({ [field]: { $regex: `^${value}` } });

    case 'endsWith':
      return valueIsField
        ? str({ $where: `this.${field}.endsWith(this.${value})` })
        : str({ [field]: { $regex: `${value}$` } });

    case 'doesNotContain':
      return valueIsField
        ? str({ $where: `!this.${field}.includes(this.${value})` })
        : str({ [field]: { $not: { $regex: value } } });

    case 'doesNotBeginWith':
      return valueIsField
        ? str({ $where: `!this.${field}.startsWith(this.${value})` })
        : str({ [field]: { $not: { $regex: `^${value}` } } });

    case 'doesNotEndWith':
      return valueIsField
        ? str({ $where: `!this.${field}.endsWith(this.${value})` })
        : str({ [field]: { $not: { $regex: `${value}$` } } });

    case 'null':
      return str({ [field]: null });

    case 'notNull':
      return str({ [field]: { $ne: null } });

    case 'in':
    case 'notIn': {
      const valueAsArray = toArray(value);
      return valueIsField
        ? str({
            $where: `${operator === 'notIn' ? '!' : ''}[${valueAsArray
              .map(val => `this.${val}`)
              .join(',')}].includes(this.${field})`,
          })
        : str({
            [field]: {
              [mongoOperators[operator]]: valueAsArray.map(val =>
                shouldRenderAsNumber(val, parseNumbers)
                  ? parseNumber(val, { parseNumbers: 'strict' })
                  : val
              ),
            },
          });
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
        const firstValue = valueIsField ? first : !isNaN(firstNum) ? firstNum : first;
        const secondValue = valueIsField ? second : !isNaN(secondNum) ? secondNum : second;
        if (operator === 'between') {
          return valueIsField
            ? str({
                $and: [
                  { $expr: { $gte: [`$${field}`, `$${firstValue}`] } },
                  { $expr: { $lte: [`$${field}`, `$${secondValue}`] } },
                ],
              })
            : str({ [field]: { $gte: firstValue, $lte: secondValue } });
        } else {
          return valueIsField
            ? str({
                $or: [
                  { $expr: { $lt: [`$${field}`, `$${firstValue}`] } },
                  { $expr: { $gt: [`$${field}`, `$${secondValue}`] } },
                ],
              })
            : str({ $or: [{ [field]: { $lt: firstValue } }, { [field]: { $gt: secondValue } }] });
        }
      } else {
        return '';
      }
    }
  }
  return '';
};
