import { rqbDateTimeLibraryAPI as apiFnsDateFns } from '../rqbDateTimeLibraryAPI.date-fns';
import { rqbDateTimeLibraryAPI as apiFnsDayjs } from '../rqbDateTimeLibraryAPI.dayjs';
import { rqbDateTimeLibraryAPI as apiFnsJS } from '../rqbDateTimeLibraryAPI.jsdate';
import { rqbDateTimeLibraryAPI as apiFnsLuxon } from '../rqbDateTimeLibraryAPI.luxon';
import { dateLibraryFunctions } from '../dbqueryTestUtils';

test('format', () => {
  expect(apiFnsDateFns.format('2002-12-14', `YYYY-MM-DD 'a.d.'`)).toBe('2002-12-14 a.d.');
  expect(apiFnsDayjs.format('2002-12-14', `YYYY-MM-DD [a.d.]`)).toBe('2002-12-14 a.d.');
  expect(apiFnsJS.format('2002-12-14', `YYYY-MM-DD 'a.d.'`)).toBe(
    new Date(2002, 11, 14).toISOString()
  );
  expect(apiFnsLuxon.format('2002-12-14', `YYYY-MM-DD 'a.d.'`)).toBe('2002-12-14 a.d.');
});

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    test('toISOStringDayOnly', () => {
      expect(apiFns.toISOStringDayOnly('2002-12-14')).toBe('2002-12-14');
      expect(apiFns.toISOStringDayOnly(new Date(2002, 12 - 1, 14))).toBe('2002-12-14');
      expect(apiFns.toISOStringDayOnly('invalid')).toBe('');
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
