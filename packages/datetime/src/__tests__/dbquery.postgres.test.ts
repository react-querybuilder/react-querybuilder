/* @jest-environment node */

// To run this file with Jest instead of Bun:
// > NODE_OPTIONS="$NODE_OPTIONS --experimental-vm-modules" npx jest

import { PGlite } from '@electric-sql/pglite';
import { formatQuery } from 'react-querybuilder';
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
import { getDatetimeRuleProcessorSQL } from '../getDatetimeRuleProcessorSQL';

type Result = {
  first_name: string;
  middle_name: string;
  last_name: string;
  birthdate: Date;
  created_at: Date;
  updated_at: Date;
};

const db = new PGlite();

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
        // oxlint-disable no-conditional-expect
        if (expectation === 'all') {
          expect(result).toHaveLength(musicians.length);
        } else {
          expect(result).toHaveLength(1);
          expect(result[0].last_name).toBe(expectation);
        }
        // oxlint-enable no-conditional-expect
      });
    }
  });
}
