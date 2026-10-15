// Fails if the generated vector DB operator tables in `export.mdx` are stale.
import { expect, test } from 'bun:test';
import path from 'node:path';

test('vector format tables up to date', () => {
  const r = Bun.spawnSync([
    'bun',
    path.join(import.meta.dirname, 'vector-format-tables.ts'),
    '--check',
  ]);
  expect(r.stderr.toString()).toBe('');
  expect(r.exitCode).toBe(0);
});
