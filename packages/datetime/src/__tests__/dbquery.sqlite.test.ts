import { formatQuery } from '@react-querybuilder/core';
import type { SQLQueryBindings } from 'bun:sqlite';
import { Database } from 'bun:sqlite';
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
  birthdate: string;
  created_at: string;
  updated_at: string;
};

const db = new Database(import.meta.dir + '/dbquery.sqlite.cache_db');

beforeAll(() => {
  if (db.query(FIND_MUSICIANS_TABLE('sqlite')).all().length === 0) {
    db.run(CREATE_MUSICIANS_TABLE('sqlite'));
  }

  if (db.query(`SELECT * FROM musicians`).all().length === 0) {
    db.run(INSERT_MUSICIANS('sqlite'));
  }
});

afterAll(() => {
  db.close();
});

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    for (const [testCaseName, testCase] of Object.entries(testCases)) {
      test(testCaseName, async () => {
        const sql = formatQuery(testCase[0], {
          preset: 'sqlite',
          fields,
          ruleProcessor: getDatetimeRuleProcessorSQL(apiFns),
        });
        const result = db.prepare<Result, SQLQueryBindings[]>(`${sqlBase} ${sql}`).all();
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
