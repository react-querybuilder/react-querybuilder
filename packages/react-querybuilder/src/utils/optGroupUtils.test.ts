import type { FullOption } from '../types';
import {
  getFirstOption,
  isFlexibleOptionGroupArray,
  isFullOptionGroupArray,
  isOptionGroupArray,
  toFlatOptionArray,
} from './optGroupUtils';
import { toFullOption } from './toFullOption';

it('identifies option group arrays', () => {
  expect(isOptionGroupArray([])).toBe(false);
  expect(isOptionGroupArray([{ name: 'test', label: 'Test' }])).toBe(false);
  expect(isOptionGroupArray([{ label: 'Test', options: [] }])).toBe(true);
});

it('gets the first option', () => {
  expect(
    getFirstOption([
      { name: 'test2', label: 'Test2' },
      { name: 'test1', label: 'Test1' },
    ])
  ).toBe('test2');
  expect(
    getFirstOption([
      {
        label: 'Test',
        options: [
          { name: 'test2', label: 'Test2' },
          { name: 'test1', label: 'Test1' },
        ],
      },
    ])
  ).toBe('test2');
});

it('handles invalid inputs', () => {
  expect(getFirstOption()).toBeNull();
  expect(getFirstOption([])).toBeNull();
  expect(isFlexibleOptionGroupArray([])).toBe(false);
  expect(isFlexibleOptionGroupArray({})).toBe(false);
});

it('identifies flexible option group arrays', () => {
  expect(isFlexibleOptionGroupArray([{ label: 'l', options: [{ name: 'n', label: 'l' }] }])).toBe(
    true
  );
  expect(isFlexibleOptionGroupArray([{ label: 'l', options: [{ value: 'v', label: 'l' }] }])).toBe(
    true
  );
  expect(isFlexibleOptionGroupArray([{ label: 'l', options: [{ label: 'l' }] }])).toBe(false);
});

it('identifies full option group arrays', () => {
  expect(isFullOptionGroupArray([{ label: 'l', options: [{ name: 'n', label: 'l' }] }])).toBe(
    false
  );
  expect(
    isFullOptionGroupArray([{ label: 'l', options: [{ name: 'n', value: 'v', label: 'l' }] }])
  ).toBe(true);
});

describe('toFlatOptionArray', () => {
  const arr: FullOption[] = [
    { name: 'test1', label: 'Test1' },
    { name: 'test2', label: 'Test2' },
    { name: 'test2', label: 'Test3' },
  ].map(o => toFullOption(o));

  it('returns option arrays as is instead of flattening', () => {
    expect(toFlatOptionArray(arr)).toEqual(arr.slice(0, 2));
  });

  it('flattens option group arrays', () => {
    expect(toFlatOptionArray([{ label: 'test', options: arr }])).toEqual(arr.slice(0, 2));
  });
});
