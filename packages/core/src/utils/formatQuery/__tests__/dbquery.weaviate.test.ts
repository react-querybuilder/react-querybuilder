import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import type { WeaviateProperty } from '@rqb-dbpool';
import {
  createWeaviateClass,
  dropWeaviateClass,
  reserveSchema,
  weaviateClassName,
  weaviateEnabled,
  weaviateFilter,
  weaviateInsert,
} from '@rqb-dbpool';
import type { AugmentedSuperUser, SuperUser } from '../dbqueryTestUtils';
import { augmentedSuperUsers } from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';
import { madeUpNames, vectorDbCommonTests } from '../vectorDbqueryTestUtils';

// CI-only (`DBIntegrationVector` job). Queries via GraphQL `Get`. `null` → property omitted
// (`indexNullState: true` so `IsNull` matches it).
const cls = weaviateClassName(reserveSchema('weaviate'));
const users: AugmentedSuperUser<boolean>[] = augmentedSuperUsers('postgres');
const props: WeaviateProperty[] = [
  { name: 'firstName', dataType: 'text' },
  { name: 'lastName', dataType: 'text' },
  { name: 'madeUpName', dataType: 'text' },
  { name: 'nickname', dataType: 'text' },
  { name: 'enhanced', dataType: 'boolean' },
  { name: 'powerUpAge', dataType: 'int' },
  { name: 'nicknames', dataType: 'text[]' },
];

// Per-DB expected-result overrides (missing-field semantics). Source for docs caveats.
const expectedOverrides: Record<string, (u: SuperUser) => boolean> = {};

describe.skipIf(!weaviateEnabled)('Weaviate', () => {
  beforeAll(async () => {
    await createWeaviateClass(cls, props);
    await weaviateInsert(cls, users as unknown as Record<string, unknown>[]);
  }, 30_000);

  afterAll(async () => {
    await dropWeaviateClass(cls);
  });

  const run = (where: Record<string, unknown>) => weaviateFilter<SuperUser>(cls, where);

  vectorDbCommonTests<Record<string, unknown>>('weaviate', users, run, expectedOverrides);

  describe('weaviate extras', () => {
    test('Like wildcards pass through', async () => {
      const where = formatQuery(
        {
          combinator: 'and',
          rules: [{ field: 'madeUpName', operator: 'contains', value: 'S?ider' }],
        },
        'weaviate'
      );
      expect(madeUpNames(await run(where))).toEqual(['Spider-Man']);
    });

    test('IsNull / Not / ContainsNone', async () => {
      const where = formatQuery(
        {
          combinator: 'and',
          not: true,
          rules: [
            { field: 'powerUpAge', operator: 'notNull', value: null },
            { field: 'madeUpName', operator: 'notIn', value: ['Superman'] },
          ],
        },
        'weaviate'
      );
      expect(madeUpNames(await run(where))).toEqual(
        madeUpNames(users.filter(u => u.powerUpAge === null || u.madeUpName === 'Superman'))
      );
    });

    test('dates → valueDate', async () => {
      const dated = weaviateClassName(reserveSchema('weaviate_dates'));
      await createWeaviateClass(dated, [
        { name: 'madeUpName', dataType: 'text' },
        { name: 'd', dataType: 'date' },
      ]);
      try {
        await weaviateInsert(dated, [
          { madeUpName: 'a', d: '2024-01-01T00:00:00Z' },
          { madeUpName: 'b', d: '2024-06-15T12:00:00Z' },
          { madeUpName: 'c', d: '2025-01-01T00:00:00Z' },
        ]);
        const where = formatQuery(
          {
            combinator: 'and',
            rules: [{ field: 'd', operator: 'between', value: ['2024-02-01', '2024-12-31'] }],
          },
          { format: 'weaviate', fields: [{ name: 'd', label: 'd', inputType: 'date' }] }
        );
        expect(madeUpNames(await weaviateFilter(dated, where))).toEqual(['b']);
      } finally {
        await dropWeaviateClass(dated);
      }
    });
  });
});
