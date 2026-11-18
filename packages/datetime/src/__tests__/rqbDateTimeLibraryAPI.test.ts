import { dateLibraryFunctions } from '../dbqueryTestUtils';
import { rqbDateTimeLibraryAPI as apiFnsDateFns } from '../rqbDateTimeLibraryAPI.date-fns';
import { rqbDateTimeLibraryAPI as apiFnsDayjs } from '../rqbDateTimeLibraryAPI.dayjs';
import { rqbDateTimeLibraryAPI as apiFnsJS } from '../rqbDateTimeLibraryAPI.jsdate';
import { rqbDateTimeLibraryAPI as apiFnsLuxon } from '../rqbDateTimeLibraryAPI.luxon';

test('format', () => {
  expect(apiFnsDateFns.format('2002-12-14', `YYYY-MM-DD 'a.d.'`)).toBe('2002-12-14 a.d.');
  expect(apiFnsDayjs.format('2002-12-14', `YYYY-MM-DD [a.d.]`)).toBe('2002-12-14 a.d.');
  expect(apiFnsJS.format('2002-12-14', `YYYY-MM-DD 'a.d.'`)).toBe(
    new Date(2002, 11, 14).toISOString()
  );
  expect(apiFnsLuxon.format('2002-12-14', `YYYY-MM-DD 'a.d.'`)).toBe('2002-12-14 a.d.');
});

test('date-fns toISOStringDateOnly keeps signed extended years', () => {
  expect(apiFnsDateFns.toISOStringDateOnly('-000001-01-01')).toBe('-000001-01-01');
  expect(apiFnsDateFns.toISOStringDateOnly('+010000-01-01')).toBe('+010000-01-01');
  expect(apiFnsDateFns.toISOStringDateOnly('0099-06-11')).toBe('0099-06-11');
});

test('JS Date toDate timestamp parsing', () => {
  const iso = (s: string) => apiFnsJS.toDate(s).toISOString();
  const local = (...a: [number, number, number, number, number, number?, number?]) =>
    new Date(...a).toISOString();
  // No offset = local time; seconds optional
  expect(iso('2025-06-11T12:30')).toBe(local(2025, 5, 11, 12, 30));
  expect(iso('2025-06-11 12:30')).toBe(local(2025, 5, 11, 12, 30));
  // Fractional seconds
  expect(iso('2025-06-11T12:30:45.5')).toBe(local(2025, 5, 11, 12, 30, 45, 500));
  expect(iso('2025-06-11T12:30:45.123456')).toBe(local(2025, 5, 11, 12, 30, 45, 123));
  expect(iso('2025-06-11T12:30:45.5Z')).toBe('2025-06-11T12:30:45.500Z');
  expect(iso('2025-06-11T12:30z ')).toBe('2025-06-11T12:30:00.000Z');
  // Local `24:00` rolls into next day; local years 0-99 kept literal
  expect(iso('2025-12-31T24:00')).toBe(local(2026, 0, 1, 0, 0));
  const y99 = new Date(2000, 0, 1);
  y99.setFullYear(99, 5, 11);
  y99.setHours(12, 30, 0, 0);
  expect(iso('0099-06-11T12:30')).toBe(y99.toISOString());
  // Offsets
  expect(iso('2025-06-11T12:30:00Z')).toBe('2025-06-11T12:30:00.000Z');
  expect(iso('2025-06-11T12:30:00+05:30')).toBe('2025-06-11T07:00:00.000Z');
  expect(iso('2025-06-11T12:30-0800')).toBe('2025-06-11T20:30:00.000Z');
  expect(iso('2025-06-11T12:30:00+01:00')).toBe('2025-06-11T11:30:00.000Z');
  // Years 0-99 kept literal
  expect(iso('0099-06-11T12:30Z')).toBe('0099-06-11T12:30:00.000Z');
  expect(apiFnsJS.toISOStringDateOnly('0099-06-11')).toBe('0099-06-11');
  // Invalid: trailing garbage, out-of-range offset
  expect(apiFnsJS.isValid('2025-06-11T12:30:00+05:300')).toBe(false);
  expect(apiFnsJS.isValid('2025-06-11x')).toBe(false);
  expect(apiFnsJS.isValid('2025-06-11T12:30:00+00:60')).toBe(false);
  expect(apiFnsJS.isValid('2025-06-11T12:30:00+24:00')).toBe(false);
  // `24:00` rolls into next day
  expect(iso('2025-12-31T24:00:00Z')).toBe('2026-01-01T00:00:00.000Z');
  // Negative/extended years formatted per ISO 8601
  const negYear = new Date(0);
  negYear.setFullYear(-1, 11, 15);
  expect(apiFnsJS.toISOStringDateOnly(negYear)).toBe('-000001-12-15');
  const bigYear = new Date(0);
  bigYear.setFullYear(10000, 0, 1);
  expect(apiFnsJS.toISOStringDateOnly(bigYear)).toBe('+010000-01-01');
  // Failed parses don't share mutable state
  apiFnsJS.toDate('invalid').setTime(0);
  expect(apiFnsJS.isValid('invalid')).toBe(false);
  // No quadratic backtracking on long whitespace runs
  expect(apiFnsJS.isValid(`2025-06-11T12:30${' '.repeat(50_000)}x`)).toBe(false);
  // Impossible calendar dates, out-of-range clock fields
  expect(apiFnsJS.isValid('2025-02-29')).toBe(false);
  expect(apiFnsJS.toISOStringDateOnly('2025-02-29')).toBe('');
  expect(apiFnsJS.isValid('2025-02-29T12:30:00+01:00')).toBe(false);
  expect(apiFnsJS.isValid('2024-02-29T12:30:00+01:00')).toBe(true);
  expect(apiFnsJS.isValid('2025-06-11T25:00Z')).toBe(false);
  expect(apiFnsJS.isValid('2025-06-11T12:60Z')).toBe(false);
  expect(apiFnsJS.isValid('2025-06-11T12:30:60Z')).toBe(false);
  expect(apiFnsJS.isValid('2025-12-31T24:01+01:00')).toBe(false);
  expect(apiFnsJS.isValid('2025-12-31T24:00:00.001Z')).toBe(false);
  expect(iso('2025-12-31T24:00:00.000Z')).toBe('2026-01-01T00:00:00.000Z');
  // Crossing midnight via offset stays valid
  expect(iso('2025-06-11T00:30+01:00')).toBe('2025-06-10T23:30:00.000Z');
  // Extended years round-trip
  expect(apiFnsJS.toISOStringDateOnly('+010000-01-01')).toBe('+010000-01-01');
  expect(apiFnsJS.toISOStringDateOnly('-000001-12-15')).toBe('-000001-12-15');
  expect(apiFnsJS.isValid('-000000-01-01')).toBe(false);
  expect(apiFnsJS.isBefore('-000001-12-15', '0000-01-01')).toBe(true);
  // Trailing whitespace on date-only strings
  expect(apiFnsJS.toISOStringDateOnly('2025-06-11 ')).toBe('2025-06-11');
});

