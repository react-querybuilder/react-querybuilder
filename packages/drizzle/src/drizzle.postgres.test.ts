/* @jest-environment node */

import { PGlite } from '@electric-sql/pglite';
import type { SQL } from 'drizzle-orm';
import {
  boolean as pgBoolean,
  integer as pgInt,
  pgTable,
  text as pgText,
} from 'drizzle-orm/pg-core';
import { drizzle as drizzlePostgres } from 'drizzle-orm/pglite';
import { formatQuery } from 'react-querybuilder';
import type { TestSQLParams } from '../../react-querybuilder/src/utils/formatQuery/dbqueryTestUtils';
import {
  dbSetup,
  dbTests,
  superUsers,
} from '../../react-querybuilder/src/utils/formatQuery/dbqueryTestUtils';
import { generateDrizzleRuleGroupProcessor } from './generateDrizzleRuleGroupProcessor';

const pglitePostgresDB = new PGlite();
const drizzlePostgresDB = drizzlePostgres({ client: pglitePostgresDB });

const columnsPostgres = {
  firstName: pgText().notNull(),
  lastName: pgText().notNull(),
  enhanced: pgBoolean().notNull(),
  madeUpName: pgText().notNull(),
  powerUpAge: pgInt(),
};

const tablePostgres = pgTable('superusers', columnsPostgres);

const superUsersPostgres = superUsers('postgres');

const testPostgres = ({ query, expectedResult, fqOptions }: TestSQLParams) => {
  test('sql', async () => {
    const sql = formatQuery(query, {
      ...fqOptions,
      ruleGroupProcessor: generateDrizzleRuleGroupProcessor(tablePostgres),
    });
    expect(sql).toBeTruthy();
    const result = await drizzlePostgresDB
      .select()
      .from(tablePostgres)
      .where(sql as SQL);
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

  // Common tests
  for (const [name, t] of Object.entries(dbTests(superUsersPostgres))) {
    describe(name, () => {
      testPostgres(t);
    });
  }
});
