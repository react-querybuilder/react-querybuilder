import type { Path } from '../types';
import { generateAccessibleDescription } from './generateAccessibleDescription';

it('generates correct description for root path', () => {
  const description = generateAccessibleDescription({ path: [] as Path, qbId: 'qbId' });
  expect(description).toBe('Query builder');
});

it('generates correct description for non-root path', () => {
  const description = generateAccessibleDescription({ path: [0, 1, 2] as Path, qbId: 'qbId' });
  expect(description).toBe('Rule group at path 0-1-2');
});
