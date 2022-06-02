import type { ValueProcessorInternal } from '../../types';
import { shouldRenderAsNumber, toArray, trimIfString } from './utils';

export const internalValueProcessorCEL: ValueProcessorInternal = (
  { field, operator, value, valueSource },
  { parseNumbers }
) => {
  const valueIsField = valueSource === 'field';
  const operatorLowerCase = operator.toLowerCase().replace(/^=$/, '==');
  const useBareValue =
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    shouldRenderAsNumber(value, parseNumbers);
  if (
    operatorLowerCase === '<' ||
    operatorLowerCase === '<=' ||
    operatorLowerCase === '==' ||
    operatorLowerCase === '!=' ||
    operatorLowerCase === '>' ||
    operatorLowerCase === '>='
  ) {
    return `${field} ${operatorLowerCase} ${
      valueIsField || useBareValue ? trimIfString(value) : `"${value}"`
    }`;
  } else if (operatorLowerCase === 'contains' || operatorLowerCase === 'doesnotcontain') {
    const negate = operatorLowerCase === 'doesnotcontain' ? '!' : '';
    return `${negate}${field}.contains(${
      valueIsField || useBareValue ? trimIfString(value) : `"${value}"`
    })`;
  } else if (operatorLowerCase === 'beginswith' || operatorLowerCase === 'doesnotbeginwith') {
    const negate = operatorLowerCase === 'doesnotbeginwith' ? '!' : '';
    return `${negate}${field}.startsWith(${
      valueIsField || useBareValue ? trimIfString(value) : `"${value}"`
    })`;
  } else if (operatorLowerCase === 'endswith' || operatorLowerCase === 'doesnotendwith') {
    const negate = operatorLowerCase === 'doesnotendwith' ? '!' : '';
    return `${negate}${field}.endsWith(${
      valueIsField || useBareValue ? trimIfString(value) : `"${value}"`
    })`;
  } else if (operatorLowerCase === 'null') {
    return `${field} == null`;
  } else if (operatorLowerCase === 'notnull') {
    return `${field} != null`;
  } else if (operatorLowerCase === 'in' || operatorLowerCase === 'notin') {
    const negate = operatorLowerCase === 'notin';
    const valArray = toArray(value);
    if (valArray.length > 0) {
      return `${negate ? '!(' : ''}${field} in [${valArray
        .map(val =>
          valueIsField || shouldRenderAsNumber(val, parseNumbers)
            ? `${trimIfString(val)}`
            : `"${val}"`
        )
        .join(', ')}]${negate ? ')' : ''}`;
    } else {
      return '';
    }
  } else if (operatorLowerCase === 'between' || operatorLowerCase === 'notbetween') {
    const valArray = toArray(value);
    if (valArray.length >= 2 && !!valArray[0] && !!valArray[1]) {
      const [first, second] = valArray;
      const firstNum = shouldRenderAsNumber(first, true) ? parseFloat(first) : NaN;
      const secondNum = shouldRenderAsNumber(second, true) ? parseFloat(second) : NaN;
      let firstValue = isNaN(firstNum) ? (valueIsField ? `${first}` : `"${first}"`) : firstNum;
      let secondValue = isNaN(secondNum) ? (valueIsField ? `${second}` : `"${second}"`) : secondNum;
      if (firstValue === firstNum && secondValue === secondNum && secondNum < firstNum) {
        const tempNum = secondNum;
        secondValue = firstNum;
        firstValue = tempNum;
      }
      if (operator === 'between') {
        return `(${field} >= ${firstValue} && ${field} <= ${secondValue})`;
      } else {
        return `(${field} < ${firstValue} || ${field} > ${secondValue})`;
      }
    } else {
      return '';
    }
  }
  return '';
};
