import type { RuleProcessor } from '@react-querybuilder/ts/dist/index.noReact';
import { toArray, trimIfString } from '../arrayUtils';
import { isValidValue, mongoOperators, shouldRenderAsNumber } from './utils';

export const defaultRuleProcessorMongoDB: RuleProcessor = (
  { field, operator, value, valueSource },
  // istanbul ignore next
  { parseNumbers } = {}
) => {
  const escapeDoubleQuotes = (v: any) =>
    typeof v !== 'string' ? v : v.replaceAll('\\', '\\\\').replaceAll(`"`, `\\"`);
  const valueIsField = valueSource === 'field';
  const useBareValue =
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    shouldRenderAsNumber(value, parseNumbers);
  if (operator === '=' && !valueIsField) {
    return `{"${field}":${useBareValue ? trimIfString(value) : `"${escapeDoubleQuotes(value)}"`}}`;
  } else if (
    operator === '<' ||
    operator === '<=' ||
    operator === '=' ||
    operator === '!=' ||
    operator === '>' ||
    operator === '>='
  ) {
    const mongoOperator = mongoOperators[operator];
    return valueIsField
      ? `{"$expr":{"${mongoOperator}":["$${field}","$${value}"]}}`
      : `{"${field}":{"${mongoOperator}":${
          useBareValue ? trimIfString(value) : `"${escapeDoubleQuotes(value)}"`
        }}}`;
  } else if (operator === 'contains') {
    return valueIsField
      ? `{"$where":"this.${field}.includes(this.${value})"}`
      : `{"${field}":{"$regex":"${escapeDoubleQuotes(value)}"}}`;
  } else if (operator === 'beginsWith') {
    return valueIsField
      ? `{"$where":"this.${field}.startsWith(this.${value})"}`
      : `{"${field}":{"$regex":"^${escapeDoubleQuotes(value)}"}}`;
  } else if (operator === 'endsWith') {
    return valueIsField
      ? `{"$where":"this.${field}.endsWith(this.${value})"}`
      : `{"${field}":{"$regex":"${escapeDoubleQuotes(value)}$"}}`;
  } else if (operator === 'doesNotContain') {
    return valueIsField
      ? `{"$where":"!this.${field}.includes(this.${value})"}`
      : `{"${field}":{"$not":{"$regex":"${escapeDoubleQuotes(value)}"}}}`;
  } else if (operator === 'doesNotBeginWith') {
    return valueIsField
      ? `{"$where":"!this.${field}.startsWith(this.${value})"}`
      : `{"${field}":{"$not":{"$regex":"^${escapeDoubleQuotes(value)}"}}}`;
  } else if (operator === 'doesNotEndWith') {
    return valueIsField
      ? `{"$where":"!this.${field}.endsWith(this.${value})"}`
      : `{"${field}":{"$not":{"$regex":"${escapeDoubleQuotes(value)}$"}}}`;
  } else if (operator === 'null') {
    return `{"${field}":null}`;
  } else if (operator === 'notNull') {
    return `{"${field}":{"$ne":null}}`;
  } else if (operator === 'in' || operator === 'notIn') {
    const valueAsArray = toArray(value);
    if (valueAsArray.length > 0) {
      return valueIsField
        ? `{"$where":"${operator === 'notIn' ? '!' : ''}[${valueAsArray
            .map(val => `this.${val}`)
            .join(',')}].includes(this.${field})"}`
        : `{"${field}":{"${mongoOperators[operator]}":[${valueAsArray
            .map(val =>
              shouldRenderAsNumber(val, parseNumbers)
                ? `${trimIfString(val)}`
                : `"${escapeDoubleQuotes(val)}"`
            )
            .join(',')}]}}`;
    } else {
      return '';
    }
  } else if (operator === 'between' || operator === 'notBetween') {
    const valueAsArray = toArray(value);
    if (
      valueAsArray.length >= 2 &&
      isValidValue(valueAsArray[0]) &&
      isValidValue(valueAsArray[1])
    ) {
      const [first, second] = valueAsArray;
      const firstNum = shouldRenderAsNumber(first, true) ? parseFloat(first) : NaN;
      const secondNum = shouldRenderAsNumber(second, true) ? parseFloat(second) : NaN;
      const firstValue =
        valueIsField || !isNaN(firstNum) ? `${first}` : `"${escapeDoubleQuotes(first)}"`;
      const secondValue =
        valueIsField || !isNaN(secondNum) ? `${second}` : `"${escapeDoubleQuotes(second)}"`;
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
  return '';
};
