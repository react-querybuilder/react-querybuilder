import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import {
  createQdrantCollection,
  dropQdrantCollection,
  qdrantEnabled,
  qdrantFilter,
  qdrantInsert,
  reserveSchema,
} from '@rqb-dbpool';
import type { DefaultRuleGroupType, RuleGroupType } from '../../../types';
import { isRuleGroup } from '../../isRuleGroup';
import type { AugmentedSuperUser, SuperUser } from '../dbqueryTestUtils';
import {
  augmentedSuperUsers,
  dbTests,
  genObjectsMatchQuery,
  matchModeTests,
} from '../dbqueryTestUtils';
import { formatCapabilities, getUnsupportedRuleFeature } from '../formatCapabilities';
import { formatQuery } from '../formatQuery';

// CI-only (`DBIntegrationVector` job). Qdrant has no SQL-style NULL ordering; compare sorted ids.
const caps = formatCapabilities.qdrant!;
const collection = reserveSchema('qdrant');
const users: AugmentedSuperUser<boolean>[] = augmentedSuperUsers('postgres');

const names = (us: { madeUpName: string }[]) => us.map(u => u.madeUpName).toSorted();

const isFullySupported = (rg: RuleGroupType): boolean =>
  rg.rules.every(r =>
    isRuleGroup(r) ? isFullySupported(r) : getUnsupportedRuleFeature(r, caps) === null
  );

// Per-DB expected-result overrides (missing-field/null semantics). Source for docs caveats.
const expectedOverrides: Record<string, (u: SuperUser) => boolean> = {};

describe.skipIf(!qdrantEnabled)('Qdrant', () => {
  beforeAll(async () => {
    await createQdrantCollection(collection);
    await qdrantInsert(collection, users as unknown as Record<string, unknown>[]);
  }, 30_000);

  afterAll(async () => {
    await dropQdrantCollection(collection);
  });

  describe('common', () => {
    for (const [name, { query, expectedResult, fqOptions }] of Object.entries(dbTests(users))) {
      if (isFullySupported(query)) {
        test(name, async () => {
          const filter = formatQuery(query, { ...fqOptions, format: 'qdrant' });
          const result = await qdrantFilter<SuperUser>(collection, filter);
          const expected = expectedOverrides[name]
            ? users.filter(expectedOverrides[name])
            : expectedResult;
          expect(names(result)).toEqual(names(expected));
        });
      } else {
        test(`${name} (unsupported → diagnostic)`, () => {
          const { diagnostics } = formatQuery(query, {
            ...fqOptions,
            format: 'diagnostics',
            diagnosticsTargetFormat: 'qdrant',
          });
          expect(diagnostics.some(d => d.source === 'format-check')).toBe(true);
        });
      }
    }
  });

  describe('match modes (objects)', () => {
    for (const [name, mm, fn] of matchModeTests.objects) {
      const query = genObjectsMatchQuery(mm);
      if (!isFullySupported(query)) continue;
      test(name, async () => {
        const result = await qdrantFilter<SuperUser>(collection, formatQuery(query, 'qdrant'));
        expect(names(result)).toEqual(names(users.filter(fn)));
      });
    }
  });

  describe('extras', () => {
    test('empty filter → all points', async () => {
      expect(formatQuery({ combinator: 'and', rules: [] }, 'qdrant')).toEqual({});
      expect(names(await qdrantFilter<SuperUser>(collection, {}))).toEqual(names(users));
    });

    test('RAG-style query', async () => {
      const query: DefaultRuleGroupType = {
        combinator: 'and',
        rules: [
          { field: 'enhanced', operator: '=', value: true },
          { field: 'madeUpName', operator: 'in', value: ['Spider-Man', 'Superman', 'Batman'] },
          { field: 'powerUpAge', operator: 'between', value: [0, 18] },
          {
            combinator: 'or',
            rules: [
              { field: 'firstName', operator: '=', value: 'Peter' },
              { field: 'nickname', operator: 'contains', value: 'Supe' },
            ],
          },
        ],
      };
      const result = await qdrantFilter<SuperUser>(collection, formatQuery(query, 'qdrant'));
      expect(names(result)).toEqual(['Spider-Man', 'Superman']);
    });

    test('datetime_range (RFC 3339)', async () => {
      const dated = reserveSchema('qdrant_dates');
      await createQdrantCollection(dated);
      try {
        await qdrantInsert(dated, [
          { n: 'a', d: '2024-01-01T00:00:00Z' },
          { n: 'b', d: '2024-06-15T12:00:00Z' },
          { n: 'c', d: '2025-01-01T00:00:00Z' },
        ]);
        const filter = formatQuery(
          {
            combinator: 'and',
            rules: [{ field: 'd', operator: 'between', value: ['2024-02-01', '2024-12-31'] }],
          },
          { format: 'qdrant', fields: [{ name: 'd', label: 'd', inputType: 'date' }] }
        );
        const result = await qdrantFilter<{ n: string }>(dated, filter);
        expect(result.map(r => r.n)).toEqual(['b']);
      } finally {
        await dropQdrantCollection(dated);
      }
    });
  });
});
