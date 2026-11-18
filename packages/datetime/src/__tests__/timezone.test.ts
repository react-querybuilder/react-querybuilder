import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { dateOnlyStrings, type TimezoneResults } from './timezoneTestUtils';

// Extremes on both sides of UTC, UTC, and Apia (skipped 2011-12-30) w/ Jan 1 2025 offsets
const timeZones: Record<string, number> = {
  'Pacific/Kiritimati': -840,
  'Asia/Tokyo': -540,
  UTC: 0,
  'America/Los_Angeles': 480,
  'Etc/GMT+12': 720,
  'Pacific/Apia': -780,
};

// Vitest worker threads ignore runtime `process.env.TZ` changes; run in a child process instead
const runInTimeZone = (tz: string): Record<string, TimezoneResults> => {
  const { stdout, stderr, status } = spawnSync(
    'bun',
    [path.join(import.meta.dirname, 'timezoneTestUtils.ts')],
    { env: { ...process.env, TZ: tz }, encoding: 'utf8' }
  );
  if (status !== 0) throw new Error(stderr);
  return JSON.parse(stdout);
};

for (const [tz, offset] of Object.entries(timeZones)) {
  describe(`TZ=${tz}`, () => {
    const results = runInTimeZone(tz);

    test('child process uses the requested time zone', () => {
      for (const r of Object.values(results)) expect(r.tz).toBe(offset);
    });

    for (const [libName, r] of Object.entries(results)) {
      describe(libName, () => {
        test('date-only strings round-trip as local dates', () => {
          expect(r.dateOnly).toEqual(dateOnlyStrings);
        });

        test('local Date objects format as local calendar date', () => {
          expect(r.localDate).toEqual(['1957-01-01', '1957-01-01']);
        });

        test('isSame compares date-only values by local date', () => {
          expect(r.isSame).toEqual([true, true, false]);
        });

        test('startOf/endOf/add stay on local calendar', () => {
          expect(r.startEndAdd).toEqual([
            '2025-06-11',
            '2025-06-11',
            '2025-06-01',
            '2025-12-31',
            '2025-06-12',
          ]);
        });

        test('materializes relative date-only values as local dates', () => {
          expect(r.materialize).toEqual(['2025-06-01', '2025-06-11']);
        });

        // Third-party libs resolve skipped local days to the next day; JS Date keeps the input
        if (libName === 'JS Date') {
          test('keeps date-only string on a skipped local day', () => {
            expect(r.skippedDay).toBe('2011-12-30');
          });
        }
      });
    }
  });
}
