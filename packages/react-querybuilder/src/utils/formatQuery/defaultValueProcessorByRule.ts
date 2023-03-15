import type { ValueProcessorByRule } from '@react-querybuilder/ts/dist/index.noReact';
import { toArray, trimIfString } from '../arrayUtils';
import { isValidValue, quoteFieldNamesWithArray, shouldRenderAsNumber } from './utils';

const escapeSingleQuotes = (v: any, escapeQuotes?: boolean) =>
  typeof v !== 'string' || !escapeQuotes ? v : v.replaceAll(`'`, `''`);

export const defaultValueProcessorByRule: ValueProcessorByRule = (
  { operator, value, valueSource },
  // istanbul ignore next
  { escapeQuotes, parseNumbers, quoteFieldNamesWith } = {}
) => {
  const valueIsField = valueSource === 'field';
  const [qfnwPre, qfnwPost] = quoteFieldNamesWithArray(quoteFieldNamesWith);
  const operatorLowerCase = operator.toLowerCase();

  switch (operatorLowerCase) {
    case 'null':
    case 'notnull': {
      return '';
    }

    case 'in':
    case 'notin': {
      const valueAsArray = toArray(value);
      if (valueAsArray.length > 0) {
        return `(${valueAsArray
          .map(v =>
            valueIsField
              ? `${qfnwPre}${v}${qfnwPost}`
              : shouldRenderAsNumber(v, parseNumbers)
              ? `${trimIfString(v)}`
              : `'${escapeSingleQuotes(v, escapeQuotes)}'`
          )
          .join(', ')})`;
      }
      return '';
    }

    case 'between':
    case 'notbetween': {
      const valueAsArray = toArray(value);
      if (
        valueAsArray.length >= 2 &&
        isValidValue(valueAsArray[0]) &&
        isValidValue(valueAsArray[1])
      ) {
        const [first, second] = valueAsArray;
        return valueIsField
          ? `${qfnwPre}${first}${qfnwPost} and ${qfnwPre}${second}${qfnwPost}`
          : shouldRenderAsNumber(first, parseNumbers) && shouldRenderAsNumber(second, parseNumbers)
          ? `${trimIfString(first)} and ${trimIfString(second)}`
          : `'${escapeSingleQuotes(first, escapeQuotes)}' and '${escapeSingleQuotes(
              second,
              escapeQuotes
            )}'`;
      }
      return '';
    }

    case 'contains':
    case 'doesnotcontain':
      return valueIsField
        ? `'%' || ${qfnwPre}${value}${qfnwPost} || '%'`
        : `'%${escapeSingleQuotes(value, escapeQuotes)}%'`;

    case 'beginswith':
    case 'doesnotbeginwith':
      return valueIsField
        ? `${qfnwPre}${value}${qfnwPost} || '%'`
        : `'${escapeSingleQuotes(value, escapeQuotes)}%'`;

    case 'endswith':
    case 'doesnotendwith':
      return valueIsField
        ? `'%' || ${qfnwPre}${value}${qfnwPost}`
        : `'%${escapeSingleQuotes(value, escapeQuotes)}'`;
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }

  return valueIsField
    ? `${qfnwPre}${value}${qfnwPost}`
    : shouldRenderAsNumber(value, parseNumbers)
    ? `${trimIfString(value)}`
    : `'${escapeSingleQuotes(value, escapeQuotes)}'`;
};
