import type {
  RelativeDateTimeTruncationUnit,
  RelativeDateTimeUnit,
  RQBDateTimeLibraryAPI,
} from './types';
import { isISOStringDateOnly } from './utils';

const invalidDate = new Date(Number.NaN);

const dateRegExp = /^(\d{4})-(\d{2})-(\d{2})([T ](\d{2}):(\d{2}):(\d{2})(\.(\d{1,3}))?)?/;

const toDate = (d: string | Date) => {
  if (d instanceof Date) return d;

  const reMatch = dateRegExp.exec(d);

  if (!reMatch) return invalidDate;

  const [_all, yyyy, mm, dd, _time, hh, mi, ss, _decimal, sss] = reMatch;
  const [year, month, day, hours, minutes, seconds, ms] = [yyyy, mm, dd, hh, mi, ss, sss ?? '0']
    .filter(Boolean)
    .map(Number);

  const monthIndex = month - 1;

  return hh
    ? new Date(Date.UTC(year, monthIndex, day, hours, minutes, seconds, ms))
    : new Date(year, monthIndex, day);
};

const isValid = (d: string | Date) => {
  const dToDate = toDate(d);
  return dToDate instanceof Date && !Number.isNaN(dToDate.getTime());
};

const toISOStringDateOnly = (d: string | Date) => {
  const dToDate = toDate(d);
  return isValid(dToDate) ? dToDate.toISOString().slice(0, 10) : '';
};

// Week starts on Sunday (matching Day.js/date-fns defaults).
const startOf = (d: string | Date, unit: RelativeDateTimeTruncationUnit): Date => {
  const r = new Date(toDate(d).getTime());
  r.setHours(0, 0, 0, 0);
  switch (unit) {
    case 'week':
      r.setDate(r.getDate() - r.getDay());
      break;
    case 'month':
      r.setDate(1);
      break;
    case 'year':
      r.setMonth(0, 1);
      break;
  }
  return r;
};

const endOf = (d: string | Date, unit: RelativeDateTimeTruncationUnit): Date => {
  const r = new Date(toDate(d).getTime());
  r.setHours(23, 59, 59, 999);
  switch (unit) {
    case 'week':
      r.setDate(r.getDate() + (6 - r.getDay()));
      break;
    case 'month':
      r.setMonth(r.getMonth() + 1, 0);
      break;
    case 'year':
      r.setMonth(11, 31);
      break;
  }
  return r;
};

const add = (d: string | Date, amount: number, unit: RelativeDateTimeUnit): Date => {
  const r = new Date(toDate(d).getTime());
  switch (unit) {
    case 'minute':
      r.setMinutes(r.getMinutes() + amount);
      break;
    case 'hour':
      r.setHours(r.getHours() + amount);
      break;
    case 'day':
      r.setDate(r.getDate() + amount);
      break;
    case 'week':
      r.setDate(r.getDate() + amount * 7);
      break;
    case 'month':
      r.setMonth(r.getMonth() + amount);
      break;
    case 'year':
      r.setFullYear(r.getFullYear() + amount);
      break;
  }
  return r;
};

/**
 * {@link RQBDateTimeLibraryAPI} for JavaScript `Date`
 *
 * @deprecated This API will not be removed, but we recommend using one of the other
 * {@link RQBDateTimeLibraryAPI}s based on a popular library instead.
 */
export const rqbDateTimeLibraryAPI: RQBDateTimeLibraryAPI = {
  format: d => toDate(d).toISOString(),
  isAfter: (a, b) => {
    const dateA = toDate(a).getTime();
    const dateB = toDate(b).getTime();
    return !Number.isNaN(dateA) && !Number.isNaN(dateB) && dateA > dateB;
  },
  isBefore: (a, b) => {
    const dateA = toDate(a).getTime();
    const dateB = toDate(b).getTime();
    return !Number.isNaN(dateA) && !Number.isNaN(dateB) && dateA < dateB;
  },
  isSame: (a, b) => {
    const aToDate = toDate(a);
    const bToDate = toDate(b);
    return isISOStringDateOnly(a) || isISOStringDateOnly(b)
      ? toISOStringDateOnly(a) === toISOStringDateOnly(b)
      : aToDate.getTime() === bToDate.getTime();
  },
  isValid,
  toDate,
  toISOString: d => {
    const dToDate = toDate(d);
    return isValid(dToDate) ? dToDate.toISOString() : '';
  },
  toISOStringDateOnly,
  startOf,
  endOf,
  add,
};
