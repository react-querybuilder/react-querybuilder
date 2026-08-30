import { SQL } from 'bun';
import { formatQuery } from '@react-querybuilder/core';
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
  birthdate: string;
  created_at: string;
  updated_at: string;
};

const sql = new SQL({ adapter: 'sqlite', filename: ':memory:' });

beforeAll(async () => {
  await sql.unsafe(CREATE_MUSICIANS_TABLE('sqlite'));
  await sql.unsafe(INSERT_MUSICIANS('sqlite'));
});

afterAll(async () => {
  await sql.close();
});

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    for (const [testCaseName, testCase] of Object.entries(testCases)) {
      test(testCaseName, async () => {
        const sqlStr = formatQuery(testCase[0], {
          preset: 'sqlite',
          fields,
          ruleProcessor: getDatetimeRuleProcessorSQL(apiFns),
        });
        const result = await sql.unsafe<Result[]>(`${sqlBase()} ${sqlStr}`);
        // oxlint-disable no-conditional-expect
        if (testCase[1] === 'all') {
          expect(result).toHaveLength(musicians.length);
        } else {
          expect(result).toHaveLength(1);
          expect(result[0].last_name).toBe(testCase[1]);
        }
        // oxlint-enable no-conditional-expect
      });
    }
  });
}
