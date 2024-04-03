import type { ValueProcessorByRule } from '../../types/index.noReact';
import { toArray, trimIfString } from '../arrayUtils';
import { isValidValue, quoteFieldNamesWithArray, shouldRenderAsNumber } from './utils';

const escapeStringValueQuotes = (
  v: string | number | boolean | object | null,
  quoteChar: string,
  escapeQuotes?: boolean
) =>
  escapeQuotes && typeof v === 'string'
    ? v.replaceAll(`${quoteChar}`, `${quoteChar}${quoteChar}`)
    : v;

/**
 * Default value processor used by {@link formatQuery} for "sql" format.
 */
export const defaultValueProcessorByRule: ValueProcessorByRule = (
  { operator, value, valueSource },
  // istanbul ignore next
  { escapeQuotes, parseNumbers, quoteFieldNamesWith, quoteValuesWith } = {}
) => {
  const valueIsField = valueSource === 'field';
  const [qfnwPre, qfnwPost] = quoteFieldNamesWithArray(quoteFieldNamesWith);
  const operatorLowerCase = operator.toLowerCase();
  const quoteChar = quoteValuesWith || "'";

  const escapeValue = (v: string | number | boolean | object | null) =>
    escapeStringValueQuotes(v, quoteChar, escapeQuotes);
  const wrapAndEscape = (v: string | number | boolean | object | null) =>
    `${quoteChar}${escapeValue(v)}${quoteChar}`;
  const wrapFieldName = (f: string) => `${qfnwPre}${f}${qfnwPost}`;

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
              ? wrapFieldName(v)
              : shouldRenderAsNumber(v, parseNumbers)
                ? `${trimIfString(v)}`
                : `${wrapAndEscape(v)}`
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
          ? `${wrapFieldName(first)} and ${wrapFieldName(second)}`
          : shouldRenderAsNumber(first, parseNumbers) && shouldRenderAsNumber(second, parseNumbers)
            ? `${trimIfString(first)} and ${trimIfString(second)}`
            : `${wrapAndEscape(first)} and ${wrapAndEscape(second)}`;
      }
      return '';
    }

    case 'contains':
    case 'doesnotcontain':
      return valueIsField
        ? `${quoteChar}%${quoteChar} || ${wrapFieldName(value)} || ${quoteChar}%${quoteChar}`
        : `${quoteChar}%${escapeValue(value)}%${quoteChar}`;

    case 'beginswith':
    case 'doesnotbeginwith':
      return valueIsField
        ? `${wrapFieldName(value)} || ${quoteChar}%${quoteChar}`
        : `${quoteChar}${escapeValue(value)}%${quoteChar}`;

    case 'endswith':
    case 'doesnotendwith':
      return valueIsField
        ? `${quoteChar}%${quoteChar} || ${wrapFieldName(value)}`
        : `${quoteChar}%${escapeValue(value)}${quoteChar}`;
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }

  return valueIsField
    ? wrapFieldName(value)
    : shouldRenderAsNumber(value, parseNumbers)
      ? `${trimIfString(value)}`
      : `${wrapAndEscape(value)}`;
};
