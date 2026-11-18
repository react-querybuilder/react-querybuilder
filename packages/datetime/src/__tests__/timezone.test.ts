import type { FullField } from '@react-querybuilder/core';
import { dateLibraryFunctions } from '../dbqueryTestUtils';
import type { RelativeDateTimeValue } from '../types';
import { materializeRelativeValues } from '../utils';

// Extremes on both sides of UTC, plus UTC itself
const timeZones = ['Pacific/Kiritimati', 'Asia/Tokyo', 'UTC', 'America/Los_Angeles', 'Etc/GMT+12'];

const originalTZ = process.env.TZ;
afterAll(() => {
  if (originalTZ === undefined) delete process.env.TZ;
  else process.env.TZ = originalTZ;
});

const dateField: FullField = { name: 'd', value: 'd', label: 'd', datatype: 'date' };

const rel = (v: Partial<RelativeDateTimeValue>): RelativeDateTimeValue => ({
  mode: 'relative',
  anchor: 'now',
  offset: 0,
  unit: 'day',
  ...v,
});

for (const tz of timeZones) {
  describe(`TZ=${tz}`, () => {
    beforeAll(() => {
      process.env.TZ = tz;
    });

    for (const [libName, apiFns] of dateLibraryFunctions) {
      describe(libName, () => {
        test('date-only strings round-trip as local dates', () => {
          for (const d of ['1957-01-01', '1969-12-31', '2002-12-14', '2024-02-29']) {
            expect(apiFns.toISOStringDateOnly(d)).toBe(d);
          }
        });

        test('local Date objects format as local calendar date', () => {
          expect(apiFns.toISOStringDateOnly(new Date(1957, 0, 1))).toBe('1957-01-01');
          expect(apiFns.toISOStringDateOnly(new Date(1957, 0, 1, 23, 59, 59, 999))).toBe(
            '1957-01-01'
          );
        });

        test('isSame compares date-only values by local date', () => {
          expect(apiFns.isSame('1957-01-01', '1957-01-01')).toBe(true);
          expect(apiFns.isSame('1957-01-01', new Date(1957, 0, 1, 12))).toBe(true);
          expect(apiFns.isSame('1957-01-01', '1957-01-02')).toBe(false);
        });

        test('startOf/endOf/add stay on local calendar', () => {
          const base = new Date(2025, 5, 11, 12, 30);
          expect(apiFns.toISOStringDateOnly(apiFns.startOf(base, 'day'))).toBe('2025-06-11');
          expect(apiFns.toISOStringDateOnly(apiFns.endOf(base, 'day'))).toBe('2025-06-11');
          expect(apiFns.toISOStringDateOnly(apiFns.startOf(base, 'month'))).toBe('2025-06-01');
          expect(apiFns.toISOStringDateOnly(apiFns.endOf(base, 'year'))).toBe('2025-12-31');
          expect(apiFns.toISOStringDateOnly(apiFns.add('2025-06-11', 1, 'day'))).toBe('2025-06-12');
        });

        test('materializes relative date-only values as local dates', () => {
          const now = new Date(2025, 5, 11, 0, 30);
          expect(
            materializeRelativeValues(apiFns, rel({ anchor: 'startOfMonth' }), {
              fieldData: dateField,
              context: { relativeDateTimeBase: now },
            })
          ).toBe('2025-06-01');
          expect(
            materializeRelativeValues(apiFns, rel({ anchor: 'startOfDay' }), {
              fieldData: dateField,
              context: { relativeDateTimeBase: now },
            })
          ).toBe('2025-06-11');
        });
      });
    }
  });
}
