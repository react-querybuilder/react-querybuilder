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
  CREATE_MUSICIANS_TABLE,
  dateLibraryFunctions,
  fields,
  INSERT_MUSICIANS,
  musicians,
  sqlBase,
  testCases,
} from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorSQL } from '../getDatetimeRuleProcessorSQL';

// CI-only (DBIntegration job): MySQL/MariaDB blocks skip unless
// RQB_MYSQL_URL/RQB_MARIADB_URL are set.
type Result = { first_name: string; last_name: string; birthdate: Date };

const targets = [
  {
    name: 'MySQL',
    enabled: mysqlEnabled,
    label: 'dt_mysql',
    query: mysqlQuery,
    execMany: mysqlExecMany,
    createSchema: createMySQLSchema,
    dropSchema: dropMySQLSchema,
  },
  {
    name: 'MariaDB',
    enabled: mariadbEnabled,
    label: 'dt_mariadb',
    query: mariadbQuery,
    execMany: mariadbExecMany,
    createSchema: createMariaDBSchema,
    dropSchema: dropMariaDBSchema,
  },
];

for (const t of targets) {
  const schemaName = reserveSchema(t.label);
  const musiciansTable = `\`${schemaName}\`.musicians`;

  describe.skipIf(!t.enabled)(t.name, () => {
    beforeAll(async () => {
      await t.createSchema(schemaName);
      await t.query(CREATE_MUSICIANS_TABLE('mysql', musiciansTable));
      await t.execMany(INSERT_MUSICIANS('mysql', musiciansTable));
    }, 60_000);

    afterAll(async () => {
      await t.dropSchema(schemaName);
    });

    for (const [libName, apiFns] of dateLibraryFunctions) {
      describe(libName, () => {
        for (const [testCaseName, [query, expectation]] of Object.entries(testCases)) {
          test(testCaseName, async () => {
            const sqlStr = formatQuery(query, {
              preset: 'mysql',
              fields,
              ruleProcessor: getDatetimeRuleProcessorSQL(apiFns),
            });
            const result = await t.query<Result>(`${sqlBase(musiciansTable)} ${sqlStr}`);
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
  });
}
