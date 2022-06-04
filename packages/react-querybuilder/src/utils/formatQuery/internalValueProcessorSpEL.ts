import type { ValueProcessorByRule } from '../../types/index.noReact';
import { shouldRenderAsNumber, toArray, trimIfString } from './utils';

const shouldNegate = (op: string) => /^(does)?not/i.test(op);

const wrapInNegation = (clause: string, negate: boolean) =>
  `${negate ? '!(' : ''}${clause}${negate ? ')' : ''}`;

export const internalValueProcessorSpEL: ValueProcessorByRule = (
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
      valueIsField || useBareValue ? trimIfString(value) : `'${value}'`
    }`;
  } else if (operatorTL === 'contains' || operatorTL === 'doesNotContain') {
    return wrapInNegation(
      `${field} matches ${valueIsField || useBareValue ? trimIfString(value) : `'${value}'`}`,
      shouldNegate(operatorTL)
    );
  } else if (operatorTL === 'beginsWith' || operatorTL === 'doesNotBeginWith') {
    const valueTL = valueIsField
      ? `'^'.concat(${trimIfString(value)})`
      : `'${
          (typeof value === 'string' && !value.startsWith('^')) || useBareValue ? '^' : ''
        }${value}'`;
    return wrapInNegation(`${field} matches ${valueTL}`, shouldNegate(operatorTL));
  } else if (operatorTL === 'endsWith' || operatorTL === 'doesNotEndWith') {
    const valueTL = valueIsField
      ? `${trimIfString(value)}.concat('$')`
      : `'${value}${
          (typeof value === 'string' && !value.endsWith('$')) || useBareValue ? '$' : ''
        }'`;
    return wrapInNegation(`${field} matches ${valueTL}`, shouldNegate(operatorTL));
  } else if (operatorTL === 'null') {
    return `${field} == null`;
  } else if (operatorTL === 'notNull') {
    return `${field} != null`;
  } else if (operatorTL === 'in' || operatorTL === 'notIn') {
    const negate = shouldNegate(operatorTL) ? '!' : '';
    const valArray = toArray(value);
    if (valArray.length > 0) {
      return `${negate}(${valArray
        .map(
          val =>
            `${field} == ${
              valueIsField || shouldRenderAsNumber(val, parseNumbers)
                ? `${trimIfString(val)}`
                : `'${val}'`
            }`
        )
        .join(' or ')})`;
    } else {
      return '';
    }
  } else if (operatorTL === 'between' || operatorTL === 'notBetween') {
    const valArray = toArray(value);
    if (valArray.length >= 2 && !!valArray[0] && !!valArray[1]) {
      const [first, second] = valArray;
      const firstNum = shouldRenderAsNumber(first, true) ? parseFloat(first) : NaN;
      const secondNum = shouldRenderAsNumber(second, true) ? parseFloat(second) : NaN;
      let firstValue = isNaN(firstNum) ? (valueIsField ? `${first}` : `'${first}'`) : firstNum;
      let secondValue = isNaN(secondNum) ? (valueIsField ? `${second}` : `'${second}'`) : secondNum;
      if (firstValue === firstNum && secondValue === secondNum && secondNum < firstNum) {
        const tempNum = secondNum;
        secondValue = firstNum;
        firstValue = tempNum;
      }
      if (operator === 'between') {
        return `(${field} >= ${firstValue} and ${field} <= ${secondValue})`;
      } else {
        return `(${field} < ${firstValue} or ${field} > ${secondValue})`;
      }
    } else {
      return '';
    }
  }
  return '';
};
