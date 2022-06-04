import type { ValueProcessorByRule } from '../../types/index.noReact';
import { isValidValue, shouldRenderAsNumber, toArray, trimIfString } from './utils';

export const internalValueProcessor: ValueProcessorByRule = (
  { operator, value, valueSource },
  { parseNumbers } = {}
) => {
  const valueIsField = valueSource === 'field';
  const operatorLowerCase = operator.toLowerCase();
  if (operatorLowerCase === 'null' || operatorLowerCase === 'notnull') {
    return '';
  } else if (operatorLowerCase === 'in' || operatorLowerCase === 'notin') {
    const valArray = toArray(value);
    if (valArray.length > 0) {
      return `(${valArray
        .map(v =>
          valueIsField || shouldRenderAsNumber(v, parseNumbers) ? `${trimIfString(v)}` : `'${v}'`
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
        : `'${first}' and '${second}'`;
    }
    return '';
  } else if (operatorLowerCase === 'contains' || operatorLowerCase === 'doesnotcontain') {
    return valueIsField ? `'%' || ${value} || '%'` : `'%${value}%'`;
  } else if (operatorLowerCase === 'beginswith' || operatorLowerCase === 'doesnotbeginwith') {
    return valueIsField ? `${value} || '%'` : `'${value}%'`;
  } else if (operatorLowerCase === 'endswith' || operatorLowerCase === 'doesnotendwith') {
    return valueIsField ? `'%' || ${value}` : `'%${value}'`;
  } else if (typeof value === 'boolean') {
    return `${value}`.toUpperCase();
  }
  return valueIsField || shouldRenderAsNumber(value, parseNumbers)
    ? `${trimIfString(value)}`
    : `'${value}'`;
};
