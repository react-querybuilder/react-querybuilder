/* @jest-environment node */

import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { convertToIC, formatQuery } from 'react-querybuilder';
import type { TestSQLParams } from './dbqueryTestUtils';
import { dbSetup, superUsers } from './dbqueryTestUtils';
import { dbTestsDrizzle } from './dbqueryDrizzleTestUtils';

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
  test.each(['standard', 'independent combinators'])('%s', async testType => {
    const queryToTest = testType === 'independent combinators' ? convertToIC(query) : query;
    const where = formatQuery(queryToTest, { ...fqOptions, format: 'drizzle' });
    const result = await drizzleSQLiteDB.query.superusers.findMany({ where });
    expect(result).toEqual(expectedResult);
  });
};

describe('Drizzle relational queries (SQLite)', () => {
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

  // SQLite-specific tests
  for (const q of ['"', '`', ['[', ']']] satisfies (string | [string, string])[]) {
    describe(`quote ${q[0]}fieldNames${q[1] ?? q[0]}`, () => {
      testSQLite({
        query: {
          combinator: 'and',
          rules: [
            { field: 'enhanced', operator: '>', value: 0 },
            { field: 'enhanced', operator: '>', value: '0' },
          ],
        },
        expectedResult: superUsersSQLite.filter(u => u.enhanced),
        fqOptions: { quoteFieldNamesWith: q },
      });
    });
  }
});
