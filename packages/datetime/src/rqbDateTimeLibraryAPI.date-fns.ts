import {
  toDate as dateFnsToDate,
  add as dateFnsAdd,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import type { Duration } from 'date-fns';
import type {
  RelativeDateTimeTruncationUnit,
  RelativeDateTimeUnit,
  RQBDateTimeLibraryAPI,
} from './types';
import { isISOStringDateOnly } from './utils';

const toDate: typeof dateFnsToDate = a => (typeof a === 'string' ? parseISO(a) : dateFnsToDate(a));
const iso8601DateOnly = 'yyyy-MM-dd';

const startOfMap: Record<RelativeDateTimeTruncationUnit, (d: Date) => Date> = {
  day: startOfDay,
  week: startOfWeek,
  month: startOfMonth,
  year: startOfYear,
};
const endOfMap: Record<RelativeDateTimeTruncationUnit, (d: Date) => Date> = {
  day: endOfDay,
  week: endOfWeek,
  month: endOfMonth,
  year: endOfYear,
};
const durationKeyMap: Record<RelativeDateTimeUnit, keyof Duration> = {
  minute: 'minutes',
  hour: 'hours',
  day: 'days',
  week: 'weeks',
  month: 'months',
  year: 'years',
};

/**
 * {@link RQBDateTimeLibraryAPI} for date-fns
 */
export const rqbDateTimeLibraryAPI: RQBDateTimeLibraryAPI = {
  format: (d, fmt) => format(toDate(d), fmt.replace('YYYY-MM-DD', iso8601DateOnly)),
  isAfter,
  isBefore,
  isSame: (a, b) => {
    const aToDate = toDate(a);
    const bToDate = toDate(b);
    return isISOStringDateOnly(a) || isISOStringDateOnly(b)
      ? isSameDay(aToDate, bToDate)
      : aToDate.getTime() === bToDate.getTime();
  },
  isValid: d => isValid(toDate(d)),
  toDate,
  toISOString: d => {
    const dToDate = toDate(d);
    return isValid(dToDate) ? dToDate.toISOString() : '';
  },
  toISOStringDateOnly: d => {
    const dToDate = toDate(d);
    return isValid(dToDate) ? format(dToDate, iso8601DateOnly) : '';
  },
  startOf: (d, unit) => startOfMap[unit](toDate(d)),
  endOf: (d, unit) => endOfMap[unit](toDate(d)),
  add: (d, amount, unit) => dateFnsAdd(toDate(d), { [durationKeyMap[unit]]: amount }),
};
