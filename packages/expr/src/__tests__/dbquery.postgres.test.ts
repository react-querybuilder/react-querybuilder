/* @vitest-environment node */

// Runs under `bun test`; the directive only matters if executed via Vitest directly.

import { PGlite } from '@electric-sql/pglite';
import { formatQuery } from '@react-querybuilder/core';
import {
  CREATE_PRODUCTS_TABLE,
  fields,
  FIND_PRODUCTS_TABLE,
  INSERT_PRODUCTS,
  sqlBase,
  sqlOrderBy,
  testCases,
} from '../dbqueryTestUtils';
import { expressionRuleProcessorParameterized, expressionRuleProcessorSQL } from '../index';

const db = new PGlite();

beforeAll(async () => {
  if ((await db.query(FIND_PRODUCTS_TABLE('postgresql'))).rows.length === 0) {
    await db.exec(CREATE_PRODUCTS_TABLE('postgresql'));
    await db.exec(INSERT_PRODUCTS());
  }
}, 10_000);

afterAll(async () => {
  await db.close();
});

for (const [testCaseName, [query, expectedIds]] of Object.entries(testCases)) {
  describe(testCaseName, () => {
    test('sql', async () => {
      const sql = formatQuery(query, {
        preset: 'postgresql',
        fields,
        ruleProcessor: expressionRuleProcessorSQL,
      });
      const { rows } = await db.query<{ id: number }>(`${sqlBase} ${sql} ${sqlOrderBy}`);
      expect(rows.map(r => r.id)).toEqual(expectedIds);
    });

    // PostgreSQL only supports positional ($N) params, not named.
    test('parameterized', async () => {
      const { sql, params } = formatQuery(query, {
        format: 'parameterized',
        preset: 'postgresql',
        fields,
        ruleProcessor: expressionRuleProcessorParameterized,
      });
      const { rows } = await db.query<{ id: number }>(`${sqlBase} ${sql} ${sqlOrderBy}`, params);
      expect(rows.map(r => r.id)).toEqual(expectedIds);
    });
  });
}
