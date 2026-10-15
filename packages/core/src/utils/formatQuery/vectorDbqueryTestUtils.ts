import { describe, expect, test } from 'bun:test';
import type { DefaultRuleGroupType, ExportFormat, RuleGroupType } from '../../types';
import { isRuleGroup } from '../isRuleGroup';
import type { AugmentedSuperUser, SuperUser } from './dbqueryTestUtils';
import { dbTests } from './dbqueryTestUtils';
import { formatCapabilities, getUnsupportedRuleFeature } from './formatCapabilities';
import { formatQuery } from './formatQuery';

// Shared `dbquery.<vector db>` test body. Vector DBs don't order results; compare sorted names.

export const madeUpNames = (us: { madeUpName: string }[]): string[] =>
  us.map(u => u.madeUpName).toSorted();

export const isFullySupported = (format: ExportFormat, rg: RuleGroupType): boolean =>
  rg.rules.every(r =>
    isRuleGroup(r)
      ? isFullySupported(format, r)
      : getUnsupportedRuleFeature(r, formatCapabilities[format]!) === null
  );

export const ragQuery: DefaultRuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'enhanced', operator: '=', value: true },
    { field: 'madeUpName', operator: 'in', value: ['Spider-Man', 'Superman', 'Batman'] },
    { field: 'powerUpAge', operator: 'between', value: [0, 18] },
    {
      combinator: 'or',
      rules: [
        { field: 'firstName', operator: '=', value: 'Peter' },
        { field: 'lastName', operator: '=', value: 'Kent' },
      ],
    },
  ],
};

/**
 * Registers `common` (all `dbTests`; unsupported → `format-check` diagnostic) and the
 * RAG/empty-filter extras. Call inside the DB's `describe`.
 */
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters
export const vectorDbCommonTests = <F>(
  format: 'pinecone' | 'chroma' | 'weaviate' | 'milvus' | 'qdrant',
  users: AugmentedSuperUser<boolean>[],
  run: (filter: F) => Promise<{ madeUpName: string }[]>,
  /** Per-DB expected-result overrides (missing-field/null semantics). Docs caveat source. */
  expectedOverrides: Record<string, (u: SuperUser) => boolean> = {}
): void => {
  const fq = formatQuery as (q: RuleGroupType, o: object) => F;

  describe('common', () => {
    for (const [name, { query, expectedResult, fqOptions }] of Object.entries(dbTests(users))) {
      if (isFullySupported(format, query)) {
        test(name, async () => {
          const result = await run(fq(query, { ...fqOptions, format }));
          const expected = expectedOverrides[name]
            ? users.filter(expectedOverrides[name])
            : expectedResult;
          expect(madeUpNames(result)).toEqual(madeUpNames(expected));
        });
      } else {
        test(`${name} (unsupported → diagnostic)`, () => {
          const { diagnostics } = formatQuery(query, {
            ...fqOptions,
            format: 'diagnostics',
            diagnosticsTargetFormat: format,
          });
          expect(diagnostics.some(d => d.source === 'format-check')).toBe(true);
        });
      }
    }
  });

  describe('extras', () => {
    test('empty filter → all records', async () => {
      const empty = fq({ combinator: 'and', rules: [] }, { format });
      expect(empty).toEqual((format === 'milvus' ? '' : {}) as F);
      expect(madeUpNames(await run(empty))).toEqual(madeUpNames(users));
    });

    test('RAG-style query', async () => {
      expect(madeUpNames(await run(fq(ragQuery, { format })))).toEqual(['Spider-Man', 'Superman']);
    });
  });
};
