import type { ExportOperatorMap, RuleProcessor, ValueProcessorByRule } from 'react-querybuilder';
import {
  defaultOperatorProcessorNL,
  defaultRuleProcessorNL,
  getQuotedFieldName,
  normalizeConstituentWordOrder,
  toArray,
} from 'react-querybuilder';
import type { RQBDateTimeLibraryAPI } from './types';
import { isISOStringDateOnly, processIsDateField } from './utils';

export const defaultDateTimeNLOperatorMap: ExportOperatorMap = {
  // '=': 'is',
  // '!=': 'is not',
  '<': 'is before',
  '>': 'is after',
  '<=': 'is on or before',
  '>=': 'is on or after',
  in: ['is one of the dates', 'is the same as a date in'],
  notin: ['is not one of the dates', 'is not the same as any date in'],
  between: ['is between', 'is between the dates in'],
  notbetween: ['is not between', 'is not between the dates in'],
};

/**
 * Generates a value processor with date/time features for use by
 * {@link react-querybuilder!index.formatQuery formatQuery} with the "natural_language" format.
 */
export const datetimeValueProcessorNL: ValueProcessorByRule = (rule, opts) => {
  if (isISOStringDateOnly(opts?.context?.originalValue)) {
    return new Intl.DateTimeFormat(opts?.context?.locales, {
      dateStyle: 'full',
      ...opts?.context?.dateFormat,
    }).format(rule.value);
  }
  return new Intl.DateTimeFormat(opts?.context?.locales, {
    dateStyle: 'full',
    timeStyle: 'long',
    ...opts?.context?.dateTimeFormat,
  }).format(rule.value);
};

/**
 * Generates a rule processor with date/time features for use by {@link react-querybuilder!index.formatQuery formatQuery} with
 * the "natural_language" format.
 */
export const getDatetimeRuleProcessorNL =
  (apiFns: RQBDateTimeLibraryAPI): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? /* istanbul ignore next */ {};
    const operatorLowerCase = rule.operator.toLowerCase();
    let finalValue = '';

    // istanbul ignore next
    const {
      fieldData,
      quoteFieldNamesWith = ['', ''] as [string, string],
      fieldIdentifierSeparator = '',
      operatorProcessor = defaultOperatorProcessorNL,
      // valueProcessor = datetimeValueProcessorNL,
      wordOrder = 'SVO',
      context = {},
      operatorMap = defaultDateTimeNLOperatorMap,
    } = opts;

    if (!processIsDateField(context.isDateField, rule, opts)) {
      return defaultRuleProcessorNL(rule, opts);
    }

    if (rule.valueSource === 'field') {
      return defaultRuleProcessorNL(rule, { ...opts, operatorMap: defaultDateTimeNLOperatorMap });
    }

    if (
      (operatorLowerCase === 'in' ||
        operatorLowerCase === 'notin' ||
        operatorLowerCase === 'between' ||
        operatorLowerCase === 'notbetween') &&
      !rule.value
    ) {
      return '';
    }

    const valueAsArray: string[] = toArray(rule.value, { retainEmptyStrings: false });
    const valueAsDateArray = valueAsArray
      .map((v): [string, Date] => [v, apiFns.toDate(v)])
      .filter(v => apiFns.isValid(v[1]));

    switch (operatorLowerCase) {
      case 'in':
      case 'notin':
        {
          if (valueAsDateArray.length === 0) return '';
          finalValue = `(${valueAsDateArray
            .map(value =>
              datetimeValueProcessorNL(
                { field: rule.field, operator: '=', value: value[1] },
                { ...opts, context: { ...context, originalValue: value[0] } }
              )
            )
            .join(', ')})`;
        }
        break;

      case 'between':
      case 'notbetween':
        {
          if (valueAsDateArray.length < 2) return '';
          const [first, second] = valueAsDateArray;
          const orderedArray = apiFns.isBefore(first[1], second[1])
            ? [first, second]
            : [second, first];
          finalValue = orderedArray
            .map(([originalValue, value]) =>
              datetimeValueProcessorNL(
                { field: rule.field, operator: '=', value },
                { ...opts, context: { ...context, originalValue } }
              )
            )
            .join(` ${opts.translations?.and ?? 'and'} `);
        }
        break;

      default: {
        const [originalValue, value] = valueAsDateArray[0] ?? ['', ''];
        finalValue = originalValue
          ? datetimeValueProcessorNL(
              { field: rule.field, operator: '=', value },
              { ...opts, context: { ...context, originalValue } }
            )
          : '';
      }
    }

    const processedField = getQuotedFieldName(fieldData?.label ?? rule.field, {
      quoteFieldNamesWith,
      fieldIdentifierSeparator,
    });

    const processedOperator = operatorProcessor(rule, {
      ...opts,
      operatorMap: { ...defaultDateTimeNLOperatorMap, ...operatorMap },
    });

    const wordOrderMap = {
      S: processedField,
      V: processedOperator,
      O: finalValue,
    };

    return normalizeConstituentWordOrder(wordOrder)
      .map(term => `${wordOrderMap[term]}`)
      .join(' ')
      .trim();
  };
