import type { RuleProcessor } from '@react-querybuilder/ts/dist/index.noReact';
import { toArray, trimIfString } from '../arrayUtils';
import { shouldRenderAsNumber } from './utils';

const shouldNegate = (op: string) => /^(does)?not/i.test(op);

export const defaultRuleProcessorCEL: RuleProcessor = (
  { field, operator, value, valueSource },
  // istanbul ignore next
  { escapeQuotes, parseNumbers } = {}
) => {
  const escapeDoubleQuotes = (v: any) =>
    typeof v !== 'string' || !escapeQuotes ? v : v.replaceAll(`"`, `\\"`);
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
      valueIsField || useBareValue ? trimIfString(value) : `"${escapeDoubleQuotes(value)}"`
    }`;
  } else if (operatorTL === 'contains' || operatorTL === 'doesNotContain') {
    const negate = shouldNegate(operatorTL) ? '!' : '';
    return `${negate}${field}.contains(${
      valueIsField ? trimIfString(value) : `"${escapeDoubleQuotes(value)}"`
    })`;
  } else if (operatorTL === 'beginsWith' || operatorTL === 'doesNotBeginWith') {
    const negate = shouldNegate(operatorTL) ? '!' : '';
    return `${negate}${field}.startsWith(${
      valueIsField ? trimIfString(value) : `"${escapeDoubleQuotes(value)}"`
    })`;
  } else if (operatorTL === 'endsWith' || operatorTL === 'doesNotEndWith') {
    const negate = shouldNegate(operatorTL) ? '!' : '';
    return `${negate}${field}.endsWith(${
      valueIsField ? trimIfString(value) : `"${escapeDoubleQuotes(value)}"`
    })`;
  } else if (operatorTL === 'null') {
    return `${field} == null`;
  } else if (operatorTL === 'notNull') {
    return `${field} != null`;
  } else if (operatorTL === 'in' || operatorTL === 'notIn') {
    const negate = shouldNegate(operatorTL);
    const valueAsArray = toArray(value);
    if (valueAsArray.length > 0) {
      return `${negate ? '!(' : ''}${field} in [${valueAsArray
        .map(val =>
          valueIsField || shouldRenderAsNumber(val, parseNumbers)
            ? `${trimIfString(val)}`
            : `"${escapeDoubleQuotes(val)}"`
        )
        .join(', ')}]${negate ? ')' : ''}`;
    } else {
      return '';
    }
  } else if (operatorTL === 'between' || operatorTL === 'notBetween') {
    const valueAsArray = toArray(value);
    if (valueAsArray.length >= 2 && !!valueAsArray[0] && !!valueAsArray[1]) {
      const [first, second] = valueAsArray;
      const firstNum = shouldRenderAsNumber(first, true) ? parseFloat(first) : NaN;
      const secondNum = shouldRenderAsNumber(second, true) ? parseFloat(second) : NaN;
      let firstValue = isNaN(firstNum)
        ? valueIsField
          ? `${first}`
          : `"${escapeDoubleQuotes(first)}"`
        : firstNum;
      let secondValue = isNaN(secondNum)
        ? valueIsField
          ? `${second}`
          : `"${escapeDoubleQuotes(second)}"`
        : secondNum;
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
