import dayjs from 'dayjs';
import type { RQBDateTimeOperators } from './types';
import { isISOStringDateOnly } from './utils';

export const rqbDateTimeOperatorsDayjs: RQBDateTimeOperators = {
  iso8601DateOnly: 'YYYY-MM-DD',
  format: (a, f) => dayjs(a).format(f),
  isAfter: (a, b) => dayjs(a).isAfter(b),
  isBefore: (a, b) => dayjs(a).isBefore(b),
  isSame: (a, b) =>
    dayjs(a).isSame(b, isISOStringDateOnly(a) || isISOStringDateOnly(b) ? 'd' : 'ms'),
  isValid: a => dayjs(a).isValid(),
  toDate: a => dayjs(a).toDate(),
  toISOString: a => dayjs(a).toISOString(),
};
