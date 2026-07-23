import type { SQLQueryBindings } from 'bun:sqlite';
import { Database } from 'bun:sqlite';
import { formatQuery } from '@react-querybuilder/core';
import {
  CREATE_PRODUCTS_TABLE,
  exprRule,
  field,
  fields,
  FIND_PRODUCTS_TABLE,
  fn,
  group,
  INSERT_PRODUCTS,
  sqlBase,
  sqlOrderBy,
  testCases,
  value,
} from '../dbqueryTestUtils';
import { expressionRuleProcessorParameterized, expressionRuleProcessorSQL } from '../index';
import type { ExpressionNode } from '../types';

const param = (p: string): ExpressionNode => ({ kind: 'parameter', parameter: p });

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

// Parameter nodes resolve to externally-supplied bind variables, so they can't ride the
// shared `testCases` loop (which binds only value leaves). Dedicated case: (price * :rate)
// > 40 with rate=2 -> price*2 = 20,40,100,50,10 -> >40 matches ids 3,4.
describe('parameter', () => {
  const query = group(
    exprRule(
      { operator: '>' },
      { lhs: fn('multiply', field('price'), param('rate')), rhs: value(40, 'number') }
    )
  );

  test('sql', () => {
    const sql = formatQuery(query, {
      format: 'sql',
      preset: 'sqlite',
      fields,
      ruleProcessor: expressionRuleProcessorSQL,
    });
    const rows = db.prepare(`${sqlBase()} ${sql} ${sqlOrderBy}`).all({ ':rate': 2 }) as {
      id: number;
    }[];
    expect(rows.map(r => r.id)).toEqual([3, 4]);
  });

  test('parameterized_named', () => {
    const { sql, params } = formatQuery(query, {
      format: 'parameterized_named',
      preset: 'sqlite',
      fields,
      ruleProcessor: expressionRuleProcessorParameterized,
    });
    // `params` registers `:rate: null` (prefix kept); supply the actual binding externally.
    const rows = db
      .prepare(`${sqlBase()} ${sql} ${sqlOrderBy}`)
      .all({ ...(params as Record<string, unknown>), ':rate': 2 }) as { id: number }[];
    expect(rows.map(r => r.id)).toEqual([3, 4]);
  });
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
      const rows = db.prepare(`${sqlBase()} ${sql} ${sqlOrderBy}`).all() as { id: number }[];
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
        .prepare(`${sqlBase()} ${sql} ${sqlOrderBy}`)
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
        .prepare(`${sqlBase()} ${sql} ${sqlOrderBy}`)
        .all(params as SQLQueryBindings) as { id: number }[];
      expect(rows.map(r => r.id)).toEqual(expectedIds);
    });
  });
}
