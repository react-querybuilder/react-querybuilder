/* @jest-environment node */

import { PGlite } from '@electric-sql/pglite';
import { boolean, integer, pgTable, text } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/pglite';
import { convertToIC, formatQuery } from 'react-querybuilder';
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
const columnsPostgresAugmented = {
  ...columnsPostgres,
  nicknames: text().array(),
};

describe('Drizzle relational queries (PostgreSQL)', () => {
  const superusers = pgTable('superusers', columnsPostgres);
  const superUsersPostgres = superUsers('postgres');

  const pglitePostgresDB = new PGlite();
  const drizzlePostgresDB = drizzle({
    client: pglitePostgresDB,
    schema: { superusers },
  });

  const testPostgres = ({ query, expectedResult, fqOptions }: TestSQLParams) => {
    test.each(['standard', 'independent combinators'])('%s', async testType => {
      const queryToTest = testType === 'independent combinators' ? convertToIC(query) : query;
      const where = formatQuery(queryToTest, { ...fqOptions, format: 'drizzle' });
      const result = await drizzlePostgresDB.query.superusers.findMany({ where });
      expect(result).toEqual(expectedResult);
    });
  };

  beforeAll(async () => {
    await pglitePostgresDB.exec(dbSetup('postgres'));
  });

  afterAll(() => {
    pglitePostgresDB.close();
  });

  // Test for coverage
  test('undefined column', async () => {
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
  const augmentedsuperusers = pgTable('augmentedsuperusers', columnsPostgresAugmented);
  const augmentedSuperUsersPostgres = augmentedSuperUsers('postgres');

  const pglitePostgresDBaugmented = new PGlite();
  const drizzlePostgresDBaugmented = drizzle({
    client: pglitePostgresDBaugmented,
    schema: { augmentedsuperusers },
  });

  const testPostgresAugmented = ({ query, expectedResult, fqOptions }: TestSQLParams) => {
    test.each(['standard', 'independent combinators'])('%s', async testType => {
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
    await pglitePostgresDBaugmented.exec(
      dbSetup('postgres', { includeNestedArrays: true, tableName: 'augmentedsuperusers' })
    );
  });

  afterAll(() => {
    pglitePostgresDBaugmented.close();
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
