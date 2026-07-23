/* @vitest-environment node */

// Runs under `bun test`; the directive only matters if executed via Vitest directly.

import { formatQuery } from '@react-querybuilder/core';
import { createSchema, dropSchema, getSharedPGlite, reserveSchema } from '@rqb-dbpool';
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
      const db = await getSharedPGlite();
      const sql = formatQuery(query, {
        preset: 'postgresql',
        fields,
        ruleProcessor: expressionRuleProcessorSQL,
      });
      const { rows } = await db.query<{ id: number }>(
        `${sqlBase(productsTable)} ${sql} ${sqlOrderBy}`
      );
      expect(rows.map(r => r.id)).toEqual(expectedIds);
    });

    // PostgreSQL only supports positional ($N) params, not named.
    test('parameterized', async () => {
      const db = await getSharedPGlite();
      const { sql, params } = formatQuery(query, {
        format: 'parameterized',
        preset: 'postgresql',
        fields,
        ruleProcessor: expressionRuleProcessorParameterized,
      });
      const { rows } = await db.query<{ id: number }>(
        `${sqlBase(productsTable)} ${sql} ${sqlOrderBy}`,
        params
      );
      expect(rows.map(r => r.id)).toEqual(expectedIds);
    });
  });
}
