import { formatQuery } from '@react-querybuilder/core';
import {
  createMSSQLSchema,
  dropMSSQLSchema,
  mssqlEnabled,
  mssqlQuery,
  reserveSchema,
} from '@rqb-dbpool';
import {
  CREATE_PRODUCTS_TABLE,
  fields,
  INSERT_PRODUCTS,
  sqlBase,
  sqlOrderBy,
  testCases,
} from '../dbqueryTestUtils';
import { expressionRuleProcessorParameterized, expressionRuleProcessorSQL } from '../index';

// CI-only (DBIntegration job): skipped unless RQB_MSSQL_URL is set.
const schemaName = reserveSchema('expr_mssql');
const productsTable = `[${schemaName}].products`;

describe.skipIf(!mssqlEnabled)('MSSQL', () => {
  beforeAll(async () => {
    await createMSSQLSchema(schemaName);
    await mssqlQuery(CREATE_PRODUCTS_TABLE('mssql', productsTable));
    await mssqlQuery(INSERT_PRODUCTS(productsTable));
  }, 60_000);

  afterAll(async () => {
    await dropMSSQLSchema(schemaName);
  });

  for (const [testCaseName, [query, expectedIds]] of Object.entries(testCases)) {
    describe(testCaseName, () => {
      test('sql', async () => {
        const sqlStr = formatQuery(query, {
          preset: 'mssql',
          fields,
          ruleProcessor: expressionRuleProcessorSQL,
        });
        const rows = await mssqlQuery<{ id: number }>(
          `${sqlBase(productsTable)} ${sqlStr} ${sqlOrderBy}`
        );
        expect(rows.map(r => r.id)).toEqual(expectedIds);
      });

      for (const format of ['parameterized', 'parameterized_named'] as const) {
        test(format, async () => {
          const { sql, params } = formatQuery(query, {
            format: format as 'parameterized', // named result shape differs only in `params`
            preset: 'mssql',
            fields,
            ruleProcessor: expressionRuleProcessorParameterized,
          });
          const rows = await mssqlQuery<{ id: number }>(
            `${sqlBase(productsTable)} ${sql} ${sqlOrderBy}`,
            params
          );
          expect(rows.map(r => r.id)).toEqual(expectedIds);
        });
      }
    });
  }
});
