/* @vitest-environment node */

// To run this file with Jest instead of Bun:
// > NODE_OPTIONS="$NODE_OPTIONS --experimental-vm-modules" npx jest

import { formatQuery } from '@react-querybuilder/core';
import { createSchema, dropSchema, getSharedPGlite, reserveSchema } from '@rqb-dbpool';
import {
  CREATE_MUSICIANS_TABLE,
  dateLibraryFunctions,
  fields,
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

const schemaName = reserveSchema('dt_pg');
const musiciansTable = `"${schemaName}".musicians`;

beforeAll(async () => {
  const db = await createSchema(schemaName);
  await db.exec(CREATE_MUSICIANS_TABLE('postgresql', musiciansTable));
  await db.exec(INSERT_MUSICIANS('postgresql', musiciansTable));
}, 10_000);

afterAll(async () => {
  await dropSchema(schemaName);
});

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    for (const [testCaseName, [query, expectation]] of Object.entries(testCases)) {
      test(testCaseName, async () => {
        const db = await getSharedPGlite();
        const sql = formatQuery(query, {
          preset: 'postgresql',
          fields,
          ruleProcessor: getDatetimeRuleProcessorSQL(apiFns),
        });
        const { rows: result } = await db.query<Result>(`${sqlBase(musiciansTable)} ${sql}`);
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
