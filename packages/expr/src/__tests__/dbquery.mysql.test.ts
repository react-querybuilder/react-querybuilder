import { formatQuery } from '@react-querybuilder/core';
import {
  createMariaDBSchema,
  createMySQLSchema,
  dropMariaDBSchema,
  dropMySQLSchema,
  mariadbEnabled,
  mariadbExecMany,
  mariadbQuery,
  mysqlEnabled,
  mysqlExecMany,
  mysqlQuery,
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

// CI-only (DBIntegration job): MySQL/MariaDB blocks skip unless RQB_MYSQL_URL/RQB_MARIADB_URL
// are set.
const targets = [
  {
    name: 'MySQL',
    enabled: mysqlEnabled,
    label: 'expr_mysql',
    query: mysqlQuery,
    execMany: mysqlExecMany,
    createSchema: createMySQLSchema,
    dropSchema: dropMySQLSchema,
  },
  {
    name: 'MariaDB',
    enabled: mariadbEnabled,
    label: 'expr_mariadb',
    query: mariadbQuery,
    execMany: mariadbExecMany,
    createSchema: createMariaDBSchema,
    dropSchema: dropMariaDBSchema,
  },
];

for (const t of targets) {
  const schemaName = reserveSchema(t.label);
  const productsTable = `\`${schemaName}\`.products`;

  describe.skipIf(!t.enabled)(t.name, () => {
    beforeAll(async () => {
      await t.createSchema(schemaName);
      await t.query(CREATE_PRODUCTS_TABLE('mysql', productsTable));
      await t.execMany(INSERT_PRODUCTS(productsTable));
    }, 60_000);

    afterAll(async () => {
      await t.dropSchema(schemaName);
    });

    for (const [testCaseName, [query, expectedIds]] of Object.entries(testCases)) {
      describe(testCaseName, () => {
        test('sql', async () => {
          const sqlStr = formatQuery(query, {
            preset: 'mysql',
            fields,
            ruleProcessor: expressionRuleProcessorSQL,
          });
          const rows = await t.query<{ id: number }>(
            `${sqlBase(productsTable)} ${sqlStr} ${sqlOrderBy}`
          );
          expect(rows.map(r => r.id)).toEqual(expectedIds);
        });

        // No native named placeholders -> positional only
        test('parameterized', async () => {
          const { sql, params } = formatQuery(query, {
            format: 'parameterized',
            preset: 'mysql',
            fields,
            ruleProcessor: expressionRuleProcessorParameterized,
          });
          const rows = await t.query<{ id: number }>(
            `${sqlBase(productsTable)} ${sql} ${sqlOrderBy}`,
            params
          );
          expect(rows.map(r => r.id)).toEqual(expectedIds);
        });
      });
    }
  });
}
