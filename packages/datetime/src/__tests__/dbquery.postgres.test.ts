/* @jest-environment node */

/* eslint-disable unicorn/no-await-expression-member */
import { PGlite } from '@electric-sql/pglite';
import { formatQuery } from 'react-querybuilder';
import { getDatetimeRuleProcessorSQL } from '../getDatetimeRuleProcessorSQL';
import {
  CREATE_MUSICIANS_TABLE,
  dateLibraryFunctions,
  fields,
  FIND_MUSICIANS_TABLE,
  INSERT_MUSICIANS,
  musicians,
  sqlBase,
  testCases,
} from '../dbqueryTestUtils';

type Result = {
  first_name: string;
  middle_name: string;
  last_name: string;
  birthdate: Date;
  created_at: Date;
  updated_at: Date;
};

const db = new PGlite(import.meta.dir + '/dbquery.postgresql.cache_db');
// To run this file with Jest, use something like this:
// > NODE_OPTIONS="$NODE_OPTIONS --experimental-vm-modules" npx jest
// and use an in-memory database instead of the cached one:
// const db = new PGlite();

beforeAll(async () => {
  if ((await db.query(FIND_MUSICIANS_TABLE('postgresql'))).rows.length === 0) {
    await db.exec(CREATE_MUSICIANS_TABLE('postgresql'));
  }

  if ((await db.query(`SELECT * FROM musicians`)).rows.length === 0) {
    await db.exec(INSERT_MUSICIANS('postgresql'));
  }
});

afterAll(async () => {
  await db.close();
});

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    for (const [testCaseName, [query, expectation]] of Object.entries(testCases)) {
      test(testCaseName, async () => {
        const sql = formatQuery(query, {
          preset: 'postgresql',
          fields,
          ruleProcessor: getDatetimeRuleProcessorSQL(apiFns),
        });
        const { rows: result } = await db.query<Result>(`${sqlBase} ${sql}`);
        if (expectation === 'all') {
          expect(result).toHaveLength(musicians.length);
        } else {
          expect(result[0].last_name).toBe(expectation);
        }
      });
    }
  });
}
