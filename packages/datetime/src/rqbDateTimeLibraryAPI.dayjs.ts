import dayjs from 'dayjs';
import type { RQBDateTimeLibraryAPI } from './types';
import { isISOStringDateOnly } from './utils';

export const rqbDateTimeLibraryAPI: RQBDateTimeLibraryAPI = {
  format: (d, fmt) => dayjs(d).format(fmt),
  isAfter: (a, b) => dayjs(a).isAfter(b),
  isBefore: (a, b) => dayjs(a).isBefore(b),
  isSame: (a, b) =>
    dayjs(a).isSame(b, isISOStringDateOnly(a) || isISOStringDateOnly(b) ? 'd' : 'ms'),
  isValid: d => dayjs(d).isValid(),
  toDate: d => dayjs(d).toDate(),
  toISOString: d => {
    const dToDate = dayjs(d);
    return dToDate.isValid() ? dToDate.toISOString() : '';
  },
  toISOStringDayOnly: d => {
    const dToDate = dayjs(d);
    return dToDate.isValid() ? dToDate.format('YYYY-MM-DD') : '';
  },
};
