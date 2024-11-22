import { DateTime } from 'luxon';
import type { RQBDateTimeLibraryAPI } from './types';
import { isISOStringDateOnly } from './utils';

const toDateTime = (a: string | Date) =>
  typeof a === 'string' ? DateTime.fromISO(a) : DateTime.fromJSDate(a);
const iso8601DateOnly = 'yyyy-MM-dd';

export const rqbDateTimeLibraryAPI: RQBDateTimeLibraryAPI = {
  iso8601DateOnly,
  format: (a, f) => toDateTime(a).toFormat(f.replace('YYYY-MM-DD', iso8601DateOnly)),
  isAfter: (a, b) => toDateTime(a) > toDateTime(b),
  isBefore: (a, b) => toDateTime(a) < toDateTime(b),
  isSame: (a, b) =>
    isISOStringDateOnly(a) || isISOStringDateOnly(b)
      ? toDateTime(a).hasSame(toDateTime(b), 'day')
      : +toDateTime(a) === +toDateTime(b),
  isValid: a => toDateTime(a).isValid,
  toDate: a => toDateTime(a).toJSDate(),
  toISOString: a => toDateTime(a).toJSDate().toISOString(),
};
