/* @jest-environment node */

import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { convertToIC, formatQuery } from 'react-querybuilder';
import type { TestSQLParams } from './drizzleTestUtils';
import { dbSetup, dbTestsDrizzle, superUsers } from './drizzleTestUtils';
import { generateDrizzleRuleGroupProcessor } from './generateDrizzleRuleGroupProcessor';

const columnsSQLite = {
  firstName: text().notNull(),
  lastName: text().notNull(),
  enhanced: integer().notNull(),
  madeUpName: text().notNull(),
  nickname: text().notNull(),
  powerUpAge: integer(),
};

const tableSQLite = sqliteTable('superusers', columnsSQLite);
const superusers = superUsers('sqlite');

const bunSQLiteDB = new Database();
const drizzleSQLiteDB = drizzle({ client: bunSQLiteDB, schema: { superusers } });

const testSQLite = ({ query, expectedResult, fqOptions }: TestSQLParams) => {
  test.each(['standard', 'independent combinators'])('%s', async testType => {
    const queryToTest = testType === 'independent combinators' ? convertToIC(query) : query;
    const sql = formatQuery(queryToTest, {
      ...fqOptions,
      ruleGroupProcessor: generateDrizzleRuleGroupProcessor(tableSQLite),
    });
    const q = drizzleSQLiteDB.select().from(tableSQLite).where(sql);
    const result = q.all();
    expect(result).toEqual(expectedResult);
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
  for (const [name, t] of Object.entries(dbTestsDrizzle(superusers))) {
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
        expectedResult: superusers.filter(u => u.enhanced),
        fqOptions: { quoteFieldNamesWith: q },
      });
    });
  }
});
