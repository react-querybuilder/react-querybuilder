import { PGlite } from '@electric-sql/pglite';
import { formatQuery } from '../formatQuery';
import type { SuperUser, TestSQLParams } from './dbqueryTestUtils';
import {
  CREATE_INDEX,
  CREATE_TABLE,
  INSERT_INTO,
  sqlBase,
  superUsers,
  dbTests,
} from './dbqueryTestUtils';

const db = new PGlite();

const superUsersPostgres = superUsers('postgres');

beforeAll(async () => {
  await db.query(CREATE_TABLE('postgres'));
  await db.query(CREATE_INDEX);
  // TODO: Use transactional method if/when PGlite supports it?
  await Promise.all(superUsersPostgres.map(user => db.query(INSERT_INTO(user, 'postgres'))));
});

afterAll(async () => {
  await db.close();
});

/**
 * Tests all three SQL variations.
 */
// TODO: Enable parameterized tests once PGlite supports them:
// https://github.com/electric-sql/pglite/issues/17
const testSQL = ({ query, expectedResult, fqOptions }: TestSQLParams) => {
  test('sql', async () => {
    const sql = formatQuery(query, { format: 'sql', quoteFieldNamesWith: '"', ...fqOptions });
    expect(await db.query(`${sqlBase} ${sql}`)).toEqual(expectedResult);
  });

  // test('parameterized', () => {
  //   const parameterized = formatQuery(query, { ...fqOptions, format: 'parameterized' });
  //   const selectParam = db.prepare(`${sqlBase} ${parameterized.sql}`);
  //   expect(selectParam.all(...parameterized.params)).toEqual(expectedResult);
  // });

  // test('parameterized_named', () => {
  //   const parameterizedNamed = formatQuery(query, {
  //     ...fqOptions,
  //     format: 'parameterized_named',
  //     paramsKeepPrefix: true,
  //   });
  //   const selectParamNamed = db.prepare(`${sqlBase} ${parameterizedNamed.sql}`);
  //   expect(selectParamNamed.all(parameterizedNamed.params)).toEqual(expectedResult);
  // });
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

  const removeQuotes = (str: string) =>
    str.replace(/"(\w+)"/g, m => m.replaceAll('"', '').toLocaleLowerCase());

  beforeAll(async () => {
    await unquotedDb.query(removeQuotes(CREATE_TABLE('postgres')));
    await unquotedDb.query(removeQuotes(CREATE_INDEX));
    await Promise.all(
      superUsersPostgres.map(async user =>
        unquotedDb.query(removeQuotes(INSERT_INTO(user, 'postgres')))
      )
    );
  });

  it('works with unquoted field names', async () => {
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
    expect(await unquotedDb.query(`${sqlBase} ${sql}`)).toEqual(
      superUsersPostgres
        .filter(u => u.madeUpName.startsWith('S'))
        .map(u =>
          Object.fromEntries(Object.entries(u).map(([k, v]) => [k.toLocaleLowerCase(), v]))
        ) as unknown as SuperUser[]
    );
  });

  afterAll(async () => {
    await unquotedDb.close();
  });
});
