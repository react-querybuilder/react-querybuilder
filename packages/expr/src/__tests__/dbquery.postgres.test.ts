/* @vitest-environment node */

// Runs under `bun test`; the directive only matters if executed via Vitest directly.

import { formatQuery } from '@react-querybuilder/core';
import { createSchema, dropSchema, getSharedSQL, reserveSchema } from '@rqb-dbpool';
import {
  CREATE_PRODUCTS_TABLE,
  fields,
  INSERT_PRODUCTS,
  sqlBase,
  sqlOrderBy,
  testCases,
} from '../dbqueryTestUtils';
import { expressionRuleProcessorParameterized, expressionRuleProcessorSQL } from '../index';

const schemaName = reserveSchema('expr_pg');
const productsTable = `"${schemaName}".products`;

beforeAll(async () => {
  const db = await createSchema(schemaName);
  await db.exec(CREATE_PRODUCTS_TABLE('postgresql', productsTable));
  await db.exec(INSERT_PRODUCTS(productsTable));
}, 10_000);

afterAll(async () => {
  await dropSchema(schemaName);
});

for (const [testCaseName, [query, expectedIds]] of Object.entries(testCases)) {
  describe(testCaseName, () => {
    test('sql', async () => {
      const sql = await getSharedSQL();
      const sqlStr = formatQuery(query, {
        preset: 'postgresql',
        fields,
        ruleProcessor: expressionRuleProcessorSQL,
      });
      const rows = (await sql.unsafe(`${sqlBase(productsTable)} ${sqlStr} ${sqlOrderBy}`)) as {
        id: number;
      }[];
      expect(rows.map(r => r.id)).toEqual(expectedIds);
    });

    // PostgreSQL only supports positional ($N) params, not named.
    test('parameterized', async () => {
      const sql = await getSharedSQL();
      const { sql: sqlStr, params } = formatQuery(query, {
        format: 'parameterized',
        preset: 'postgresql',
        fields,
        ruleProcessor: expressionRuleProcessorParameterized,
      });
      const rows = (await sql.unsafe(
        `${sqlBase(productsTable)} ${sqlStr} ${sqlOrderBy}`,
        params
      )) as { id: number }[];
      expect(rows.map(r => r.id)).toEqual(expectedIds);
    });
  });
}
