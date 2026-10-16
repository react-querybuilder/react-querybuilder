import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import type { MilvusField } from '@rqb-dbpool';
import {
  createMilvusCollection,
  dropMilvusCollection,
  milvusEnabled,
  milvusFilter,
  milvusInsert,
  reserveSchema,
} from '@rqb-dbpool';
import type { AugmentedSuperUser, SuperUser } from '../dbqueryTestUtils';
import { augmentedSuperUsers } from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';
import { madeUpNames, vectorDbCommonTests } from '../vectorDbqueryTestUtils';

// CI-only (`DBIntegrationVector` job). Explicit scalar schema; `powerUpAge` nullable.
const collection = reserveSchema('milvus');
const users: AugmentedSuperUser<boolean>[] = augmentedSuperUsers('postgres');
const fields: MilvusField[] = [
  { name: 'firstName', dataType: 'VarChar' },
  { name: 'lastName', dataType: 'VarChar' },
  { name: 'madeUpName', dataType: 'VarChar' },
  { name: 'nickname', dataType: 'VarChar' },
  { name: 'enhanced', dataType: 'Bool' },
  { name: 'powerUpAge', dataType: 'Int64', nullable: true },
];

// Per-DB expected-result overrides (null semantics). Source for docs caveats.
const expectedOverrides: Record<string, (u: SuperUser) => boolean> = {};

describe.skipIf(!milvusEnabled)('Milvus', () => {
  beforeAll(async () => {
    await createMilvusCollection(collection, fields);
    await milvusInsert(collection, users as unknown as Record<string, unknown>[]);
  }, 60_000);

  afterAll(async () => {
    await dropMilvusCollection(collection);
  });

  const run = (filter: string) => milvusFilter<SuperUser>(collection, filter);

  vectorDbCommonTests<string>('milvus', users, run, expectedOverrides);

  describe('milvus extras', () => {
    test('like escaping', async () => {
      const esc = reserveSchema('milvus_like');
      await createMilvusCollection(esc, [{ name: 'madeUpName', dataType: 'VarChar' }]);
      try {
        await milvusInsert(esc, [
          { madeUpName: '50%_off' },
          { madeUpName: '50xyoff' },
          { madeUpName: 'a"b\\c' },
        ]);
        const q = (value: string) =>
          formatQuery(
            { combinator: 'and', rules: [{ field: 'madeUpName', operator: 'contains', value }] },
            'milvus'
          );
        expect(madeUpNames(await milvusFilter(esc, q('%_')))).toEqual(['50%_off']);
        expect(madeUpNames(await milvusFilter(esc, q('"b\\')))).toEqual(['a"b\\c']);
      } finally {
        await dropMilvusCollection(esc);
      }
    });

    test('is null / valueSource field', async () => {
      const where = formatQuery(
        {
          combinator: 'or',
          rules: [
            { field: 'powerUpAge', operator: 'null', value: null },
            { field: 'firstName', operator: '=', value: 'lastName', valueSource: 'field' },
          ],
        },
        'milvus'
      );
      expect(madeUpNames(await run(where))).toEqual(
        madeUpNames(users.filter(u => u.powerUpAge === null || u.firstName === u.lastName))
      );
    });
  });
});
