import { PGlite } from '@electric-sql/pglite';
import { formatQuery } from '../formatQuery';
import type { SuperUser, TestSQLParams } from './dbqueryTestUtils';
import { dbSetup, dbTests, sqlBase, superUsers } from './dbqueryTestUtils';

const db = new PGlite();

const superUsersPostgres = superUsers('postgres');

beforeAll(async () => {
  await db.exec(dbSetup('postgres'));
});

/**
 * Tests both SQL variations that PostgreSQL supports.
 * (PostgreSQL does not support named parameters.)
 */
const testSQL = ({ query, expectedResult }: TestSQLParams) => {
  test('sql', async () => {
    const sql = formatQuery(query, { format: 'sql', quoteFieldNamesWith: '"' });
    const queryResult = await db.query(`${sqlBase} ${sql}`);
    expect(queryResult.rows).toEqual(expectedResult);
  });

  test('parameterized', async () => {
    const parameterized = formatQuery(query, {
      quoteFieldNamesWith: '"',
      format: 'parameterized',
      numberedParams: true, // Necessary for PostgreSQL compatibility
      paramPrefix: '$', // Necessary for PostgreSQL compatibility
    });
    const queryResult = await db.query(`${sqlBase} ${parameterized.sql}`, parameterized.params);
    expect(queryResult.rows).toEqual(expectedResult);
  });
};

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
    const sql = formatQuery(
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
    expect((await unquotedDb.query(`${sqlBase} ${sql}`)).rows).toEqual(
      superUsersPostgres
        .filter(u => u.madeUpName.startsWith('S'))
        .map(u =>
          Object.fromEntries(Object.entries(u).map(([k, v]) => [k.toLocaleLowerCase(), v]))
        ) as unknown as SuperUser[]
    );
  });
});
