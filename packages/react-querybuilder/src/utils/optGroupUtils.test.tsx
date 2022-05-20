import { render, screen } from '@testing-library/react';
import { getFirstOption, isOptionGroupArray, toOptions } from './optGroupUtils';

it('identifies option group arrays', () => {
  expect(isOptionGroupArray([])).toBe(false);
  expect(isOptionGroupArray([{ name: 'test', label: 'Test' }])).toBe(false);
  expect(isOptionGroupArray([{ label: 'Test', options: [] }])).toBe(true);
});

it('builds an empty option list', () => {
  const { container } = render(<select>{toOptions([])}</select>);
  expect(container.getElementsByTagName('option')).toHaveLength(0);
});

it('builds an option list', () => {
  const { container } = render(<select>{toOptions([{ name: 'test', label: 'Test' }])}</select>);
  expect(container.getElementsByTagName('option')).toHaveLength(1);
  expect(screen.getByText('Test')).toBeInTheDocument();
});

it('builds an option group list', () => {
  const { container } = render(
    <select>{toOptions([{ label: 'Test', options: [{ name: 'test', label: 'Test' }] }])}</select>
  );
  expect(container.getElementsByTagName('option')).toHaveLength(1);
  expect(screen.getByText('Test')).toBeInTheDocument();
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
  expect(toOptions()).toBeNull();
  expect(getFirstOption()).toBeNull();
  expect(getFirstOption([])).toBeNull();
});
