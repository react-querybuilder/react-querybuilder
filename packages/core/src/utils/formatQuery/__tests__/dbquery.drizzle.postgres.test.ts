/* @vitest-environment node */

import { createSchema, dropSchema, getSharedPGlite, reserveSchema } from '@rqb-dbpool';
import { boolean, integer, pgSchema, text } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/pglite';
import { convertToIC } from '../../convertQuery';
import { formatQuery } from '../../formatQuery';
import { dbTestsDrizzle } from '../dbqueryDrizzleTestUtils';
import type { TestSQLParams } from '../dbqueryTestUtils';
import {
  augmentedSuperUsers,
  dbSetup,
  genStringsMatchQuery,
  matchModeTests,
  superUsers,
} from '../dbqueryTestUtils';

const columnsPostgres = {
  firstName: text().notNull(),
  lastName: text().notNull(),
  enhanced: boolean().notNull(),
  madeUpName: text().notNull(),
  nickname: text().notNull(),
  powerUpAge: integer(),
};
const columnsPostgresAugmented = { ...columnsPostgres, nicknames: text().array() };

describe('Drizzle relational queries (PostgreSQL)', () => {
  const schemaName = reserveSchema('drizzle_pg');
  const superusers = pgSchema(schemaName).table('superusers', columnsPostgres);
  const superUsersPostgres = superUsers('postgres');

  const testPostgres = ({ query, expectedResult, fqOptions }: TestSQLParams) => {
    test.each(['standard', 'independent combinators'])('%s', async testType => {
      const pglitePostgresDB = await getSharedPGlite();
      const drizzlePostgresDB = drizzle({ client: pglitePostgresDB, schema: { superusers } });
      const queryToTest = testType === 'independent combinators' ? convertToIC(query) : query;
      const where = formatQuery(queryToTest, { ...fqOptions, format: 'drizzle' });
      const result = await drizzlePostgresDB.query.superusers.findMany({ where });
      expect(result).toEqual(expectedResult);
    });
  };

  beforeAll(async () => {
    const pglitePostgresDB = await createSchema(schemaName);
    await pglitePostgresDB.exec(dbSetup('postgres', { schema: schemaName }));
  });

  afterAll(async () => {
    await dropSchema(schemaName);
  });

  // Test for coverage
  test('undefined column', async () => {
    const pglitePostgresDB = await getSharedPGlite();
    const drizzlePostgresDB = drizzle({ client: pglitePostgresDB, schema: { superusers } });
    const where = formatQuery(
      { combinator: 'and', rules: [{ field: 'doesNotExist', operator: '=', value: '' }] },
      { format: 'drizzle' }
    );
    const result = await drizzlePostgresDB.query.superusers.findMany({ where });
    expect(result).toEqual(superUsersPostgres);
  });

  // Common tests
  for (const [name, t] of Object.entries(dbTestsDrizzle(superUsersPostgres))) {
    describe(name, () => {
      testPostgres(t);
    });
  }
});

describe('Drizzle nested array queries (PostgreSQL)', () => {
  const schemaName = reserveSchema('drizzle_pg_aug');
  const augmentedsuperusers = pgSchema(schemaName).table(
    'augmentedsuperusers',
    columnsPostgresAugmented
  );
  const augmentedSuperUsersPostgres = augmentedSuperUsers('postgres');

  const testPostgresAugmented = ({ query, expectedResult, fqOptions }: TestSQLParams) => {
    test.each(['standard', 'independent combinators'])('%s', async testType => {
      const pglitePostgresDBaugmented = await getSharedPGlite();
      const drizzlePostgresDBaugmented = drizzle({
        client: pglitePostgresDBaugmented,
        schema: { augmentedsuperusers },
      });
      const queryToTest = testType === 'independent combinators' ? convertToIC(query) : query;
      const where = formatQuery(queryToTest, {
        ...fqOptions,
        format: 'drizzle',
        preset: 'postgresql',
      });
      const result = drizzlePostgresDBaugmented.query.augmentedsuperusers.findMany({
        where,
        orderBy: columns => columns.madeUpName,
      });
      expect(await result).toEqual(
        expectedResult.map(u =>
          Object.fromEntries(Object.entries(u).filter(([k]) => !k.startsWith('early')))
        )
      );
    });
  };

  beforeAll(async () => {
    const pglitePostgresDBaugmented = await createSchema(schemaName);
    await pglitePostgresDBaugmented.exec(
      dbSetup('postgres', {
        includeNestedArrays: true,
        tableName: 'augmentedsuperusers',
        schema: schemaName,
      })
    );
  });

  afterAll(async () => {
    await dropSchema(schemaName);
  });

  describe('strings', () => {
    for (const [name, mm, fn] of matchModeTests.strings) {
      describe(name, () => {
        testPostgresAugmented({
          query: genStringsMatchQuery(mm),
          expectedResult: augmentedSuperUsersPostgres.filter(u => fn(u)),
        });
      });
    }
  });
});
