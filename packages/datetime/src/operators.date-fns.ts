import {
  toDate as dateFnsToDate,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameSecond,
  isValid,
  parseISO,
} from 'date-fns';
import type { RQBDateTimeOperators } from './types';
import { isISOStringDateOnly } from './utils';

const toDate: typeof dateFnsToDate = a => (typeof a === 'string' ? parseISO(a) : dateFnsToDate(a));
const iso8601DateOnly = 'yyyy-MM-dd';

export const rqbDateTimeOperatorsDateFns: RQBDateTimeOperators = {
  iso8601DateOnly,
  format: (a, f) => format(toDate(a), f.replace('YYYY-MM-DD', iso8601DateOnly)),
  isAfter,
  isBefore,
  isSame: (a, b) =>
    isISOStringDateOnly(a) || isISOStringDateOnly(b)
      ? isSameDay(toDate(a), toDate(b))
      : isSameSecond(toDate(a), toDate(b)),
  isValid,
  toDate,
  toISOString: a => toDate(a).toISOString(),
};
