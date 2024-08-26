import type { ValueProcessorByRule } from '../../types/index.noReact';
import { toArray, trimIfString } from '../arrayUtils';
import { parseNumber } from '../parseNumber';
import { isValidValue, quoteFieldName, shouldRenderAsNumber } from './utils';

const escapeStringValueQuotes = (v: unknown, quoteChar: string, escapeQuotes?: boolean) =>
  escapeQuotes && typeof v === 'string'
    ? v.replaceAll(`${quoteChar}`, `${quoteChar}${quoteChar}`)
    : v;

/**
 * Default value processor used by {@link formatQuery} for "sql" format.
 */
export const defaultValueProcessorByRule: ValueProcessorByRule = (
  { operator, value, valueSource },
  // istanbul ignore next - defaultRuleProcessorSQL always provides options anyway
  {
    escapeQuotes,
    parseNumbers,
    quoteFieldNamesWith,
    quoteValuesWith,
    concatOperator,
    fieldIdentifierSeparator,
  } = {}
) => {
  const valueIsField = valueSource === 'field';
  const operatorLowerCase = operator.toLowerCase();
  const quoteChar = quoteValuesWith || "'";
  const concatOp = concatOperator || '||';

  const quoteValue = (v: unknown) => `${quoteChar}${v}${quoteChar}`;
  const escapeValue = (v: unknown) => escapeStringValueQuotes(v, quoteChar, escapeQuotes);
  const wrapAndEscape = (v: unknown) => quoteValue(escapeValue(v));
  const wrapFieldName = (v: string) =>
    quoteFieldName(v, { quoteFieldNamesWith, fieldIdentifierSeparator });
  const concat = (...values: string[]) =>
    concatOp.toUpperCase() === 'CONCAT'
      ? `CONCAT(${values.join(', ')})`
      : values.join(` ${concatOp} `);

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
        valueAsArray.length >= 2 &&
        isValidValue(valueAsArray[0]) &&
        isValidValue(valueAsArray[1])
      ) {
        const [first, second] = valueAsArray;

        const firstNum = shouldRenderAsNumber(first, parseNumbers)
          ? parseNumber(first, { parseNumbers: 'enhanced' })
          : NaN;
        const secondNum = shouldRenderAsNumber(second, parseNumbers)
          ? parseNumber(second, { parseNumbers: 'enhanced' })
          : NaN;
        const firstValue = !isNaN(firstNum) ? firstNum : valueIsField ? `${first}` : first;
        const secondValue = !isNaN(secondNum) ? secondNum : valueIsField ? `${second}` : second;

        const valsOneAndTwoOnly = [firstValue, secondValue];
        if (firstValue === firstNum && secondValue === secondNum && secondNum < firstNum) {
          valsOneAndTwoOnly[0] = secondNum;
          valsOneAndTwoOnly[1] = firstNum;
        }

        return (
          valueIsField
            ? valsOneAndTwoOnly.map(wrapFieldName)
            : valsOneAndTwoOnly.every(v => shouldRenderAsNumber(v, parseNumbers))
              ? valsOneAndTwoOnly.map(v => parseNumber(v, { parseNumbers: 'enhanced' }))
              : valsOneAndTwoOnly.map(wrapAndEscape)
        ).join(` and `);
      }
      return '';
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
