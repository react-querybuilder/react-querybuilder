import {
  createMSSQLSchema,
  dropMSSQLSchema,
  mssqlEnabled,
  mssqlQuery,
  reserveSchema,
} from '@rqb-dbpool';
import type { DefaultRuleGroupType } from '../../../types';
import type { SuperUser, TestSQLParams } from '../dbqueryTestUtils';
import { dbSetup, dbTests, getSqlOrderBy, sqlBase, superUsers } from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';

// CI-only (DBIntegration job): skipped unless RQB_MSSQL_URL is set. Each describe block gets an
// isolated schema in the shared `rqb` database.
// TODO: match modes (nested arrays) not yet supported by the "mssql" preset.
const commonSchema = reserveSchema('mssql_common');
const quoteSchema = reserveSchema('mssql_quote');

const superUsersMSSQL = superUsers('mssql');

const testSQL = (
  schema: string,
  { query, expectedResult, skipParameterized, fqOptions }: TestSQLParams
) => {
  test('sql', async () => {
    const sqlStr = formatQuery(query, { ...fqOptions, preset: 'mssql' });
    const queryResult = await mssqlQuery(`${sqlBase(schema)} ${sqlStr} ${getSqlOrderBy()}`);
    expect(queryResult).toEqual(expectedResult);
  });

  if (!skipParameterized) {
    test('parameterized', async () => {
      const { sql, params } = formatQuery(query, {
        ...fqOptions,
        format: 'parameterized',
        preset: 'mssql',
      });
      const queryResult = await mssqlQuery(`${sqlBase(schema)} ${sql} ${getSqlOrderBy()}`, params);
      expect(queryResult).toEqual(expectedResult);
    });

    test('parameterized_named', async () => {
      const { sql, params } = formatQuery(query, {
        ...fqOptions,
        format: 'parameterized_named',
        preset: 'mssql',
      });
      const queryResult = await mssqlQuery(`${sqlBase(schema)} ${sql} ${getSqlOrderBy()}`, params);
      expect(queryResult).toEqual(expectedResult);
    });
  }
};

describe.skipIf(!mssqlEnabled)('MSSQL', () => {
  describe('common', () => {
    beforeAll(async () => {
      await createMSSQLSchema(commonSchema);
      await mssqlQuery(dbSetup('mssql', { schema: commonSchema }));
    }, 60_000);

    afterAll(async () => {
      await dropMSSQLSchema(commonSchema);
    });

    for (const [name, t] of Object.entries(dbTests(superUsersMSSQL))) {
      describe(name, () => {
        testSQL(commonSchema, t);
      });
    }

    // "parameter" value source: bindings supplied at execution time (positional -> `@1`, ...)
    describe('parameter value source', () => {
      const testParam = (
        name: string,
        query: DefaultRuleGroupType,
        bindings: (string | number | boolean)[],
        expectedResult: SuperUser<0 | 1>[]
      ) => {
        test(name, async () => {
          const sqlStr = formatQuery(query, { format: 'sql', preset: 'mssql' });
          const result = await mssqlQuery(
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
        superUsersMSSQL.filter(u => (u.powerUpAge ?? 0) > 15)
      );

      testParam(
        'string equality',
        rule({ field: 'firstName', operator: '=', value: '1', valueSource: 'parameter' }),
        ['Peter'],
        superUsersMSSQL.filter(u => u.firstName === 'Peter')
      );

      testParam(
        'boolean',
        rule({ field: 'enhanced', operator: '=', value: '1', valueSource: 'parameter' }),
        [1],
        superUsersMSSQL.filter(u => !!u.enhanced)
      );

      testParam(
        'beginsWith',
        rule({ field: 'firstName', operator: 'beginsWith', value: '1', valueSource: 'parameter' }),
        ['P'],
        superUsersMSSQL.filter(u => u.firstName.startsWith('P'))
      );

      testParam(
        'endsWith',
        rule({ field: 'lastName', operator: 'endsWith', value: '1', valueSource: 'parameter' }),
        ['s'],
        superUsersMSSQL.filter(u => u.lastName.endsWith('s'))
      );

      testParam(
        'contains',
        rule({ field: 'firstName', operator: 'contains', value: '1', valueSource: 'parameter' }),
        ['ete'],
        superUsersMSSQL.filter(u => u.firstName.includes('ete'))
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
        superUsersMSSQL.filter(u => !u.madeUpName.includes('r'))
      );

      testParam(
        'in',
        rule({ field: 'lastName', operator: 'in', value: '1,2', valueSource: 'parameter' }),
        ['Rogers', 'Wayne'],
        superUsersMSSQL.filter(u => ['Rogers', 'Wayne'].includes(u.lastName))
      );

      testParam(
        'between',
        rule({ field: 'powerUpAge', operator: 'between', value: '1,2', valueSource: 'parameter' }),
        [10, 30],
        superUsersMSSQL.filter(u => (u.powerUpAge ?? -1) >= 10 && (u.powerUpAge ?? -1) <= 30)
      );
    });
  });

  // Closing bracket in field name must round-trip as a real column, not break out of the
  // identifier (unescaped, the payload below would match every row)
  describe('field name containing closing bracket', () => {
    const col = `enhanced] > 0 or 1=1 or [x`;
    const qcol = `[${col.replaceAll(']', ']]')}]`;
    beforeAll(async () => {
      await createMSSQLSchema(quoteSchema);
      await mssqlQuery(
        `CREATE TABLE [${quoteSchema}].t (id int, ${qcol} varchar(10)); ` +
          `INSERT INTO [${quoteSchema}].t VALUES (1, 'x'), (2, 'y'), (3, 'z');`
      );
    }, 60_000);

    afterAll(async () => {
      await dropMSSQLSchema(quoteSchema);
    });

    const query: DefaultRuleGroupType = {
      combinator: 'and',
      rules: [{ field: col, operator: '=', value: 'x' }],
    };
    for (const format of ['sql', 'parameterized'] as const) {
      test(format, async () => {
        const fq = formatQuery(query, { format, preset: 'mssql' }) as unknown as
          | string
          | { sql: string; params: unknown[] };
        const [where, params] = typeof fq === 'string' ? [fq, []] : [fq.sql, fq.params];
        const rows = await mssqlQuery(
          `SELECT id FROM [${quoteSchema}].t WHERE ${where} ORDER BY id`,
          params
        );
        expect(rows).toEqual([{ id: 1 }]);
      });
    }
  });
});
