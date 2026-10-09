// Runs core-only skill snippets (no React/JSX) to catch runtime errors.
import { beforeAll, describe, expect, it } from 'bun:test';
import path from 'node:path';
import type { Field, RuleGroupType } from '@react-querybuilder/core';

const dir = path.join(import.meta.dirname, 'snippets');

// (Re)extract snippets so this test never runs stale copies
const extract = Bun.spawnSync([
  'bun',
  path.join(import.meta.dirname, '../../utils/skill-snippets.ts'),
]);
if (!extract.success) throw new Error(extract.stderr.toString());
const files = [...new Bun.Glob('*.tsx').scanSync({ cwd: dir })].toSorted();

const importRegex = /^import\b[^'"]*['"]([^'"]+)['"]/gm;
const tsTranspiler = new Bun.Transpiler({ loader: 'ts' });
/** Parses as plain TS (i.e. no JSX)? */
const isPlainTS = (src: string) => {
  try {
    tsTranspiler.transformSync(src);
    return true;
  } catch {
    return false;
  }
};
const isCoreOnly = (src: string) =>
  isPlainTS(src) &&
  [...src.matchAll(importRegex)].every(m => m[1].startsWith('@react-querybuilder/core'));

// Values for the ambient names declared in `globals.d.ts`
const sampleFields: Field[] = [
  { name: 'firstName', label: 'First name' },
  { name: 'lastName', label: 'Last name' },
  { name: 'age', label: 'Age', inputType: 'number' },
];
const sampleQuery: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'firstName', operator: '=', value: 'Steve' },
    { field: 'age', operator: '>', value: 30 },
  ],
};
const globals: Record<string, unknown> = {
  fields: sampleFields,
  fieldNames: new Set(sampleFields.map(f => f.name)),
  query: sampleQuery,
  input: JSON.stringify({ '==': [{ var: 'firstName' }, 'Steve'] }),
  savedWhereClause: "firstName = 'Steve'",
  assertSafeQuery: () => {},
  db: { query: async () => [] },
};

beforeAll(async () => {
  const core = await import('@react-querybuilder/core');
  const { parseSQL } = await import('@react-querybuilder/core/parseSQL');
  Object.assign(globalThis, globals, {
    formatQuery: core.formatQuery,
    defaultValidator: core.defaultValidator,
    parseSQL,
  });
});

const sources = await Promise.all(files.map(f => Bun.file(path.join(dir, f)).text()));
const runnable = files.filter((_, i) => isCoreOnly(sources[i]));

describe('skill snippets (core-only)', () => {
  it('found snippets', () => {
    expect(files.length).toBeGreaterThan(0);
    expect(runnable.length).toBeGreaterThan(0);
  });

  it.each(runnable)('%s', async file => {
    const mod = await import(path.join(dir, file));
    // Exercise exported functions with sample input where obvious
    for (const [name, fn] of Object.entries(mod)) {
      if (typeof fn !== 'function') continue;
      if (name === 'buildWhere') expect(fn(sampleQuery)).toHaveProperty('sql');
      if (name === 'jsonLogicToSql') expect(fn(globals.input)).toHaveProperty('sql');
      if (name === 'assertSafeQuery') {
        const names = globals.fieldNames;
        expect(() => fn(sampleQuery, names)).not.toThrow();
        const bad = {
          combinator: 'and',
          rules: [{ field: 'x) or (1=1', operator: '=', value: 1 }],
        };
        expect(() => fn(bad, names)).toThrow();
      }
    }
  });
});
