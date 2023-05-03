import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { toOptions } from './toOptions';

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

it('handles invalid inputs', () => {
  expect(toOptions()).toBeNull();
});
