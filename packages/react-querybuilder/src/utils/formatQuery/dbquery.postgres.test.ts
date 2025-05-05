import { PGlite } from '@electric-sql/pglite';
import { formatQuery } from './formatQuery';
import type { SuperUser, TestSQLParams } from './dbqueryTestUtils';
import { dbSetup, dbTests, getSqlOrderBy, sqlBase, superUsers } from './dbqueryTestUtils';

const db = new PGlite();

const superUsersPostgres = superUsers('postgres');

beforeAll(async () => {
  await db.exec(dbSetup('postgres'));
});

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
  for (const [name, t] of Object.entries(dbTests(superUsersPostgres))) {
    describe(name, () => {
      testSQL(t);
    });
  }

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
});
