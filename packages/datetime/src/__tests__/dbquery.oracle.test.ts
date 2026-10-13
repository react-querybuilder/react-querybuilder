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
  CREATE_MUSICIANS_TABLE,
  dateLibraryFunctions,
  fields,
  INSERT_MUSICIANS,
  musicians,
  sqlBase,
  testCases,
} from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorSQL } from '../getDatetimeRuleProcessorSQL';

// CI-only (DBIntegration job): skipped unless RQB_ORACLE_URL + RQB_ORACLE_ADMIN_URL are set.
// Unquoted columns fold to upper case, hence the result keys.
type Result = { FIRST_NAME: string; LAST_NAME: string; BIRTHDATE: Date };

const schemaName = reserveSchema('dt_ora').toUpperCase();
const musiciansTable = `"${schemaName}".musicians`;

describe.skipIf(!oracleEnabled)('Oracle', () => {
  beforeAll(async () => {
    await createOracleUser(schemaName);
    await oracleExecMany([
      CREATE_MUSICIANS_TABLE('oracle', musiciansTable),
      ...INSERT_MUSICIANS('oracle', musiciansTable).split(';'),
    ]);
  }, 60_000);

  afterAll(async () => {
    await dropOracleUser(schemaName);
  });

  for (const [libName, apiFns] of dateLibraryFunctions) {
    describe(libName, () => {
      for (const [testCaseName, [query, expectation]] of Object.entries(testCases)) {
        test(testCaseName, async () => {
          const sqlStr = formatQuery(query, {
            preset: 'oracle',
            fields,
            ruleProcessor: getDatetimeRuleProcessorSQL(apiFns),
          });
          const result = await oracleQuery<Result>(`${sqlBase(musiciansTable)} ${sqlStr}`);
          // oxlint-disable no-conditional-expect
          if (expectation === 'all') {
            expect(result).toHaveLength(musicians.length);
          } else {
            expect(result).toHaveLength(1);
            expect(result[0].LAST_NAME).toBe(expectation);
          }
          // oxlint-enable no-conditional-expect
        });
      }
    });
  }
});
