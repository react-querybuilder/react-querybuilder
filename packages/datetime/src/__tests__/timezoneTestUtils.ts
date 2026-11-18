// Run as a script in a child process w/ `TZ` set (see `timezone.test.ts`). Vitest worker threads
// ignore runtime `process.env.TZ` changes, so time zones can't be switched in-process.
import type { FullField } from '@react-querybuilder/core';
import { dateLibraryFunctions } from '../dbqueryTestUtils';
import type { RelativeDateTimeValue } from '../types';
import { materializeRelativeValues } from '../utils';

const dateField: FullField = { name: 'd', value: 'd', label: 'd', datatype: 'date' };

const rel = (v: Partial<RelativeDateTimeValue>): RelativeDateTimeValue => ({
  mode: 'relative',
  anchor: 'now',
  offset: 0,
  unit: 'day',
  ...v,
});

export const dateOnlyStrings: string[] = ['1957-01-01', '1969-12-31', '2002-12-14', '2024-02-29'];

export interface TimezoneResults {
  tz: number;
  dateOnly: string[];
  localDate: string[];
  isSame: boolean[];
  startEndAdd: string[];
  materialize: unknown[];
  skippedDay: string;
  skippedDayTrailingSpace: string;
  skippedDayOrder: boolean[];
  dateOnlyVsLocalTimeOrder: boolean[];
}

/** Results per library; values must not depend on the local time zone. */
export const getTimezoneResults = (): Record<string, TimezoneResults> =>
  Object.fromEntries(
    dateLibraryFunctions.map(([libName, apiFns]) => {
      const base = new Date(2025, 5, 11, 12, 30);
      const now = new Date(2025, 5, 11, 0, 30);
      const materialize = (anchor: RelativeDateTimeValue['anchor']) =>
        materializeRelativeValues(apiFns, rel({ anchor }), {
          fieldData: dateField,
          context: { relativeDateTimeBase: now },
        });
      return [
        libName,
        {
          tz: new Date(2025, 0, 1).getTimezoneOffset(),
          dateOnly: dateOnlyStrings.map(d => apiFns.toISOStringDateOnly(d)),
          localDate: [
            apiFns.toISOStringDateOnly(new Date(1957, 0, 1)),
            apiFns.toISOStringDateOnly(new Date(1957, 0, 1, 23, 59, 59, 999)),
          ],
          isSame: [
            apiFns.isSame('1957-01-01', '1957-01-01'),
            apiFns.isSame('1957-01-01', new Date(1957, 0, 1, 12)),
            apiFns.isSame('1957-01-01', '1957-01-02'),
          ],
          startEndAdd: [
            apiFns.toISOStringDateOnly(apiFns.startOf(base, 'day')),
            apiFns.toISOStringDateOnly(apiFns.endOf(base, 'day')),
            apiFns.toISOStringDateOnly(apiFns.startOf(base, 'month')),
            apiFns.toISOStringDateOnly(apiFns.endOf(base, 'year')),
            apiFns.toISOStringDateOnly(apiFns.add('2025-06-11', 1, 'day')),
          ],
          materialize: [
            materialize('startOfMonth'),
            materialize('startOfDay'),
            materializeRelativeValues(apiFns, [rel({ anchor: 'startOfMonth' }), '2025-06-11'], {
              fieldData: dateField,
              context: { relativeDateTimeBase: now },
            }),
          ],
          // Pacific/Apia skipped 2011-12-30
          skippedDay: apiFns.toISOStringDateOnly('2011-12-30'),
          skippedDayTrailingSpace: apiFns.toISOStringDateOnly('2011-12-30 '),
          skippedDayOrder: [
            apiFns.isBefore('2011-12-30', '2011-12-31'),
            apiFns.isAfter('2011-12-31', '2011-12-30'),
          ],
          // Date-only = local midnight, so it precedes local 00:30 the same day
          dateOnlyVsLocalTimeOrder: [
            apiFns.isBefore('2025-06-11', '2025-06-11T00:30:00'),
            apiFns.isAfter('2025-06-11T00:30:00', '2025-06-11'),
          ],
        },
      ];
    })
  );

if (import.meta.main) {
  console.log(JSON.stringify(getTimezoneResults()));
}
