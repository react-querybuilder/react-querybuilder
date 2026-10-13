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
import type { DefaultRuleGroupType } from '../../../types';
import type { SuperUser, TestSQLParams } from '../dbqueryTestUtils';
import { dbSetup, dbTests, getSqlOrderBy, sqlBase, superUsers } from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';

// CI-only (DBIntegration job): MySQL/MariaDB blocks skip unless RQB_MYSQL_URL/RQB_MARIADB_URL
// are set. Each describe block gets its own database (= schema).
// TODO: match modes (nested arrays) not yet supported by the "mysql" preset.

type Query = <T = Record<string, unknown>>(sql: string, params?: unknown[]) => Promise<T[]>;

interface Target {
  name: string;
  enabled: boolean;
  label: string;
  query: Query;
  execMany: (sql: string) => Promise<void>;
  createSchema: (schema: string) => Promise<void>;
  dropSchema: (schema: string) => Promise<void>;
}

const targets: Target[] = [
  {
    name: 'MySQL',
    enabled: mysqlEnabled,
    label: 'mysql',
    query: mysqlQuery,
    execMany: mysqlExecMany,
    createSchema: createMySQLSchema,
    dropSchema: dropMySQLSchema,
  },
  {
    name: 'MariaDB',
    enabled: mariadbEnabled,
    label: 'mariadb',
    query: mariadbQuery,
    execMany: mariadbExecMany,
    createSchema: createMariaDBSchema,
    dropSchema: dropMariaDBSchema,
  },
];

const superUsersMySQL = superUsers('mysql');

// No native named placeholders; rewrite `:name` -> `?` (what e.g. mysql2's `namedPlaceholders`
// does) so the "parameterized_named" output is still exercised.
const namedToPositional = (sql: string, params: Record<string, unknown>) => {
  const values: unknown[] = [];
  const positional = sql.replaceAll(/:(\w+)/g, (_, name: string) => {
    values.push(params[name]);
    return '?';
  });
  return [positional, values] as const;
};

