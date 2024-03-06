import { Database } from 'bun:sqlite';
import { formatQuery } from '../formatQuery';
import type { TestSQLParams } from './dbqueryTestUtils';
import {
  CREATE_INDEX,
  CREATE_TABLE,
  INSERT_INTO,
  sqlBase,
  superUsers,
  dbTests,
} from './dbqueryTestUtils';

const db = new Database();

const superUsersSQLite = superUsers('sqlite');

beforeAll(() => {
  db.run(CREATE_TABLE('sqlite'));
  db.run(CREATE_INDEX);

  // TODO: Return to transactional method below once PGlite also
  // supports it: https://github.com/electric-sql/pglite/issues/17
  for (const user of superUsersSQLite) {
    db.run(INSERT_INTO(user, 'sqlite'));
  }

  //   const insertUser = db.prepare(`
  // INSERT INTO users (firstName, lastName, enhanced, madeUpName, powerUpAge)
  // VALUES ($firstName, $lastName, $enhanced, $madeUpName, $powerUpAge)`);
  //   db.transaction((users: typeof superUsersSQLite) => {
  //     for (const user of users) {
  //       const userWithBindVars = Object.fromEntries(
  //         Object.entries(user).map(([k, v]) => [`$${k}`, v])
  //       );
  //       insertUser.run(userWithBindVars);
  //     }
  //   })(superUsersSQLite);
});

afterAll(() => {
  db.close();
});

/**
 * Tests all three SQL variations.
 */
const testSQL = ({ query, expectedResult, fqOptions }: TestSQLParams) => {
  test('sql', () => {
    const sql = formatQuery(query, { format: 'sql', ...fqOptions });
    const select = db.prepare(`${sqlBase} ${sql}`);
    expect(select.all()).toEqual(expectedResult);
  });

  test('parameterized', () => {
    const parameterized = formatQuery(query, { ...fqOptions, format: 'parameterized' });
    const selectParam = db.prepare(`${sqlBase} ${parameterized.sql}`);
    expect(selectParam.all(...parameterized.params)).toEqual(expectedResult);
  });

  test('parameterized_named', () => {
    const parameterizedNamed = formatQuery(query, {
      ...fqOptions,
      format: 'parameterized_named',
      paramsKeepPrefix: true,
    });
    const selectParamNamed = db.prepare(`${sqlBase} ${parameterizedNamed.sql}`);
    expect(selectParamNamed.all(parameterizedNamed.params)).toEqual(expectedResult);
  });
};

// Common tests
for (const [name, t] of Object.entries(dbTests(superUsersSQLite))) {
  describe(name, () => {
    testSQL(t);
  });
}

// SQLite-specific tests
for (const q of ['"', '`', ['[', ']']] satisfies (string | [string, string])[]) {
  describe(`quote ${q[0]}fieldNames${q[1] ?? q[0]}`, () => {
    testSQL({
      query: {
        combinator: 'and',
        rules: [
          { field: 'enhanced', operator: '>', value: 0 },
          { field: 'enhanced', operator: '>', value: '0' },
        ],
      },
      expectedResult: superUsersSQLite.filter(u => u.enhanced),
      fqOptions: { quoteFieldNamesWith: q },
    });
  });
}
