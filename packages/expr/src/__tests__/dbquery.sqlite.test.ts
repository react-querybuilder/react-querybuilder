import type { SQLQueryBindings } from 'bun:sqlite';
import { Database } from 'bun:sqlite';
import { formatQuery } from '@react-querybuilder/core';
import {
  CREATE_PRODUCTS_TABLE,
  fields,
  FIND_PRODUCTS_TABLE,
  INSERT_PRODUCTS,
  sqlBase,
  sqlOrderBy,
  testCases,
} from '../dbqueryTestUtils';
import { expressionRuleProcessorParameterized, expressionRuleProcessorSQL } from '../index';

// SQLite lacks LEAST/GREATEST; the `sqlite` preset resolves `min`/`max` to scalar MIN/MAX.

const db = new Database();

beforeAll(() => {
  if (db.query(FIND_PRODUCTS_TABLE('sqlite')).all().length === 0) {
    db.run(CREATE_PRODUCTS_TABLE('sqlite'));
    db.run(INSERT_PRODUCTS());
  }
});

afterAll(() => {
  db.close();
});

for (const [testCaseName, [query, expectedIds]] of Object.entries(testCases)) {
  describe(testCaseName, () => {
    test('sql', () => {
      const sql = formatQuery(query, {
        format: 'sql',
        preset: 'sqlite',
        fields,
        ruleProcessor: expressionRuleProcessorSQL,
      });
      const rows = db.prepare(`${sqlBase} ${sql} ${sqlOrderBy}`).all() as { id: number }[];
      expect(rows.map(r => r.id)).toEqual(expectedIds);
    });

    test('parameterized', () => {
      const { sql, params } = formatQuery(query, {
        format: 'parameterized',
        preset: 'sqlite',
        fields,
        ruleProcessor: expressionRuleProcessorParameterized,
      });
      const rows = db
        .prepare(`${sqlBase} ${sql} ${sqlOrderBy}`)
        .all(...(params as SQLQueryBindings[])) as { id: number }[];
      expect(rows.map(r => r.id)).toEqual(expectedIds);
    });

    test('parameterized_named', () => {
      const { sql, params } = formatQuery(query, {
        format: 'parameterized_named',
        preset: 'sqlite',
        fields,
        ruleProcessor: expressionRuleProcessorParameterized,
      });
      const rows = db
        .prepare(`${sqlBase} ${sql} ${sqlOrderBy}`)
        .all(params as SQLQueryBindings) as { id: number }[];
      expect(rows.map(r => r.id)).toEqual(expectedIds);
    });
  });
}
