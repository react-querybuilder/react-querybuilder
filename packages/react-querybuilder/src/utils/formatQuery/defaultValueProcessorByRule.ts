import type { ValueProcessorByRule } from '../../types/index.noReact';
import { toArray, trimIfString } from '../arrayUtils';
import { lc } from '../misc';
import { parseNumber } from '../parseNumber';
import { getQuotedFieldName, isValidValue, shouldRenderAsNumber } from './utils';

const escapeStringValueQuotes = (v: unknown, quoteChar: string, escapeQuotes?: boolean) =>
  escapeQuotes && typeof v === 'string'
    ? v.replaceAll(`${quoteChar}`, `${quoteChar}${quoteChar}`)
    : v;

/**
 * Default value processor used by {@link formatQuery} for "sql" format.
 *
 * @group Export
 */
export const defaultValueProcessorByRule: ValueProcessorByRule = (
  { operator, value, valueSource },
  // istanbul ignore next - defaultRuleProcessorSQL always provides options
  {
    escapeQuotes,
    parseNumbers,
    preserveValueOrder,
    quoteFieldNamesWith,
    quoteValuesWith,
    concatOperator = '||',
    fieldIdentifierSeparator,
    wrapValueWith = ['', ''],
    translations,
  } = {}
) => {
  const valueIsField = valueSource === 'field';
  const operatorLowerCase = lc(operator);
  const quoteChar = quoteValuesWith || "'";

  const quoteValue = (v: unknown) =>
    `${wrapValueWith[0]}${quoteChar}${v}${quoteChar}${wrapValueWith[1]}`;
  const escapeValue = (v: unknown) => escapeStringValueQuotes(v, quoteChar, escapeQuotes);
  const wrapAndEscape = (v: unknown) => quoteValue(escapeValue(v));
  const wrapFieldName = (v: string) =>
    getQuotedFieldName(v, { quoteFieldNamesWith, fieldIdentifierSeparator });
  const concat = (...values: string[]) =>
    concatOperator.toUpperCase() === 'CONCAT'
      ? `CONCAT(${values.join(', ')})`
      : values.join(` ${concatOperator} `);

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
      const valueAsArray = toArray(value, { retainEmptyStrings: true });
      if (
        valueAsArray.length < 2 ||
        !isValidValue(valueAsArray[0]) ||
        !isValidValue(valueAsArray[1])
      ) {
        return '';
      }

      const [first, second] = valueAsArray;

      const firstNum = shouldRenderAsNumber(first, parseNumbers)
        ? parseNumber(first, { parseNumbers: 'strict' })
        : NaN;
      const secondNum = shouldRenderAsNumber(second, parseNumbers)
        ? parseNumber(second, { parseNumbers: 'strict' })
        : NaN;
      const firstValue = isNaN(firstNum) ? (valueIsField ? `${first}` : first) : firstNum;
      const secondValue = isNaN(secondNum) ? (valueIsField ? `${second}` : second) : secondNum;

      const valsOneAndTwoOnly = [firstValue, secondValue];
      if (
        !preserveValueOrder &&
        firstValue === firstNum &&
        secondValue === secondNum &&
        secondNum < firstNum
      ) {
        valsOneAndTwoOnly[0] = secondNum;
        valsOneAndTwoOnly[1] = firstNum;
      }

      return (
        (
          valueIsField
            ? valsOneAndTwoOnly.map(v => wrapFieldName(v))
            : valsOneAndTwoOnly.every(v => shouldRenderAsNumber(v, parseNumbers))
              ? valsOneAndTwoOnly.map(v => parseNumber(v, { parseNumbers: 'strict' }))
              : valsOneAndTwoOnly.map(v => wrapAndEscape(v))
        )
          // Note: `translations` should not be used for SQL.
          // This is only here to support the "natural_language" format.
          .join(` ${translations?.and ?? 'and'} `)
      );
    }

    case 'contains':
    case 'doesnotcontain':
      return valueIsField
        ? concat(quoteValue('%'), wrapFieldName(value), quoteValue('%'))
        : quoteValue(`%${escapeValue(value)}%`);

    case 'beginswith':
    case 'doesnotbeginwith':
      return valueIsField
        ? concat(wrapFieldName(value), quoteValue('%'))
        : quoteValue(`${escapeValue(value)}%`);

    case 'endswith':
    case 'doesnotendwith':
      return valueIsField
        ? concat(quoteValue('%'), wrapFieldName(value))
        : quoteValue(`%${escapeValue(value)}`);
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
