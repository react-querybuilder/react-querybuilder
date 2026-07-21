import type { RuleGroupType, RuleType } from '@react-querybuilder/core';
import { formatQuery } from '@react-querybuilder/core';
import * as dz from 'drizzle-orm';
import { integer, pgTable, text } from 'drizzle-orm/pg-core';
import { PgDialect } from 'drizzle-orm/pg-core';
import {
  expressionRuleProcessorDrizzle,
  expressionRuleProcessorMongoDB,
  expressionRuleProcessorMongoDBQuery,
} from '../index';
import type { ExpressionNode, ResolvedExpressions } from '../types';

const field = (f: string): ExpressionNode => ({ kind: 'field', field: f });
const value = (v: unknown, valueType?: string): ExpressionNode => ({
  kind: 'value',
  value: v,
  valueType,
});
const fn = (name: string, ...args: ExpressionNode[]): ExpressionNode => ({
  kind: 'func',
  fn: name,
  args,
});

const exprRule = (
  rule: Partial<RuleType> & { operator: string },
  { lhs, rhs, rhs2 }: ResolvedExpressions = {}
): RuleType => {
  const result = { field: '(expression)', value: '', ...rule } as RuleType;
  if (lhs) result.lhs = lhs;
  if (rhs || rhs2) {
    result.value = rhs2 ? [rhs, rhs2] : rhs;
    result.valueSource = 'expression';
  }
  return result;
};

const group = (...rules: RuleType[]): RuleGroupType => ({ combinator: 'and', rules });

describe('MongoDBQuery processor', () => {
  const mq = (q: RuleGroupType) =>
    formatQuery(q, { format: 'mongodb_query', ruleProcessor: expressionRuleProcessorMongoDBQuery });

  it('serializes arithmetic comparison', () => {
    expect(
      mq(
        group(
          exprRule(
            { operator: '>=' },
            { lhs: fn('multiply', field('price'), field('qty')), rhs: value(100, 'number') }
          )
        )
      )
    ).toEqual({ $expr: { $gte: [{ $multiply: ['$price', '$qty'] }, 100] } });
  });

  it('serializes abs/mod/min/max/upper/lower', () => {
    expect(
      mq(
        group(exprRule({ operator: '=' }, { lhs: fn('abs', field('d')), rhs: value(1, 'number') }))
      )
    ).toEqual({ $expr: { $eq: [{ $abs: '$d' }, 1] } });
    expect(
      mq(
        group(
          exprRule(
            { operator: '=' },
            { lhs: fn('mod', field('n'), value(2, 'number')), rhs: value(0, 'number') }
          )
        )
      )
    ).toEqual({ $expr: { $eq: [{ $mod: ['$n', 2] }, 0] } });
    expect(
      mq(
        group(
          exprRule(
            { operator: '<' },
            { lhs: fn('min', field('a'), field('b')), rhs: value(5, 'number') }
          )
        )
      )
    ).toEqual({ $expr: { $lt: [{ $min: ['$a', '$b'] }, 5] } });
    expect(
      mq(
        group(
          exprRule(
            { operator: '>' },
            { lhs: fn('max', field('a'), field('b')), rhs: value(5, 'number') }
          )
        )
      )
    ).toEqual({ $expr: { $gt: [{ $max: ['$a', '$b'] }, 5] } });
    expect(
      mq(group(exprRule({ operator: '=', value: 'ACME' }, { lhs: fn('upper', field('name')) })))
    ).toEqual({ $expr: { $eq: [{ $toUpper: '$name' }, 'ACME'] } });
    expect(
      mq(group(exprRule({ operator: '=', value: 'acme' }, { lhs: fn('lower', field('name')) })))
    ).toEqual({ $expr: { $eq: [{ $toLower: '$name' }, 'acme'] } });
  });

  it('serializes null/notnull', () => {
    expect(
      mq(group(exprRule({ operator: 'null' }, { lhs: fn('add', field('a'), field('b')) })))
    ).toEqual({ $expr: { $eq: [{ $add: ['$a', '$b'] }, null] } });
    expect(
      mq(group(exprRule({ operator: 'notnull' }, { lhs: fn('add', field('a'), field('b')) })))
    ).toEqual({ $expr: { $ne: [{ $add: ['$a', '$b'] }, null] } });
  });

  it('serializes between/notbetween', () => {
    expect(
      mq(
        group(
          exprRule(
            { operator: 'between' },
            { lhs: fn('abs', field('d')), rhs: value(1, 'number'), rhs2: value(5, 'number') }
          )
        )
      )
    ).toEqual({ $expr: { $and: [{ $gte: [{ $abs: '$d' }, 1] }, { $lte: [{ $abs: '$d' }, 5] }] } });
    expect(
      mq(
        group(
          exprRule(
            { operator: 'notbetween' },
            { lhs: fn('abs', field('d')), rhs: value(1, 'number'), rhs2: value(5, 'number') }
          )
        )
      )
    ).toEqual({ $expr: { $or: [{ $lt: [{ $abs: '$d' }, 1] }, { $gt: [{ $abs: '$d' }, 5] }] } });
  });

  it('supports field-sourced rhs with expression lhs', () => {
    expect(
      mq(
        group(
          exprRule(
            { operator: '=', valueSource: 'field', value: 'expected' },
            { lhs: fn('abs', field('d')) }
          )
        )
      )
    ).toEqual({ $expr: { $eq: [{ $abs: '$d' }, '$expected'] } });
  });

  it('omits rule with unknown function', () => {
    const out = mq(
      group(exprRule({ operator: '=' }, { lhs: fn('bogus', field('a')), rhs: value(1, 'number') }))
    );
    expect(JSON.stringify(out)).not.toContain('bogus');
  });

  it('defers to stock processor without expressions and for plain-value between', () => {
    const plain = group({ field: 'x', operator: '=', value: '1' } as RuleType);
    expect(mq(plain)).toEqual(formatQuery(plain, { format: 'mongodb_query' }));
    // Between with plain-value bounds (no expression rhs) defers to the stock processor.
    const plainBetween = group(
      exprRule({ operator: 'between', value: ['1', '5'] }, { lhs: fn('abs', field('d')) })
    );
    expect(mq(plainBetween)).toEqual(formatQuery(plainBetween, { format: 'mongodb_query' }));
  });

  it('uses plain-field lhs when only rhs is an expression', () => {
    expect(
      mq(group(exprRule({ operator: '=', field: 'x' }, { rhs: fn('abs', field('d')) })))
    ).toEqual({ $expr: { $eq: ['$x', { $abs: '$d' }] } });
  });

  it('omits incomplete expression between', () => {
    // A between whose expression bounds are incomplete (rhs present, rhs2 missing) is omitted.
    const rule = {
      field: '(expression)',
      operator: 'between',
      valueSource: 'expression',
      value: [fn('abs', field('d'))],
      lhs: field('x'),
    } as unknown as RuleType;
    const out = mq(group(rule));
    expect(JSON.stringify(out)).not.toContain('$abs');
  });

  it('mongodb (deprecated) wrapper stringifies', () => {
    const q = group(
      exprRule(
        { operator: '>=' },
        { lhs: fn('multiply', field('price'), field('qty')), rhs: value(100, 'number') }
      )
    );
    const out = formatQuery(q, {
      format: 'mongodb',
      ruleProcessor: expressionRuleProcessorMongoDB,
    });
    expect(out).toContain('$multiply');
    expect(typeof out).toBe('string');
  });
});

