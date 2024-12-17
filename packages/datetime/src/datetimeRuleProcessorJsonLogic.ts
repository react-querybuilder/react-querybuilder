import type { DefaultOperatorName, JsonLogicVar, RuleProcessor } from 'react-querybuilder';
import { defaultRuleProcessorJsonLogic, toArray } from 'react-querybuilder';
import type {
  RQBDateTimeJsonLogic,
  RQBDateTimeLibraryAPI,
  RQBJsonLogicDateTimeOperations,
} from './types';
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
 * Date/time rule processor for use by {@link react-querybuilder!index.formatQuery formatQuery}
 * with the "jsonlogic" format.
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

export const getJsonLogicDateTimeOperations = ({
  isAfter,
  isBefore,
  isSame,
}: RQBDateTimeLibraryAPI): RQBJsonLogicDateTimeOperations => ({
  dateAfter: (a, b) => isAfter(a, b),
  dateBefore: (a, b) => isBefore(a, b),
  dateBetween: (a, b, c) =>
    isSame(b, a) ||
    isSame(b, c) ||
    (isAfter(b, a) && isBefore(b, c)) ||
    (isAfter(b, c) && isBefore(b, a)),
  dateNotBetween: (a, b, c) =>
    !isSame(b, a) &&
    !isSame(b, c) &&
    ((isBefore(a, c) && (isBefore(b, a) || isAfter(b, c))) ||
      (isAfter(a, c) && (isBefore(b, c) || isAfter(b, a)))),
  dateIn: (a, b) => b.some(v => isSame(a, v)),
  dateNotIn: (a, b) => b.every(v => !isSame(a, v)),
  dateNotOn: (a, b) => !isSame(a, b),
  dateOn: (a, b) => isSame(a, b),
  dateOnOrAfter: (a, b) => isAfter(a, b) || isSame(a, b),
  dateOnOrBefore: (a, b) => isBefore(a, b) || isSame(a, b),
});