test('JS Date parser rejection time grows ~linearly w/ whitespace run length', () => {
  const time = (n: number) => {
    const input = `2025-06-11T12:30${' '.repeat(n)}x`;
    const start = performance.now();
    for (let i = 0; i < 5; i++) apiFnsJS.isValid(input);
    return performance.now() - start;
  };
  time(10_000); // warm-up
  const small = time(20_000);
  const large = time(200_000);
  // 10x input: linear ≈ 10x, quadratic ≈ 100x; generous margin for noise
  expect(large / Math.max(small, 0.1)).toBeLessThan(40);
});

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    test('toISOStringDateOnly', () => {
      expect(apiFns.toISOStringDateOnly('2002-12-14')).toBe('2002-12-14');
      expect(apiFns.toISOStringDateOnly(new Date(2002, 12 - 1, 14))).toBe('2002-12-14');
      expect(apiFns.toISOStringDateOnly('invalid')).toBe('');
    });
    test('isAfter', () => {
      expect(apiFns.isAfter('2002-12-14', '2002-12-25')).toBe(false);
      expect(apiFns.isAfter('2002-12-25', '2002-12-14')).toBe(true);
    });
    test('isBefore', () => {
      expect(apiFns.isBefore('2002-12-14', '2002-12-25')).toBe(true);
      expect(apiFns.isBefore('2002-12-25', '2002-12-14')).toBe(false);
    });
    test('isSame', () => {
      expect(apiFns.isSame('2002-12-14', '2002-12-14')).toBe(true);
      expect(apiFns.isSame('2002-12-14', '2002-12-25')).toBe(false);
      expect(apiFns.isSame('2002-12-14T00:00:00.000Z', '2002-12-14T00:00:00.000Z')).toBe(true);
      expect(apiFns.isSame('2002-12-14T00:00:00.000Z', '2002-12-14T00:00:00.001Z')).toBe(false);
    });
    test('isValid', () => {
      expect(apiFns.isValid('2002-12-14')).toBe(true);
      expect(apiFns.isValid('2002-12-14T01:02:03.004Z')).toBe(true);
      expect(apiFns.isValid('invalid')).toBe(false);
    });
    test('toDate', () => {
      expect(apiFns.toDate('2002-12-14')).toBeInstanceOf(Date);
      expect(apiFns.toDate('2002-12-14').getTime()).not.toBeNaN();
      expect(apiFns.toDate('invalid')).toBeInstanceOf(Date);
      expect(apiFns.toDate('invalid').getTime()).toBeNaN();
    });
    test('toISOString', () => {
      expect(apiFns.toISOString('2002-12-14')).toBe(new Date(2002, 11, 14).toISOString());
      expect(apiFns.toISOString('invalid')).toBe('');
    });
  });
}
