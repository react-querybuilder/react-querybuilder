import { toArray, trimIfString } from '../../internal/toArray';
import type { ValueProcessorByRule } from '../../types/index.noReact';
import { isValidValue, shouldRenderAsNumber } from './utils';

export const defaultValueProcessorByRule: ValueProcessorByRule = (
  { operator, value, valueSource },
  // istanbul ignore next
  { escapeQuotes, parseNumbers } = {}
) => {
  const escapeSingleQuotes = (v: any) =>
    typeof v !== 'string' || !escapeQuotes ? v : v.replaceAll(`'`, `''`);
  const valueIsField = valueSource === 'field';
  const operatorLowerCase = operator.toLowerCase();
  if (operatorLowerCase === 'null' || operatorLowerCase === 'notnull') {
    return '';
  } else if (operatorLowerCase === 'in' || operatorLowerCase === 'notin') {
    const valArray = toArray(value);
    if (valArray.length > 0) {
      return `(${valArray
        .map(v =>
          valueIsField || shouldRenderAsNumber(v, parseNumbers)
            ? `${trimIfString(v)}`
            : `'${escapeSingleQuotes(v)}'`
        )
        .join(', ')})`;
    }
    return '';
  } else if (operatorLowerCase === 'between' || operatorLowerCase === 'notbetween') {
    const valArray = toArray(value);
    if (valArray.length >= 2 && isValidValue(valArray[0]) && isValidValue(valArray[1])) {
      const [first, second] = valArray;
      return valueIsField ||
        (shouldRenderAsNumber(first, parseNumbers) && shouldRenderAsNumber(second, parseNumbers))
        ? `${trimIfString(first)} and ${trimIfString(second)}`
        : `'${escapeSingleQuotes(first)}' and '${escapeSingleQuotes(second)}'`;
    }
    return '';
  } else if (operatorLowerCase === 'contains' || operatorLowerCase === 'doesnotcontain') {
    return valueIsField ? `'%' || ${value} || '%'` : `'%${escapeSingleQuotes(value)}%'`;
  } else if (operatorLowerCase === 'beginswith' || operatorLowerCase === 'doesnotbeginwith') {
    return valueIsField ? `${value} || '%'` : `'${escapeSingleQuotes(value)}%'`;
  } else if (operatorLowerCase === 'endswith' || operatorLowerCase === 'doesnotendwith') {
    return valueIsField ? `'%' || ${value}` : `'%${escapeSingleQuotes(value)}'`;
  } else if (typeof value === 'boolean') {
    return `${value}`.toUpperCase();
  }
  return valueIsField || shouldRenderAsNumber(value, parseNumbers)
    ? `${trimIfString(value)}`
    : `'${escapeSingleQuotes(value)}'`;
};
