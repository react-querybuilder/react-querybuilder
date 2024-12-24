import { DateTime } from 'luxon';
import type { RQBDateTimeLibraryAPI } from './types';
import { isISOStringDateOnly } from './utils';

const toDateTime = (a: string | Date) =>
  typeof a === 'string' ? DateTime.fromISO(a) : DateTime.fromJSDate(a);
const iso8601DateOnly = 'yyyy-MM-dd';

/**
 * {@link RQBDateTimeLibraryAPI} for Luxon
 */
export const rqbDateTimeLibraryAPI: RQBDateTimeLibraryAPI = {
  format: (d, fmt) => toDateTime(d).toFormat(fmt.replace('YYYY-MM-DD', iso8601DateOnly)),
  isAfter: (a, b) => toDateTime(a) > toDateTime(b),
  isBefore: (a, b) => toDateTime(a) < toDateTime(b),
  isSame: (a, b) =>
    isISOStringDateOnly(a) || isISOStringDateOnly(b)
      ? toDateTime(a).hasSame(toDateTime(b), 'day')
      : +toDateTime(a) === +toDateTime(b),
  isValid: d => toDateTime(d).isValid,
  toDate: d => toDateTime(d).toJSDate(),
  toISOString: d => {
    const dToDate = toDateTime(d);
    return dToDate.isValid ? dToDate.toJSDate().toISOString() : '';
  },
  toISOStringDateOnly: d => {
    const dToDate = toDateTime(d);
    return dToDate.isValid ? dToDate.toFormat(iso8601DateOnly) : '';
  },
};
