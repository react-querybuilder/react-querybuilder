import { PGlite } from '@electric-sql/pglite';
import type { DefaultRuleGroupType } from '../../../types';
import type { SuperUser, TestSQLParams } from '../dbqueryTestUtils';
import {
  augmentedSuperUsers,
  dbSetup,
  dbTests,
  genStringsMatchQuery,
  getSqlOrderBy,
  matchModeTests,
  sqlBase,
  superUsers,
} from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';

const db = new PGlite();

const superUsersPostgres = superUsers('postgres');
const augmentedSuperUsersPostgres = augmentedSuperUsers('postgres');

/**
 * Tests both SQL variations that PostgreSQL supports.
 * (PostgreSQL does not support named parameters.)
 */
const testSQL = ({ query, expectedResult, skipParameterized, fqOptions }: TestSQLParams) => {
  test('sql', async () => {
    const sql = formatQuery(query, { ...fqOptions, preset: 'postgresql' });
    const queryResult = await db.query(`${sqlBase} ${sql} ${getSqlOrderBy()}`);
    expect(queryResult.rows).toEqual(expectedResult);
  });

  if (!skipParameterized) {
    test('parameterized', async () => {
      const parameterized = formatQuery(query, {
        ...fqOptions,
        format: 'parameterized',
        preset: 'postgresql',
      });
      const queryResult = await db.query(
        `${sqlBase} ${parameterized.sql} ${getSqlOrderBy()}`,
        parameterized.params
      );
      expect(queryResult.rows).toEqual(expectedResult);
    });
  }
};

describe('PostgreSQL', () => {
  // Common tests
  describe('common', () => {
    beforeAll(async () => {
      await db.exec(dbSetup('postgres'));
    }, 10_000);

    afterAll(async () => {
      await db.close();
    });

    for (const [name, t] of Object.entries(dbTests(superUsersPostgres))) {
      describe(name, () => {
        testSQL(t);
      });
    }

    // "parameter" value source: the generated SQL references bind variables that must
    // be supplied at execution time, so these can't use the shared `dbTests` harness.
    describe('parameter value source', () => {
      const testParam = (
        name: string,
        query: DefaultRuleGroupType,
        bindings: (string | number | boolean)[],
        expectedResult: SuperUser<boolean>[]
      ) => {
        test(name, async () => {
          const sql = formatQuery(query, { format: 'sql', preset: 'postgresql' });
          const result = await db.query(`${sqlBase} ${sql} ${getSqlOrderBy()}`, bindings);
          expect(result.rows).toEqual(expectedResult);
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
        superUsersPostgres.filter(u => (u.powerUpAge ?? 0) > 15)
      );

      testParam(
        'string equality',
        rule({ field: 'firstName', operator: '=', value: '1', valueSource: 'parameter' }),
        ['Peter'],
        superUsersPostgres.filter(u => u.firstName === 'Peter')
      );

      testParam(
        'boolean',
        rule({ field: 'enhanced', operator: '=', value: '1', valueSource: 'parameter' }),
        [true],
        superUsersPostgres.filter(u => u.enhanced)
      );

      testParam(
        'beginsWith',
        rule({ field: 'firstName', operator: 'beginsWith', value: '1', valueSource: 'parameter' }),
        ['P'],
        superUsersPostgres.filter(u => u.firstName.startsWith('P'))
      );

      testParam(
        'endsWith',
        rule({ field: 'lastName', operator: 'endsWith', value: '1', valueSource: 'parameter' }),
        ['s'],
        superUsersPostgres.filter(u => u.lastName.endsWith('s'))
      );

      testParam(
        'contains',
        rule({ field: 'firstName', operator: 'contains', value: '1', valueSource: 'parameter' }),
        ['ete'],
        superUsersPostgres.filter(u => u.firstName.includes('ete'))
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
        superUsersPostgres.filter(u => !u.madeUpName.includes('r'))
      );

      testParam(
        'in',
        rule({ field: 'lastName', operator: 'in', value: '1,2', valueSource: 'parameter' }),
        ['Rogers', 'Wayne'],
        superUsersPostgres.filter(u => ['Rogers', 'Wayne'].includes(u.lastName))
      );

      testParam(
        'between',
        rule({ field: 'powerUpAge', operator: 'between', value: '1,2', valueSource: 'parameter' }),
        [10, 30],
        superUsersPostgres.filter(u => (u.powerUpAge ?? -1) >= 10 && (u.powerUpAge ?? -1) <= 30)
      );
    });
  });

  // Postgres-specific tests
  describe('unquoted field names', () => {
    const unquotedDb = new PGlite();

    beforeAll(async () => {
      await unquotedDb.exec(dbSetup('postgres', { unquoted: true }));
    });

    afterAll(async () => {
      await unquotedDb.close();
    });

    test('unquoted field names', async () => {
      const sqlWhere = formatQuery(
        {
          combinator: 'or',
          rules: [
            { field: 'firstName', operator: 'beginsWith', value: 'P' },
            {
              combinator: 'and',
              rules: [
                { field: 'madeUpName', operator: 'doesNotContain', value: 'Bat' },
                { field: 'madeUpName', operator: 'endsWith', value: 'man' },
              ],
            },
          ],
        },
        { format: 'sql' }
      );
      const result = await unquotedDb.query(`${sqlBase} ${sqlWhere} ${getSqlOrderBy(true)}`);
      expect(result.rows).toEqual(
        superUsersPostgres
          .filter(u => u.madeUpName.startsWith('S'))
          .map(u =>
            Object.fromEntries(Object.entries(u).map(([k, v]) => [k.toLocaleLowerCase(), v]))
          ) as SuperUser[]
      );
    });
  });

  describe('match modes (nested arrays)', () => {
    const nestedArrayDb = new PGlite();

    beforeAll(async () => {
      await nestedArrayDb.exec(dbSetup('postgres', { unquoted: true, includeNestedArrays: true }));
    });

    afterAll(async () => {
      await nestedArrayDb.close();
    });

    const testPostgresAugmented = (
      name: string,
      { query, expectedResult, fqOptions }: TestSQLParams
    ) => {
      test(name, async () => {
        const sqlWhere = formatQuery(query, { ...fqOptions, format: 'sql', preset: 'postgresql' });
        const result = await nestedArrayDb.query(`${sqlBase} ${sqlWhere} ${getSqlOrderBy(true)}`);
        expect(result.rows).toEqual(
          expectedResult.map(u =>
            Object.fromEntries(
              Object.entries(u)
                .filter(([k]) => !k.startsWith('early'))
                .map(([k, v]) => [k.toLocaleLowerCase(), v])
            )
          )
        );
      });

      test(`${name} (parameterized)`, async () => {
        const parameterized = formatQuery(query, {
          ...fqOptions,
          format: 'parameterized',
          preset: 'postgresql',
        });
        const queryResult = await nestedArrayDb.query(
          `${sqlBase} ${parameterized.sql} ${getSqlOrderBy(true)}`,
          parameterized.params
        );
        expect(queryResult.rows).toEqual(
          expectedResult.map(u =>
            Object.fromEntries(
              Object.entries(u)
                .filter(([k]) => !k.startsWith('early'))
                .map(([k, v]) => [k.toLocaleLowerCase(), v])
            )
          )
        );
      });
    };

    describe('strings', () => {
      for (const [name, mm, fn] of matchModeTests.strings) {
        testPostgresAugmented(name, {
          query: genStringsMatchQuery(mm),
          expectedResult: augmentedSuperUsersPostgres.filter(u => fn(u)),
        });
      }
    });
  });
});
