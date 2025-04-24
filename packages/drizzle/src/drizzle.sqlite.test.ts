/* @jest-environment node */

import { Database } from 'bun:sqlite';
import type { SQL } from 'drizzle-orm';
import { drizzle as drizzleSQLite } from 'drizzle-orm/bun-sqlite';
import { integer as sqliteInt, sqliteTable, text as sqliteText } from 'drizzle-orm/sqlite-core';
import { formatQuery } from 'react-querybuilder';
import type { TestSQLParams } from '../../react-querybuilder/src/utils/formatQuery/dbqueryTestUtils';
import {
  dbSetup,
  dbTests,
  superUsers,
} from '../../react-querybuilder/src/utils/formatQuery/dbqueryTestUtils';
import { generateDrizzleRuleGroupProcessor } from './generateDrizzleRuleGroupProcessor';

const bunSQLiteDB = new Database();
const drizzleSQLiteDB = drizzleSQLite(bunSQLiteDB);

const columnsSQLite = {
  firstName: sqliteText().notNull(),
  lastName: sqliteText().notNull(),
  enhanced: sqliteInt({ mode: 'number' }).notNull(),
  madeUpName: sqliteText().notNull(),
  powerUpAge: sqliteInt({ mode: 'number' }),
};

const tableSQLite = sqliteTable('superusers', columnsSQLite);

const superUsersSQLite = superUsers('sqlite');

const testSQLite = ({ query, expectedResult, fqOptions }: TestSQLParams) => {
  test('sql', () => {
    const sql = formatQuery(query, {
      ...fqOptions,
      ruleGroupProcessor: generateDrizzleRuleGroupProcessor(tableSQLite),
    });
    expect(sql).toBeTruthy();
    const result = drizzleSQLiteDB
      .select()
      .from(tableSQLite)
      .where(sql as SQL)
      .all();
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
  for (const [name, t] of Object.entries(dbTests(superUsersSQLite))) {
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
