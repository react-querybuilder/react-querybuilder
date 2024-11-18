/* eslint-disable unicorn/no-await-expression-member */
import { PGlite } from '@electric-sql/pglite';
import {
  CREATE_MUSICIANS_TABLE,
  fields,
  FIND_MUSICIANS_TABLE,
  formatQueryDateTime,
  INSERT_MUSICIANS,
  sqlBase,
  testCases,
  musicians,
} from './dbqueryTestUtils';

type Result = {
  first_name: string;
  middle_name: string;
  last_name: string;
  birthdate: Date;
  created_at: Date;
  updated_at: Date;
};

const db = new PGlite(import.meta.dir + '/dbquery.postgresql.cache_db');

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

for (const [testCaseName, testCase] of Object.entries(testCases)) {
  test(testCaseName, async () => {
    const sql = formatQueryDateTime(testCase[0], { preset: 'sqlite', fields });
    const { rows: result } = await db.query<Result>(`${sqlBase} ${sql}`);
    if (testCase[1] === 'all') {
      expect(result).toHaveLength(musicians.length);
    } else {
      expect(result[0].last_name).toBe(testCase[1]);
    }
  });
}
