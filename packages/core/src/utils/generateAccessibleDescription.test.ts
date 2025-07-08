import { generateAccessibleDescription } from './generateAccessibleDescription';

it('generates accessible description', () => {
  expect(generateAccessibleDescription({ path: [], qbId: '' })).toBe('Query builder');
  expect(generateAccessibleDescription({ path: [1, 2, 3], qbId: '' })).toBe(
    'Rule group at path 1-2-3'
  );
});
