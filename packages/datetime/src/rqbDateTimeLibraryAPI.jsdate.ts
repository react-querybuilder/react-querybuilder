import type {
  RelativeDateTimeTruncationUnit,
  RelativeDateTimeUnit,
  RQBDateTimeLibraryAPI,
} from './types';
import { isISOStringDateOnly } from './utils';

const invalidDate = new Date(Number.NaN);

// Full match only; trailing garbage = invalid
const dateRegExp =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?\s*(?:Z|([+-])(\d{2}):?(\d{2}))?)?\s*$/i;

const toDate = (d: string | Date) => {
  if (d instanceof Date) return d;

  const reMatch = dateRegExp.exec(d);

  if (!reMatch) return invalidDate;

  const [_all, yyyy, mm, dd, hh, mi, ss = '0', frac = '0', sign, oh = '0', om = '0'] = reMatch;
  const [year, monthIndex, day] = [+yyyy, +mm - 1, +dd];

  // `setFullYear`/`setUTCFullYear` avoid the Date ctor's 0-99 → 1900-1999 mapping
  if (!hh) {
    const r = new Date(2000, 0, 1);
    r.setFullYear(year, monthIndex, day);
    return r;
  }

  if (+oh > 23 || +om > 59) return invalidDate;

  // Fractional seconds -> ms ('.5' = 500ms; extra digits truncated)
  const ms = +frac.slice(0, 3).padEnd(3, '0');
  // No offset (or `Z`) = UTC
  const offsetMinutes = (sign === '-' ? -1 : 1) * (+oh * 60 + +om);

  const r = new Date(Date.UTC(2000, 0, 1, +hh, +mi, +ss, ms));
  r.setUTCFullYear(year, monthIndex, day);
  return new Date(r.getTime() - offsetMinutes * 60_000);
};

const isValid = (d: string | Date) => {
  const dToDate = toDate(d);
  return dToDate instanceof Date && !Number.isNaN(dToDate.getTime());
};

const toISOStringDateOnly = (d: string | Date) => {
  const dToDate = toDate(d);
  if (!isValid(dToDate)) return '';
  // Local calendar date (matches other adapters); `toISOString` would shift to UTC
  const yyyy = `${dToDate.getFullYear()}`.padStart(4, '0');
  const mm = `${dToDate.getMonth() + 1}`.padStart(2, '0');
  const dd = `${dToDate.getDate()}`.padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
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
