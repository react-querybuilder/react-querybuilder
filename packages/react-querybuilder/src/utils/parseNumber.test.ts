import { parseNumber } from './parseNumber';

it('avoids parsing numbers', () => {
  expect(parseNumber({}, { parseNumbers: false })).toEqual({});
  expect(parseNumber([], { parseNumbers: false })).toEqual([]);
  expect(parseNumber('', { parseNumbers: false })).toBe('');
  expect(parseNumber('0', { parseNumbers: false })).toBe('0');
  expect(parseNumber(0, { parseNumbers: false })).toBe(0);
});

it('parses numbers', () => {
  expect(parseNumber({}, { parseNumbers: true })).toEqual({});
  expect(parseNumber([], { parseNumbers: true })).toEqual([]);
  expect(parseNumber('', { parseNumbers: true })).toBe('');
  expect(parseNumber('0', { parseNumbers: true })).toBe(0);
  expect(parseNumber('1', { parseNumbers: true })).toBe(1);
  expect(parseNumber('1abc', { parseNumbers: true })).toBe('1abc');
  expect(parseNumber('1abc', { parseNumbers: 'strict' })).toBe('1abc');
});

it('parses numbers with native parseFloat', () => {
  expect(parseNumber({}, { parseNumbers: 'native' })).toEqual(NaN);
  expect(parseNumber('', { parseNumbers: 'native' })).toBe(NaN);
  expect(parseNumber('0', { parseNumbers: 'native' })).toBe(0);
  expect(parseNumber('1', { parseNumbers: 'native' })).toBe(1);
  expect(parseNumber('1abc', { parseNumbers: 'native' })).toBe(1);
});
