import { formatQuery } from '@react-querybuilder/core';
import {
  createMSSQLSchema,
  dropMSSQLSchema,
  mssqlEnabled,
  mssqlQuery,
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

// CI-only (DBIntegration job): skipped unless RQB_MSSQL_URL is set.
type Result = { first_name: string; last_name: string; birthdate: Date };

const schemaName = reserveSchema('dt_mssql');
const musiciansTable = `[${schemaName}].musicians`;

describe.skipIf(!mssqlEnabled)('MSSQL', () => {
  beforeAll(async () => {
    await createMSSQLSchema(schemaName);
    await mssqlQuery(CREATE_MUSICIANS_TABLE('mssql', musiciansTable));
    await mssqlQuery(INSERT_MUSICIANS('mssql', musiciansTable));
  }, 60_000);

  afterAll(async () => {
    await dropMSSQLSchema(schemaName);
  });

  for (const [libName, apiFns] of dateLibraryFunctions) {
    describe(libName, () => {
      for (const [testCaseName, [query, expectation]] of Object.entries(testCases)) {
        test(testCaseName, async () => {
          const sqlStr = formatQuery(query, {
            preset: 'mssql',
            fields,
            ruleProcessor: getDatetimeRuleProcessorSQL(apiFns),
          });
          const result = await mssqlQuery<Result>(`${sqlBase(musiciansTable)} ${sqlStr}`);
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
