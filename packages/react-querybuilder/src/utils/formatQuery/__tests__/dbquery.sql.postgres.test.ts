import { PGlite } from '@electric-sql/pglite';
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

describe('PostgreSQL', async () => {
  // Common tests
  describe('common', async () => {
    beforeAll(async () => {
      await db.exec(dbSetup('postgres'));
    });

    for (const [name, t] of Object.entries(dbTests(superUsersPostgres))) {
      describe(name, () => {
        testSQL(t);
      });
    }
  });

  // Postgres-specific tests
  describe('unquoted field names', async () => {
    const unquotedDb = new PGlite();

    beforeAll(async () => {
      await unquotedDb.exec(dbSetup('postgres', { unquoted: true }));
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
          ) as unknown as SuperUser[]
      );
    });
  });

  describe('match modes (nested arrays)', async () => {
    const nestedArrayDb = new PGlite();

    beforeAll(async () => {
      await nestedArrayDb.exec(dbSetup('postgres', { unquoted: true, includeNestedArrays: true }));
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
        console.log({ parameterized });
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
