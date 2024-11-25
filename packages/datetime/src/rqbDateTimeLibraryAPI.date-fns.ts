import {
  toDate as dateFnsToDate,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
  parseISO,
} from 'date-fns';
import type { RQBDateTimeLibraryAPI } from './types';
import { isISOStringDateOnly } from './utils';

const toDate: typeof dateFnsToDate = a => (typeof a === 'string' ? parseISO(a) : dateFnsToDate(a));
const iso8601DateOnly = 'yyyy-MM-dd';

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
  toISOStringDayOnly: d => {
    const dToDate = toDate(d);
    return isValid(dToDate) ? format(dToDate, iso8601DateOnly) : '';
  },
};
