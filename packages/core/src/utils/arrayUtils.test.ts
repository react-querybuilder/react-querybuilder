import { joinWith, nullFreeArray, splitBy, toArray } from './arrayUtils';

const commaString = String.raw`this\,\,that,,the other,,,\,`;
const commaArray = ['this,,that', '', 'the other', '', '', ','];
const plusString = String.raw`this\+\+that++the other+++\+`;
const plusArray = ['this++that', '', 'the other', '', '', '+'];

it('splits by a character', () => {
  expect(splitBy()).toEqual([]);
  expect(splitBy(undefined, '+')).toEqual([]);
  expect(splitBy(commaString)).toEqual(commaArray);
  expect(splitBy(commaString, ',')).toEqual(commaArray);
  expect(splitBy(plusString, '+')).toEqual(plusArray);
});

it('joins with a character', () => {
  expect(joinWith(commaArray)).toBe(commaString);
  expect(joinWith(commaArray, ',')).toBe(commaString);
  expect(joinWith(plusArray, '+')).toBe(plusString);
  expect(joinWith([null])).toBe('');
  expect(joinWith([undefined])).toBe('');
});

it('converts stuff to an array', () => {
  expect(toArray([])).toEqual([]);
  expect(toArray({})).toEqual([]);
  expect(toArray(true)).toEqual([]);
  expect(toArray(false)).toEqual([]);
  expect(toArray(1214)).toEqual([1214]);
  expect(toArray('test')).toEqual(['test']);
  expect(toArray('test,  ,,,this')).toEqual(['test', 'this']);
  expect(toArray([null, 'test', 1214, '  '])).toEqual([null, 'test', 1214, '']);
});

it('retains empty strings', () => {
  const testString = 'test,  ,,,this';
  expect(toArray(testString, { retainEmptyStrings: true })).toEqual(['test', '', '', '', 'this']);
  expect(toArray(testString, { retainEmptyStrings: false })).toEqual(['test', 'this']);
});

it('detects null-free arrays', () => {
  expect(nullFreeArray([])).toBe(true);
  expect(nullFreeArray([0])).toBe(true);
  expect(nullFreeArray([1])).toBe(true);
  expect(nullFreeArray([1, 2])).toBe(true);
  expect(nullFreeArray([0, 1, 2])).toBe(true);
  expect(nullFreeArray([1, null, 2])).toBe(false);
  expect(nullFreeArray([''])).toBe(true);
  expect(nullFreeArray(['1', '2'])).toBe(true);
  expect(nullFreeArray(['1', null, '2'])).toBe(false);
  expect(nullFreeArray([{}, {}])).toBe(true);
  expect(nullFreeArray([{}, null, {}])).toBe(false);
  expect(nullFreeArray([true, false])).toBe(true);
  expect(nullFreeArray([true, null, false])).toBe(false);
});
