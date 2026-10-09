// Fails if `website/docs/tips/recipes.mdx` is stale vs. current core output.
import { expect, test } from 'bun:test';
import path from 'node:path';

test('recipes.mdx up to date', () => {
  const r = Bun.spawnSync(['bun', path.join(import.meta.dirname, 'recipes.ts'), '--check']);
  expect(r.stderr.toString()).toBe('');
  expect(r.exitCode).toBe(0);
});
