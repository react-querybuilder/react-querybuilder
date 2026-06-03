/* @vitest-environment node */
// oxlint-disable jest/expect-expect

import { Database } from 'bun:sqlite';
import { formatQuery } from '@react-querybuilder/core';
import { getOperators } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import {
  CREATE_MUSICIANS_TABLE,
  dateLibraryFunctions,
  fields,
  musicians,
  testCases,
} from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorDrizzle } from '../getDatetimeRuleProcessorDrizzle';

const bunSQLiteDB = new Database();

// Store datetimes as integer (unix timestamp) columns so the `Date` objects the
// processor emits compare numerically and correctly.
const musiciansTable = sqliteTable('musicians', {
  first_name: text().notNull(),
  middle_name: text(),
  last_name: text().notNull(),
  birthdate: integer({ mode: 'timestamp' }).notNull(),
  created_at: integer({ mode: 'timestamp' }).notNull(),
  updated_at: integer({ mode: 'timestamp' }).notNull(),
});

const drizzleDB = drizzle({ schema: { musicians: musiciansTable }, client: bunSQLiteDB });

const now = new Date();

beforeAll(async () => {
  bunSQLiteDB.run(
    CREATE_MUSICIANS_TABLE('sqlite').replace(/\bbirthdate text\b/i, 'birthdate integer')
  );
  await drizzleDB
    .insert(musiciansTable)
    .values(
      musicians.map(m => ({
        first_name: m.first_name,
        middle_name: m.middle_name ?? null,
        last_name: m.last_name,
        birthdate: new Date(m.birthdate),
        created_at: now,
        updated_at: now,
      }))
    );
});

afterAll(() => {
  bunSQLiteDB.close();
});

const assertResult = (result: { last_name: string }[], expectation: string) => {
  if (expectation === 'all') {
    expect(result).toHaveLength(musicians.length);
  } else {
    expect(result).toHaveLength(1);
    expect(result[0].last_name).toBe(expectation);
  }
};

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    for (const [testCaseName, [query, expectation]] of Object.entries(testCases)) {
      const where = formatQuery(query, {
        format: 'drizzle',
        fields,
        ruleProcessor: getDatetimeRuleProcessorDrizzle(apiFns),
      });

      test(`${testCaseName} (relational queries)`, async () => {
        const result = await drizzleDB.query.musicians.findMany({ where });
        assertResult(result, expectation);
      });

      test(`${testCaseName} (query builder)`, async () => {
        const result = await drizzleDB
          .select()
          .from(musiciansTable)
          .where(where(musiciansTable, getOperators()));
        assertResult(result, expectation);
      });
    }
  });
}
