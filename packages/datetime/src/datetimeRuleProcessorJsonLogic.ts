import type { DefaultOperatorName, JsonLogicVar, RuleProcessor } from 'react-querybuilder';
import { defaultRuleProcessorJsonLogic, toArray } from 'react-querybuilder';
import type { RQBDateTimeJsonLogic } from './types';
import { processIsDateField } from './utils';

const dateOperationMap = {
  '!=': 'dateNotOn',
  '<': 'dateBefore',
  '<=': 'dateOnOrBefore',
  '=': 'dateOn',
  '>': 'dateAfter',
  '>=': 'dateOnOrAfter',
  between: 'dateBetween',
  in: 'dateIn',
  notBetween: 'dateNotBetween',
  notIn: 'dateNotIn',
} as const satisfies Partial<Record<DefaultOperatorName, string>>;

/**
 * Date/time rule processor for use by {@link @react-querybuilder/core!formatQuery formatQuery}
 * with the "jsonlogic" format.
 *
 * Note: Unlike other date/time rule processors from this library, this function does
 * not require a date/time library API. Instead, the date/time library API is used by
 * {@link getDatetimeJsonLogicOperations} during the evaluation process.
 */
export const datetimeRuleProcessorJsonLogic: RuleProcessor = (
  rule,
  options
): RQBDateTimeJsonLogic => {
  const opts = options ?? /* istanbul ignore next */ {};

  if (!processIsDateField(opts.context?.isDateField, rule, opts)) {
    return defaultRuleProcessorJsonLogic(rule, opts);
  }

  const { field, operator, value, valueSource } = rule;
  const valueIsField = valueSource === 'field';
  const fieldObject: JsonLogicVar = { var: field };
  const maybeFieldRenderer = (v: string) => (valueIsField ? { var: `${v}` } : v);

  switch (operator) {
    case '<':
    case '<=':
    case '=':
    case '!=':
    case '>':
    case '>=':
      return {
        [dateOperationMap[operator]]: [fieldObject, maybeFieldRenderer(value)],
      } as RQBDateTimeJsonLogic;

    case 'in':
    case 'notIn': {
      const valueAsArray = toArray(value).map(v => maybeFieldRenderer(v));
      return { [dateOperationMap[operator]]: [fieldObject, valueAsArray] } as RQBDateTimeJsonLogic;
    }

    case 'between':
    case 'notBetween': {
      const valueAsArray = toArray(value).map(v => maybeFieldRenderer(v));

      if (valueAsArray.length < 2) return false;

      return {
        [dateOperationMap[operator]]: [valueAsArray[0], fieldObject, valueAsArray[1]],
      } as RQBDateTimeJsonLogic;
    }
  }

  return defaultRuleProcessorJsonLogic(rule, options);
};
