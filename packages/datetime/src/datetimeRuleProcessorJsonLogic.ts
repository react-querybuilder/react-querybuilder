import dayjs from 'dayjs';
import type { DefaultOperatorName, JsonLogicVar, RuleProcessor } from 'react-querybuilder';
import { defaultRuleProcessorJsonLogic, toArray } from 'react-querybuilder';
import type { RQBDateTimeJsonLogic } from './types';

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
 * Date/time rule processor for {@link formatQuery}.
 */
export const datetimeRuleProcessorJsonLogic: RuleProcessor = (
  rule,
  options
): RQBDateTimeJsonLogic => {
  const opts = options ?? /* istanbul ignore next */ {};

  if (!/^(?:date|datetime|datetimeoffset|timestamp)\b/i.test(opts.fieldData?.datatype as string)) {
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

const isSame = (a: string | Date, b: string | Date) =>
  dayjs(a).isSame(
    b,
    (typeof a === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(a)) ||
      (typeof b === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b))
      ? 'd'
      : 'ms'
  );

type FnDateDate = (a: string | Date, b: string | Date) => boolean;
type FnDateArrayOfDates = (a: string | Date, b: (string | Date)[]) => boolean;
type FnDateDateDate = (a: string | Date, b: string | Date, c: string | Date) => boolean;

export const jsonLogicDateTimeOperators: {
  dateAfter: FnDateDate;
  dateBefore: FnDateDate;
  dateBetween: FnDateDateDate;
  dateIn: FnDateArrayOfDates;
  dateNotBetween: FnDateDateDate;
  dateNotIn: FnDateArrayOfDates;
  dateNotOn: FnDateDate;
  dateOn: FnDateDate;
  dateOnOrAfter: FnDateDate;
  dateOnOrBefore: FnDateDate;
} = {
  dateAfter: (a: string | Date, b: string | Date) => dayjs(a).isAfter(b),
  dateBefore: (a: string | Date, b: string | Date) => dayjs(a).isBefore(b),
  dateBetween: (a: string | Date, b: string | Date, c: string | Date) =>
    isSame(b, a) ||
    isSame(b, c) ||
    (dayjs(b).isAfter(a) && dayjs(b).isBefore(c)) ||
    (dayjs(b).isAfter(c) && dayjs(b).isBefore(a)),
  dateNotBetween: (a: string | Date, b: string | Date, c: string | Date) =>
    !isSame(b, a) &&
    !isSame(b, c) &&
    ((dayjs(a).isBefore(c) && (dayjs(b).isBefore(a) || dayjs(b).isAfter(c))) ||
      (dayjs(a).isAfter(c) && (dayjs(b).isBefore(c) || dayjs(b).isAfter(a)))),
  dateIn: (a: string | Date, b: (string | Date)[]) => b.some(v => isSame(a, v)),
  dateNotIn: (a: string | Date, b: (string | Date)[]) => b.every(v => !isSame(a, v)),
  dateNotOn: (a: string | Date, b: string | Date) => !isSame(a, b),
  dateOn: (a: string | Date, b: string | Date) => isSame(a, b),
  dateOnOrAfter: (a: string | Date, b: string | Date) => dayjs(a).isAfter(b) || isSame(a, b),
  dateOnOrBefore: (a: string | Date, b: string | Date) => dayjs(a).isBefore(b) || isSame(a, b),
};
