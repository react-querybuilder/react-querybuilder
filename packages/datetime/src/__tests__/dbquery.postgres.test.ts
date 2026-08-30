/* @vitest-environment node */

import { formatQuery } from '@react-querybuilder/core';
import { createSchema, dropSchema, getSharedSQL, reserveSchema } from '@rqb-dbpool';
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
        const sql = await getSharedSQL();
        const sqlStr = formatQuery(query, {
          preset: 'postgresql',
          fields,
          ruleProcessor: getDatetimeRuleProcessorSQL(apiFns),
        });
        const result = await sql.unsafe<Result[]>(`${sqlBase(musiciansTable)} ${sqlStr}`);
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
