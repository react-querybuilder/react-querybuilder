import type { RuleProcessor } from '../../types/index.noReact';
import { toArray, trimIfString } from '../arrayUtils';
import { parseNumber } from '../parseNumber';
import { isValidValue, mongoOperators, shouldRenderAsNumber } from './utils';

/**
 * Default rule processor used by {@link formatQuery} for "mongodb" format.
 */
export const defaultRuleProcessorMongoDB: RuleProcessor = (
  { field, operator, value, valueSource },
  // istanbul ignore next
  { parseNumbers } = {}
) => {
  const valueIsField = valueSource === 'field';
  const useBareValue =
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    shouldRenderAsNumber(value, parseNumbers);

  if (operator === '=' && !valueIsField) {
    return `{"${field}":${useBareValue ? trimIfString(value) : JSON.stringify(value)}}`;
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
        ? `{"$expr":{"${mongoOperator}":["$${field}","$${value}"]}}`
        : `{"${field}":{"${mongoOperator}":${
            useBareValue ? trimIfString(value) : JSON.stringify(value)
          }}}`;
    }

    case 'contains':
      return valueIsField
        ? `{"$where":"this.${field}.includes(this.${value})"}`
        : `{"${field}":{"$regex":${JSON.stringify(value)}}}`;

    case 'beginsWith':
      return valueIsField
        ? `{"$where":"this.${field}.startsWith(this.${value})"}`
        : `{"${field}":{"$regex":${JSON.stringify(`^${value}`)}}}`;

    case 'endsWith':
      return valueIsField
        ? `{"$where":"this.${field}.endsWith(this.${value})"}`
        : `{"${field}":{"$regex":${JSON.stringify(`${value}$`)}}}`;

    case 'doesNotContain':
      return valueIsField
        ? `{"$where":"!this.${field}.includes(this.${value})"}`
        : `{"${field}":{"$not":{"$regex":${JSON.stringify(value)}}}}`;

    case 'doesNotBeginWith':
      return valueIsField
        ? `{"$where":"!this.${field}.startsWith(this.${value})"}`
        : `{"${field}":{"$not":{"$regex":${JSON.stringify(`^${value}`)}}}}`;

    case 'doesNotEndWith':
      return valueIsField
        ? `{"$where":"!this.${field}.endsWith(this.${value})"}`
        : `{"${field}":{"$not":{"$regex":${JSON.stringify(`${value}$`)}}}}`;

    case 'null':
      return `{"${field}":null}`;

    case 'notNull':
      return `{"${field}":{"$ne":null}}`;

    case 'in':
    case 'notIn': {
      const valueAsArray = toArray(value);
      return valueIsField
        ? `{"$where":"${operator === 'notIn' ? '!' : ''}[${valueAsArray
            .map(val => `this.${val}`)
            .join(',')}].includes(this.${field})"}`
        : `{"${field}":{"${mongoOperators[operator]}":[${valueAsArray
            .map(val =>
              shouldRenderAsNumber(val, parseNumbers) ? `${trimIfString(val)}` : JSON.stringify(val)
            )
            .join(',')}]}}`;
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
          ? parseNumber(first, { parseNumbers: true })
          : NaN;
        const secondNum = shouldRenderAsNumber(second, true)
          ? parseNumber(second, { parseNumbers: true })
          : NaN;
        const firstValue =
          valueIsField || !isNaN(firstNum) ? `${first}` : `${JSON.stringify(first)}`;
        const secondValue =
          valueIsField || !isNaN(secondNum) ? `${second}` : `${JSON.stringify(second)}`;
        if (operator === 'between') {
          return valueIsField
            ? `{"$and":[{"$expr":{"$gte":["$${field}","$${firstValue}"]}},{"$expr":{"$lte":["$${field}","$${secondValue}"]}}]}`
            : `{"${field}":{"$gte":${firstValue},"$lte":${secondValue}}}`;
        } else {
          return valueIsField
            ? `{"$or":[{"$expr":{"$lt":["$${field}","$${firstValue}"]}},{"$expr":{"$gt":["$${field}","$${secondValue}"]}}]}`
            : `{"$or":[{"${field}":{"$lt":${firstValue}}},{"${field}":{"$gt":${secondValue}}}]}`;
        }
      } else {
        return '';
      }
    }
  }
  return '';
};
