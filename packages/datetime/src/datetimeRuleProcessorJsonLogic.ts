import type { DefaultOperatorName, JsonLogicVar, RuleProcessor } from 'react-querybuilder';
import { defaultRuleProcessorJsonLogic, toArray } from 'react-querybuilder';
import type { RQBJsonLogicDateRelative, RQBDateTimeJsonLogic } from './types';
import { isDateOnlyDatatype, isRelativeDateTimeValue, processIsDateField } from './utils';

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
  const opts = options ?? /* v8 ignore start -- @preserve */ {} /* v8 ignore stop -- @preserve */;

  if (!processIsDateField(opts.context?.isDateField, rule, opts)) {
    return defaultRuleProcessorJsonLogic(rule, opts);
  }

  const { field, operator, value, valueSource } = rule;
  const valueIsField = valueSource === 'field';
  const fieldObject: JsonLogicVar = { var: field };
  const dateOnly = isDateOnlyDatatype(opts?.fieldData?.datatype);
  // Relative values stay "live": emit a `dateRelative` op resolved at evaluation time.
  // Field-source values are field names and render as `var` references.
  const renderValue = (v: unknown) => {
    if (valueIsField) return { var: `${v}` };
    if (isRelativeDateTimeValue(v)) {
      return {
        dateRelative: [v.anchor, v.offset, v.unit, dateOnly],
      } as RQBJsonLogicDateRelative;
    }
    return v as string;
  };

  switch (operator) {
    case '<':
    case '<=':
    case '=':
    case '!=':
    case '>':
    case '>=':
      return {
        [dateOperationMap[operator]]: [fieldObject, renderValue(value)],
      } as RQBDateTimeJsonLogic;

    case 'in':
    case 'notIn': {
      const valueAsArray = (Array.isArray(value) ? value : toArray(value)).map(renderValue);
      return { [dateOperationMap[operator]]: [fieldObject, valueAsArray] } as RQBDateTimeJsonLogic;
    }

    case 'between':
    case 'notBetween': {
      const valueAsArray = (Array.isArray(value) ? value : toArray(value)).map(renderValue);

      if (valueAsArray.length < 2) return false;

      return {
        [dateOperationMap[operator]]: [valueAsArray[0], fieldObject, valueAsArray[1]],
      } as RQBDateTimeJsonLogic;
    }
  }

  return defaultRuleProcessorJsonLogic(rule, options);
};
