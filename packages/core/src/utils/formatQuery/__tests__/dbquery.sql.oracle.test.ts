import {
  createOracleUser,
  dropOracleUser,
  oracleEnabled,
  oracleExecMany,
  oracleQuery,
  reserveSchema,
} from '@rqb-dbpool';
import type { DefaultRuleGroupType, FormatQueryOptions } from '../../../types';
import type { SuperUser, TestSQLParams } from '../dbqueryTestUtils';
import { dbSetup, dbTests, getSqlOrderBy, sqlBase, superUsers } from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';

// CI-only (DBIntegration job): skipped unless RQB_ORACLE_URL + RQB_ORACLE_ADMIN_URL are set.
// Each describe block gets its own Oracle user (= schema); queries run as the low-privilege app
// user. Upper-case names so quoted/unquoted references agree.
// TODO: match modes (nested arrays) not yet supported by the "oracle" preset.
const commonSchema = reserveSchema('ora_common').toUpperCase();
const quoteSchema = reserveSchema('ora_quote').toUpperCase();

const superUsersOracle = superUsers('oracle');

// Columns are created quoted (mixed case) so result keys match `SuperUser`. The "oracle" preset
// doesn't quote identifiers (unquoted refs fold to upper case), so opt in here.
const oracleOpts = {
  preset: 'oracle',
  quoteFieldNamesWith: '"',
} as const satisfies FormatQueryOptions;

const testSQL = (
  schema: string,
  { query, expectedResult, skipParameterized, fqOptions }: TestSQLParams
) => {
  test('sql', async () => {
    const sqlStr = formatQuery(query, { ...fqOptions, ...oracleOpts });
    const queryResult = await oracleQuery(`${sqlBase(schema)} ${sqlStr} ${getSqlOrderBy()}`);
    expect(queryResult).toEqual(expectedResult);
  });

  if (!skipParameterized) {
    test('parameterized', async () => {
      const { sql, params } = formatQuery(query, {
        ...fqOptions,
        ...oracleOpts,
        format: 'parameterized',
      });
      const queryResult = await oracleQuery(`${sqlBase(schema)} ${sql} ${getSqlOrderBy()}`, params);
      expect(queryResult).toEqual(expectedResult);
    });

    test('parameterized_named', async () => {
      const { sql, params } = formatQuery(query, {
        ...fqOptions,
        ...oracleOpts,
        format: 'parameterized_named',
      });
      const queryResult = await oracleQuery(`${sqlBase(schema)} ${sql} ${getSqlOrderBy()}`, params);
      expect(queryResult).toEqual(expectedResult);
    });
  }
};

const splitStatements = (sql: string) => sql.split(';').filter(s => s.trim());

describe.skipIf(!oracleEnabled)('Oracle', () => {
  describe('common', () => {
    beforeAll(async () => {
      await createOracleUser(commonSchema);
      await oracleExecMany(splitStatements(dbSetup('oracle', { schema: commonSchema })));
    }, 60_000);

    afterAll(async () => {
      await dropOracleUser(commonSchema);
    });

    for (const [name, t] of Object.entries(dbTests(superUsersOracle))) {
      describe(name, () => {
        testSQL(commonSchema, t);
      });
    }

    // "parameter" value source: bindings supplied at execution time (positional -> `:1`, ...)
    describe('parameter value source', () => {
      const testParam = (
        name: string,
        query: DefaultRuleGroupType,
        bindings: (string | number | boolean)[],
        expectedResult: SuperUser<boolean>[]
      ) => {
        test(name, async () => {
          const sqlStr = formatQuery(query, { ...oracleOpts, format: 'sql' });
          const result = await oracleQuery(
            `${sqlBase(commonSchema)} ${sqlStr} ${getSqlOrderBy()}`,
            bindings
          );
          expect(result).toEqual(expectedResult);
        });
      };

      const rule = (r: DefaultRuleGroupType['rules'][number]): DefaultRuleGroupType => ({
        combinator: 'and',
        rules: [r],
      });

      testParam(
        'numeric comparison',
        rule({ field: 'powerUpAge', operator: '>', value: '1', valueSource: 'parameter' }),
        [15],
        superUsersOracle.filter(u => (u.powerUpAge ?? 0) > 15)
      );

      testParam(
        'string equality',
        rule({ field: 'firstName', operator: '=', value: '1', valueSource: 'parameter' }),
        ['Peter'],
        superUsersOracle.filter(u => u.firstName === 'Peter')
      );

      testParam(
        'boolean',
        rule({ field: 'enhanced', operator: '=', value: '1', valueSource: 'parameter' }),
        [true],
        superUsersOracle.filter(u => u.enhanced)
      );

      testParam(
        'beginsWith',
        rule({ field: 'firstName', operator: 'beginsWith', value: '1', valueSource: 'parameter' }),
        ['P'],
        superUsersOracle.filter(u => u.firstName.startsWith('P'))
      );

      testParam(
        'endsWith',
        rule({ field: 'lastName', operator: 'endsWith', value: '1', valueSource: 'parameter' }),
        ['s'],
        superUsersOracle.filter(u => u.lastName.endsWith('s'))
      );

      testParam(
        'contains',
        rule({ field: 'firstName', operator: 'contains', value: '1', valueSource: 'parameter' }),
        ['ete'],
        superUsersOracle.filter(u => u.firstName.includes('ete'))
      );

      testParam(
        'doesNotContain',
        rule({
          field: 'madeUpName',
          operator: 'doesNotContain',
          value: '1',
          valueSource: 'parameter',
        }),
        ['r'],
        superUsersOracle.filter(u => !u.madeUpName.includes('r'))
      );

      testParam(
        'in',
        rule({ field: 'lastName', operator: 'in', value: '1,2', valueSource: 'parameter' }),
        ['Rogers', 'Wayne'],
        superUsersOracle.filter(u => ['Rogers', 'Wayne'].includes(u.lastName))
      );

      testParam(
        'between',
        rule({ field: 'powerUpAge', operator: 'between', value: '1,2', valueSource: 'parameter' }),
        [10, 30],
        superUsersOracle.filter(u => (u.powerUpAge ?? -1) >= 10 && (u.powerUpAge ?? -1) <= 30)
      );
    });
  });

  // Oracle quoted identifiers can't contain `"` at all, so the escaped name can't round-trip;
  // it must error (or match nothing), never break out of the identifier and match every row.
  describe('field name containing closing quote', () => {
    beforeAll(async () => {
      await createOracleUser(quoteSchema);
      await oracleExecMany([
        `CREATE TABLE "${quoteSchema}".t (id NUMBER(10), "enhanced" VARCHAR2(10))`,
        `INSERT INTO "${quoteSchema}".t VALUES (1, 'x'), (2, 'y'), (3, 'z')`,
      ]);
    }, 60_000);

    afterAll(async () => {
      await dropOracleUser(quoteSchema);
    });

    const query: DefaultRuleGroupType = {
      combinator: 'and',
      rules: [{ field: `enhanced" > 0 or 1=1 or "x`, operator: '=', value: 'x' }],
    };
    for (const format of ['sql', 'parameterized'] as const) {
      test(format, async () => {
        const fq = formatQuery(query, { ...oracleOpts, format }) as unknown as
          | string
          | { sql: string; params: unknown[] };
        const [where, params] = typeof fq === 'string' ? [fq, []] : [fq.sql, fq.params];
        const result = await oracleQuery(
          `SELECT id FROM "${quoteSchema}".t WHERE ${where} ORDER BY id`,
          params
        ).catch((e: Error) => e);
        expect(result instanceof Error || result.length === 0).toBe(true);
      });
    }
  });
});
