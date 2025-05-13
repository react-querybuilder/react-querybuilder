/* @jest-environment node */

import { Database } from 'bun:sqlite';
import { getOperators } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { convertToIC, formatQuery } from 'react-querybuilder';
import { dbTestsDrizzle } from '../dbqueryDrizzleTestUtils';
import type { TestSQLParams } from '../dbqueryTestUtils';
import { dbSetup, superUsers } from '../dbqueryTestUtils';

const bunSQLiteDB = new Database();

const columnsSQLite = {
  firstName: text().notNull(),
  lastName: text().notNull(),
  enhanced: integer().notNull(),
  madeUpName: text().notNull(),
  nickname: text().notNull(),
  powerUpAge: integer(),
};

const superusers = sqliteTable('superusers', columnsSQLite);

const drizzleSQLiteDB = drizzle({ schema: { superusers }, client: bunSQLiteDB });

const superUsersSQLite = superUsers('sqlite');

const testSQLite = ({ query, expectedResult, fqOptions }: TestSQLParams) => {
  describe.each(['standard', 'independent combinators'])('%s', async testType => {
    const queryToTest = testType === 'independent combinators' ? convertToIC(query) : query;
    const where = formatQuery(queryToTest, { ...fqOptions, format: 'drizzle' });
    test('relational queries', async () => {
      const resultRQ = await drizzleSQLiteDB.query.superusers.findMany({ where });
      expect(resultRQ).toEqual(expectedResult);
    });
    test('query builder', async () => {
      const resultQB = await drizzleSQLiteDB
        .select()
        .from(superusers)
        .where(where(superusers, getOperators()));
      expect(resultQB).toEqual(expectedResult);
    });
  });
};

describe('Drizzle (SQLite)', () => {
  beforeAll(() => {
    bunSQLiteDB.run(dbSetup('sqlite'));
  });

  afterAll(() => {
    bunSQLiteDB.close();
  });

  // Common tests
  for (const [name, t] of Object.entries(dbTestsDrizzle(superUsersSQLite))) {
    describe(name, () => {
      testSQLite(t);
    });
  }
});
