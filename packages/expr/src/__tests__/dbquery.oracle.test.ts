import { formatQuery } from '@react-querybuilder/core';
import {
  createOracleUser,
  dropOracleUser,
  oracleEnabled,
  oracleExecMany,
  oracleQuery,
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

// CI-only (DBIntegration job): skipped unless RQB_ORACLE_URL + RQB_ORACLE_ADMIN_URL are set.
// Unquoted columns fold to upper case, hence `ID`.
const schemaName = reserveSchema('expr_ora').toUpperCase();
const productsTable = `"${schemaName}".products`;

describe.skipIf(!oracleEnabled)('Oracle', () => {
  beforeAll(async () => {
    await createOracleUser(schemaName);
    await oracleExecMany([
      CREATE_PRODUCTS_TABLE('oracle', productsTable),
      ...INSERT_PRODUCTS(productsTable).split(';'),
    ]);
  }, 60_000);

  afterAll(async () => {
    await dropOracleUser(schemaName);
  });

  for (const [testCaseName, [query, expectedIds]] of Object.entries(testCases)) {
    describe(testCaseName, () => {
      test('sql', async () => {
        const sqlStr = formatQuery(query, {
          preset: 'oracle',
          fields,
          ruleProcessor: expressionRuleProcessorSQL,
        });
        const rows = await oracleQuery<{ ID: number }>(
          `${sqlBase(productsTable)} ${sqlStr} ${sqlOrderBy}`
        );
        expect(rows.map(r => r.ID)).toEqual(expectedIds);
      });

      for (const format of ['parameterized', 'parameterized_named'] as const) {
        test(format, async () => {
          const { sql, params } = formatQuery(query, {
            format: format as 'parameterized', // named result shape differs only in `params`
            preset: 'oracle',
            fields,
            ruleProcessor: expressionRuleProcessorParameterized,
          });
          const rows = await oracleQuery<{ ID: number }>(
            `${sqlBase(productsTable)} ${sql} ${sqlOrderBy}`,
            params
          );
          expect(rows.map(r => r.ID)).toEqual(expectedIds);
        });
      }
    });
  }
});
