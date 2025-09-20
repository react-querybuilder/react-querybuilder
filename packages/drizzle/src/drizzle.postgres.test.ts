/* @jest-environment node */

import { PGlite } from '@electric-sql/pglite';
import { convertToIC, formatQuery } from '@react-querybuilder/core';
import { boolean, integer, pgTable, text } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/pglite';
import type { TestSQLParams } from './drizzleTestUtils';
import { dbSetup, dbTestsDrizzle, superUsers } from './drizzleTestUtils';
import { generateDrizzleRuleGroupProcessor } from './generateDrizzleRuleGroupProcessor';

const columnsPostgres = {
  firstName: text().notNull(),
  lastName: text().notNull(),
  enhanced: boolean().notNull(),
  madeUpName: text().notNull(),
  nickname: text().notNull(),
  powerUpAge: integer(),
};

const tablePostgres = pgTable('superusers', columnsPostgres);
const superusers = superUsers('postgres');

const pglitePostgresDB = new PGlite();
const drizzlePostgresDB = drizzle({ client: pglitePostgresDB, schema: { superusers } });

const testPostgres = ({ query, expectedResult, fqOptions }: TestSQLParams) => {
  test.each(['standard', 'independent combinators'])('%s', async testType => {
    const queryToTest = testType === 'independent combinators' ? convertToIC(query) : query;
    const sql = formatQuery(queryToTest, {
      ...fqOptions,
      ruleGroupProcessor: generateDrizzleRuleGroupProcessor(tablePostgres),
    });
    const result = await drizzlePostgresDB.select().from(tablePostgres).where(sql);
    expect(result).toEqual(expectedResult);
  });
};

describe('Drizzle (PostgreSQL)', () => {
  beforeAll(async () => {
    await pglitePostgresDB.exec(dbSetup('postgres'));
  });

  afterAll(() => {
    pglitePostgresDB.close();
  });

  // Test for coverage
  test('undefined column', async () => {
    const sql = formatQuery(
      { combinator: 'and', rules: [{ field: 'doesNotExist', operator: '=', value: '' }] },
      { ruleGroupProcessor: generateDrizzleRuleGroupProcessor(tablePostgres) }
    );
    const result = await drizzlePostgresDB.select().from(tablePostgres).where(sql);
    expect(result).toEqual(superusers);
  });

  // Common tests
  for (const [name, t] of Object.entries(dbTestsDrizzle(superusers))) {
    describe(name, () => {
      testPostgres(t);
    });
  }
});
