import { getFirstOption, isOptionGroupArray } from './optGroupUtils';

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
});
