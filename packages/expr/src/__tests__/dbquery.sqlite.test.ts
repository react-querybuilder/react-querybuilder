import type { SQLQueryBindings } from 'bun:sqlite';
import { Database } from 'bun:sqlite';
import { formatQuery } from '@react-querybuilder/core';
import {
  CREATE_PRODUCTS_TABLE,
  fields,
  FIND_PRODUCTS_TABLE,
  INSERT_PRODUCTS,
  sqlBase,
  sqliteFunctions,
  sqlOrderBy,
  testCases,
} from '../dbqueryTestUtils';
import { getExpressionRuleProcessorParameterized, getExpressionRuleProcessorSQL } from '../index';

// SQLite uses the `sqliteFunctions` registry (MIN/MAX instead of LEAST/GREATEST).
const sqlProcessor = getExpressionRuleProcessorSQL(sqliteFunctions);
const parameterizedProcessor = getExpressionRuleProcessorParameterized(sqliteFunctions);

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
      const sql = formatQuery(query, { format: 'sql', fields, ruleProcessor: sqlProcessor });
      const rows = db.prepare(`${sqlBase} ${sql} ${sqlOrderBy}`).all() as { id: number }[];
      expect(rows.map(r => r.id)).toEqual(expectedIds);
    });

    test('parameterized', () => {
      const { sql, params } = formatQuery(query, {
        format: 'parameterized',
        fields,
        ruleProcessor: parameterizedProcessor,
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
        ruleProcessor: parameterizedProcessor,
      });
      const rows = db
        .prepare(`${sqlBase} ${sql} ${sqlOrderBy}`)
        .all(params as SQLQueryBindings) as { id: number }[];
      expect(rows.map(r => r.id)).toEqual(expectedIds);
    });
  });
}
