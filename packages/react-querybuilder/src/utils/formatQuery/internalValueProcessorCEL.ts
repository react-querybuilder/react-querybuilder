import type { ValueProcessorByRule } from '../../types/index.noReact';
import { shouldRenderAsNumber, toArray, trimIfString } from './utils';

const shouldNegate = (op: string) => /^(does)?not/i.test(op);

export const internalValueProcessorCEL: ValueProcessorByRule = (
  { field, operator, value, valueSource },
  // istanbul ignore next
  { parseNumbers } = {}
) => {
  const valueIsField = valueSource === 'field';
  const operatorTL = operator.replace(/^=$/, '==');
  const useBareValue =
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    shouldRenderAsNumber(value, parseNumbers);
  if (
    operatorTL === '<' ||
    operatorTL === '<=' ||
    operatorTL === '==' ||
    operatorTL === '!=' ||
    operatorTL === '>' ||
    operatorTL === '>='
  ) {
    return `${field} ${operatorTL} ${
      valueIsField || useBareValue ? trimIfString(value) : `"${value}"`
    }`;
  } else if (operatorTL === 'contains' || operatorTL === 'doesNotContain') {
    const negate = shouldNegate(operatorTL) ? '!' : '';
    return `${negate}${field}.contains(${valueIsField ? trimIfString(value) : `"${value}"`})`;
  } else if (operatorTL === 'beginsWith' || operatorTL === 'doesNotBeginWith') {
    const negate = shouldNegate(operatorTL) ? '!' : '';
    return `${negate}${field}.startsWith(${valueIsField ? trimIfString(value) : `"${value}"`})`;
  } else if (operatorTL === 'endsWith' || operatorTL === 'doesNotEndWith') {
    const negate = shouldNegate(operatorTL) ? '!' : '';
    return `${negate}${field}.endsWith(${valueIsField ? trimIfString(value) : `"${value}"`})`;
  } else if (operatorTL === 'null') {
    return `${field} == null`;
  } else if (operatorTL === 'notNull') {
    return `${field} != null`;
  } else if (operatorTL === 'in' || operatorTL === 'notIn') {
    const negate = shouldNegate(operatorTL);
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
  } else if (operatorTL === 'between' || operatorTL === 'notBetween') {
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
