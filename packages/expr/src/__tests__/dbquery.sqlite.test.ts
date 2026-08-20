import { SQL } from 'bun';
import { formatQuery } from '@react-querybuilder/core';
import {
  CREATE_PRODUCTS_TABLE,
  exprRule,
  field,
  fields,
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

const sql = new SQL({ adapter: 'sqlite', filename: ':memory:' });

beforeAll(async () => {
  await sql.unsafe(CREATE_PRODUCTS_TABLE('sqlite'));
  await sql.unsafe(INSERT_PRODUCTS());
});

afterAll(async () => {
  await sql.close();
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

  test('sql', async () => {
    const sqlStr = formatQuery(query, {
      format: 'sql',
      preset: 'sqlite',
      fields,
      ruleProcessor: expressionRuleProcessorSQL,
    });
    // @ts-expect-error Bun.SQL accepts object with :-prefixed keys for named params
    const rows = (await sql.unsafe(`${sqlBase()} ${sqlStr} ${sqlOrderBy}`, { ':rate': 2 })) as {
      id: number;
    }[];
    expect(rows.map(r => r.id)).toEqual([3, 4]);
  });

  test('parameterized_named', async () => {
    const { sql: sqlStr, params } = formatQuery(query, {
      format: 'parameterized_named',
      preset: 'sqlite',
      fields,
      ruleProcessor: expressionRuleProcessorParameterized,
    });
    // `params` registers `:rate: null` (prefix kept); supply the actual binding externally.
    const rows = (await sql.unsafe(`${sqlBase()} ${sqlStr} ${sqlOrderBy}`, {
      ...(params as Record<string, unknown>),
      ':rate': 2,
    } as unknown as unknown[])) as { id: number }[];
    expect(rows.map(r => r.id)).toEqual([3, 4]);
  });
});

for (const [testCaseName, [query, expectedIds]] of Object.entries(testCases)) {
  describe(testCaseName, () => {
    test('sql', async () => {
      const sqlStr = formatQuery(query, {
        format: 'sql',
        preset: 'sqlite',
        fields,
        ruleProcessor: expressionRuleProcessorSQL,
      });
      const rows = (await sql.unsafe(`${sqlBase()} ${sqlStr} ${sqlOrderBy}`)) as { id: number }[];
      expect(rows.map(r => r.id)).toEqual(expectedIds);
    });

    test('parameterized', async () => {
      const { sql: sqlStr, params } = formatQuery(query, {
        format: 'parameterized',
        preset: 'sqlite',
        fields,
        ruleProcessor: expressionRuleProcessorParameterized,
      });
      const rows = (await sql.unsafe(`${sqlBase()} ${sqlStr} ${sqlOrderBy}`, params)) as {
        id: number;
      }[];
      expect(rows.map(r => r.id)).toEqual(expectedIds);
    });

    test('parameterized_named', async () => {
      const { sql: sqlStr, params } = formatQuery(query, {
        format: 'parameterized_named',
        preset: 'sqlite',
        fields,
        ruleProcessor: expressionRuleProcessorParameterized,
      });
      // @ts-expect-error Bun.SQL accepts object with :-prefixed keys for named params
      const rows = (await sql.unsafe(`${sqlBase()} ${sqlStr} ${sqlOrderBy}`, params)) as {
        id: number;
      }[];
      expect(rows.map(r => r.id)).toEqual(expectedIds);
    });
  });
}