describe('Drizzle processor', () => {
  const t = pgTable('t', {
    price: integer('price'),
    qty: integer('qty'),
    name: text('name'),
    d: integer('d'),
    a: integer('a'),
    b: integer('b'),
    n: integer('n'),
    total: integer('total'),
    expected: integer('expected'),
  });
  const columns: Record<string, unknown> = {
    price: t.price,
    qty: t.qty,
    name: t.name,
    d: t.d,
    a: t.a,
    b: t.b,
    n: t.n,
    total: t.total,
    expected: t.expected,
  };
  const context = { columns, drizzleOperators: dz };
  const dialect = new PgDialect();

  const dq = (q: RuleGroupType, preset: 'postgresql' | 'sqlite' = 'postgresql') => {
    const sqlObj = formatQuery(q, {
      format: 'drizzle',
      ruleProcessor: expressionRuleProcessorDrizzle,
      context,
      preset,
    }) as (c: unknown, o: unknown) => unknown;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return dialect.sqlToQuery(sqlObj(columns, dz) as any);
  };

  it('serializes arithmetic comparison', () => {
    const { sql, params } = dq(
      group(
        exprRule(
          { operator: '>=' },
          { lhs: fn('multiply', field('price'), field('qty')), rhs: value(100, 'number') }
        )
      )
    );
    expect(sql).toBe('("t"."price" * "t"."qty") >= $1');
    expect(params).toEqual([100]);
  });

  it('serializes abs between', () => {
    const { sql, params } = dq(
      group(
        exprRule(
          { operator: 'between' },
          { lhs: fn('abs', field('d')), rhs: value(1, 'number'), rhs2: value(5, 'number') }
        )
      )
    );
    expect(sql).toBe('abs("t"."d") between $1 and $2');
    expect(params).toEqual([1, 5]);
  });

  it('serializes upper equality', () => {
    const { sql } = dq(
      group(exprRule({ operator: '=', value: 'ACME' }, { lhs: fn('upper', field('name')) }))
    );
    expect(sql).toBe('upper("t"."name") = $1');
  });

  it('serializes least/greatest and sqlite min/max', () => {
    expect(
      dq(
        group(
          exprRule(
            { operator: '<' },
            { lhs: fn('min', field('a'), field('b')), rhs: value(5, 'number') }
          )
        )
      ).sql
    ).toBe('least("t"."a", "t"."b") < $1');
    expect(
      dq(
        group(
          exprRule(
            { operator: '<' },
            { lhs: fn('min', field('a'), field('b')), rhs: value(5, 'number') }
          )
        ),
        'sqlite'
      ).sql
    ).toBe('min("t"."a", "t"."b") < $1');
  });

  it('serializes null/notnull', () => {
    expect(
      dq(group(exprRule({ operator: 'null' }, { lhs: fn('add', field('a'), field('b')) }))).sql
    ).toBe('("t"."a" + "t"."b") is null');
    expect(
      dq(group(exprRule({ operator: 'notnull' }, { lhs: fn('add', field('a'), field('b')) }))).sql
    ).toBe('("t"."a" + "t"."b") is not null');
  });

  it('serializes field-sourced rhs', () => {
    const { sql } = dq(
      group(
        exprRule(
          { operator: '=', valueSource: 'field', value: 'expected' },
          { lhs: fn('abs', field('d')) }
        )
      )
    );
    expect(sql).toBe('abs("t"."d") = "t"."expected"');
  });

  it('omits (undefined) when expression uses an unknown function', () => {
    const out = formatQuery(
      group(exprRule({ operator: '=' }, { lhs: fn('bogus', field('a')), rhs: value(1, 'number') })),
      {
        format: 'drizzle',
        ruleProcessor: expressionRuleProcessorDrizzle,
        context,
        preset: 'postgresql',
      }
    );
    // Rule omitted → group still yields a callable Drizzle builder (no `bogus`).
    expect(out).toBeDefined();
  });
});
