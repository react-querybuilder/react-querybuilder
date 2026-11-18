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

test('JS Date toDate timestamp parsing', () => {
  const iso = (s: string) => apiFnsJS.toDate(s).toISOString();
  // Seconds optional
  expect(iso('2025-06-11T12:30')).toBe('2025-06-11T12:30:00.000Z');
  expect(iso('2025-06-11 12:30')).toBe('2025-06-11T12:30:00.000Z');
  // Fractional seconds
  expect(iso('2025-06-11T12:30:45.5')).toBe('2025-06-11T12:30:45.500Z');
  expect(iso('2025-06-11T12:30:45.123456')).toBe('2025-06-11T12:30:45.123Z');
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
  const start = performance.now();
  expect(apiFnsJS.isValid(`2025-06-11T12:30${' '.repeat(50_000)}x`)).toBe(false);
  expect(performance.now() - start).toBeLessThan(500);
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