for (const t of targets) {
  const commonSchema = reserveSchema(`${t.label}_common`);
  const quoteSchema = reserveSchema(`${t.label}_quote`);
  const base = () => sqlBase(commonSchema, undefined, 'mysql');
  const orderBy = getSqlOrderBy(false, 'mysql');

  const testSQL = ({ query, expectedResult, skipParameterized, fqOptions }: TestSQLParams) => {
    test('sql', async () => {
      const sqlStr = formatQuery(query, { ...fqOptions, preset: 'mysql' });
      expect(await t.query(`${base()} ${sqlStr} ${orderBy}`)).toEqual(expectedResult);
    });

    if (!skipParameterized) {
      test('parameterized', async () => {
        const { sql, params } = formatQuery(query, {
          ...fqOptions,
          format: 'parameterized',
          preset: 'mysql',
        });
        expect(await t.query(`${base()} ${sql} ${orderBy}`, params)).toEqual(expectedResult);
      });

      test('parameterized_named', async () => {
        const { sql, params } = formatQuery(query, {
          ...fqOptions,
          format: 'parameterized_named',
          preset: 'mysql',
        });
        const [pSql, values] = namedToPositional(sql, params);
        expect(await t.query(`${base()} ${pSql} ${orderBy}`, values)).toEqual(expectedResult);
      });
    }
  };

  describe.skipIf(!t.enabled)(t.name, () => {
    describe('common', () => {
      beforeAll(async () => {
        await t.createSchema(commonSchema);
        await t.execMany(dbSetup('mysql', { schema: commonSchema }));
      }, 60_000);

      afterAll(async () => {
        await t.dropSchema(commonSchema);
      });

      for (const [name, tc] of Object.entries(dbTests(superUsersMySQL))) {
        describe(name, () => {
          testSQL(tc);
        });
      }

      // "parameter" value source: positional `?` bindings supplied at execution time
      // (each `?` must be a distinct rule value, in binding order)
      describe('parameter value source', () => {
        const testParam = (
          name: string,
          query: DefaultRuleGroupType,
          bindings: (string | number | boolean)[],
          expectedResult: SuperUser<0 | 1>[]
        ) => {
          test(name, async () => {
            // Empty prefix -> bare `?` (default `:` prefix is for named placeholders)
            const sqlStr = formatQuery(query, { format: 'sql', preset: 'mysql', paramPrefix: '' });
            expect(await t.query(`${base()} ${sqlStr} ${orderBy}`, bindings)).toEqual(
              expectedResult
            );
          });
        };

        const rule = (r: DefaultRuleGroupType['rules'][number]): DefaultRuleGroupType => ({
          combinator: 'and',
          rules: [r],
        });

        testParam(
          'numeric comparison',
          rule({ field: 'powerUpAge', operator: '>', value: '?', valueSource: 'parameter' }),
          [15],
          superUsersMySQL.filter(u => (u.powerUpAge ?? 0) > 15)
        );

        testParam(
          'string equality',
          rule({ field: 'firstName', operator: '=', value: '?', valueSource: 'parameter' }),
          ['Peter'],
          superUsersMySQL.filter(u => u.firstName === 'Peter')
        );

        testParam(
          'boolean',
          rule({ field: 'enhanced', operator: '=', value: '?', valueSource: 'parameter' }),
          [1],
          superUsersMySQL.filter(u => !!u.enhanced)
        );

        testParam(
          'beginsWith',
          rule({
            field: 'firstName',
            operator: 'beginsWith',
            value: '?',
            valueSource: 'parameter',
          }),
          ['P'],
          superUsersMySQL.filter(u => u.firstName.startsWith('P'))
        );

        testParam(
          'endsWith',
          rule({ field: 'lastName', operator: 'endsWith', value: '?', valueSource: 'parameter' }),
          ['s'],
          superUsersMySQL.filter(u => u.lastName.endsWith('s'))
        );

        testParam(
          'contains',
          rule({ field: 'firstName', operator: 'contains', value: '?', valueSource: 'parameter' }),
          ['ete'],
          superUsersMySQL.filter(u => u.firstName.includes('ete'))
        );

        testParam(
          'doesNotContain',
          rule({
            field: 'madeUpName',
            operator: 'doesNotContain',
            value: '?',
            valueSource: 'parameter',
          }),
          ['r'],
          superUsersMySQL.filter(u => !u.madeUpName.includes('r'))
        );

        testParam(
          'in',
          rule({ field: 'lastName', operator: 'in', value: '?,?', valueSource: 'parameter' }),
          ['Rogers', 'Wayne'],
          superUsersMySQL.filter(u => ['Rogers', 'Wayne'].includes(u.lastName))
        );

        testParam(
          'between',
          rule({
            field: 'powerUpAge',
            operator: 'between',
            value: '?,?',
            valueSource: 'parameter',
          }),
          [10, 30],
          superUsersMySQL.filter(u => (u.powerUpAge ?? -1) >= 10 && (u.powerUpAge ?? -1) <= 30)
        );
      });
    });

    describe('quoting', () => {
      // Backtick in field name must round-trip as a real column, not break out of the
      // identifier (unescaped, the payload below would match every row)
      const col = 'enhanced` > 0 or 1=1 or `x';
      const qcol = `\`${col.replaceAll('`', '``')}\``;
      const tbl = `\`${quoteSchema}\`.t`;

      beforeAll(async () => {
        await t.createSchema(quoteSchema);
        await t.query(`CREATE TABLE ${tbl} (id int, ${qcol} varchar(20))`);
        // Bound, so backslashes are stored verbatim
        await t.query(`INSERT INTO ${tbl} VALUES (1, ?), (2, ?), (3, ?), (4, ?)`, [
          'x',
          'y',
          'z',
          'a\\',
        ]);
      }, 60_000);

      afterAll(async () => {
        await t.dropSchema(quoteSchema);
      });

      const run = async (value: string, format: 'sql' | 'parameterized') => {
        const query: DefaultRuleGroupType = {
          combinator: 'and',
          rules: [{ field: col, operator: '=', value }],
        };
        const fq = formatQuery(query, { format, preset: 'mysql' }) as unknown as
          | string
          | { sql: string; params: unknown[] };
        const [where, params] = typeof fq === 'string' ? [fq, []] : [fq.sql, fq.params];
        return t.query(`SELECT id FROM ${tbl} WHERE ${where} ORDER BY id`, params);
      };

      for (const format of ['sql', 'parameterized'] as const) {
        test(`field name w/ backtick (${format})`, async () => {
          expect(await run('x', format)).toEqual([{ id: 1 }]);
        });

        test(`value w/ trailing backslash (${format})`, async () => {
          expect(await run('a\\', format)).toEqual([{ id: 4 }]);
        });

        // Unescaped, `\'` would end the literal early and inject `or 1=1`
        test(`backslash-quote injection (${format})`, async () => {
          expect(await run(String.raw`\' or 1=1 or '`, format)).toEqual([]);
        });
      }
    });
  });
}
