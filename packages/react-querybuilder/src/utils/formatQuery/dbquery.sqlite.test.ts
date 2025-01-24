import { Database } from 'bun:sqlite';
import { formatQuery } from './formatQuery';
import type { TestSQLParams } from './dbqueryTestUtils';
import { dbSetup, dbTests, sqlBase, superUsers } from './dbqueryTestUtils';

const db = new Database();

const superUsersSQLite = superUsers('sqlite');

beforeAll(() => {
  db.run(dbSetup('sqlite'));
});

afterAll(() => {
  db.close();
});

/**
 * Tests all three SQL variations.
 */
const testSQL = ({ query, expectedResult, fqOptions, skipParameterized }: TestSQLParams) => {
  test('sql', () => {
    const sql = formatQuery(query, { format: 'sql', ...fqOptions });
    const select = db.prepare(`${sqlBase} ${sql}`);
    expect(select.all()).toEqual(expectedResult);
  });

  if (!skipParameterized) {
    test('parameterized', () => {
      const parameterized = formatQuery(query, { ...fqOptions, format: 'parameterized' });
      const selectParam = db.prepare(`${sqlBase} ${parameterized.sql}`);
      if (fqOptions?.preserveValueOrder) {
        console.log({ sql: parameterized.sql, params: parameterized.params });
      }
      expect(selectParam.all(...parameterized.params)).toEqual(expectedResult);
    });

    test('parameterized_named', () => {
      const parameterizedNamed = formatQuery(query, {
        ...fqOptions,
        format: 'parameterized_named',
        preset: 'sqlite',
      });
      const selectParamNamed = db.prepare(`${sqlBase} ${parameterizedNamed.sql}`);
      if (fqOptions?.preserveValueOrder) {
        console.log({ sql: parameterizedNamed.sql, params: parameterizedNamed.params });
      }
      expect(selectParamNamed.all(parameterizedNamed.params)).toEqual(expectedResult);
    });
  }
};

describe('SQLite', () => {
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
});
