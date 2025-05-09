/* @jest-environment node */

import { PGlite } from '@electric-sql/pglite';
import { boolean, integer, pgTable, text } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/pglite';
import { convertToIC, formatQuery } from 'react-querybuilder';
import type { TestSQLParams } from './dbqueryTestUtils';
import { dbSetup, superUsers } from './dbqueryTestUtils';
import { dbTestsDrizzle } from './dbqueryDrizzleTestUtils';

const columnsPostgres = {
  firstName: text().notNull(),
  lastName: text().notNull(),
  enhanced: boolean().notNull(),
  madeUpName: text().notNull(),
  nickname: text().notNull(),
  powerUpAge: integer(),
};

const superusers = pgTable('superusers', columnsPostgres);
const superUsersPostgres = superUsers('postgres');

const pglitePostgresDB = new PGlite();
const drizzlePostgresDB = drizzle({ client: pglitePostgresDB, schema: { superusers } });

const testPostgres = ({ query, expectedResult, fqOptions }: TestSQLParams) => {
  test.each(['standard', 'independent combinators'])('%s', async testType => {
    const queryToTest = testType === 'independent combinators' ? convertToIC(query) : query;
    const where = formatQuery(queryToTest, { ...fqOptions, format: 'drizzle' });
    const result = await drizzlePostgresDB.query.superusers.findMany({ where });
    expect(result).toEqual(expectedResult);
  });
};

describe('Drizzle relational queries (PostgreSQL)', () => {
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
