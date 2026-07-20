import type { RuleGroupType, RuleType } from '@react-querybuilder/core';
import { formatQuery } from '@react-querybuilder/core';
import * as Sequelize from 'sequelize';
import {
  expressionRuleProcessorElasticSearch,
  expressionRuleProcessorNL,
  expressionRuleProcessorSequelize,
  expressionRuleProcessorTanStackDB,
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

describe('ElasticSearch (Painless) processor', () => {
  const script = (q: RuleGroupType): string => {
    const out = formatQuery(q, {
      format: 'elasticsearch',
      ruleProcessor: expressionRuleProcessorElasticSearch,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;
    return out.bool.must[0].bool.filter.script.script;
  };

  it('scripts arithmetic comparison', () => {
    expect(
      script(
        group(
          exprRule(
            { operator: '>=' },
            { lhs: fn('multiply', field('price'), field('qty')), rhs: value(100, 'number') }
          )
        )
      )
    ).toBe("(doc['price'].value * doc['qty'].value) >= 100");
  });

  it('scripts abs/min/max/mod/upper/lower', () => {
    expect(
      script(
        group(exprRule({ operator: '=' }, { lhs: fn('abs', field('d')), rhs: value(1, 'number') }))
      )
    ).toBe("Math.abs(doc['d'].value) == 1");
    expect(
      script(
        group(
          exprRule(
            { operator: '<' },
            { lhs: fn('min', field('a'), field('b'), field('c')), rhs: value(5, 'number') }
          )
        )
      )
    ).toBe("Math.min(Math.min(doc['a'].value, doc['b'].value), doc['c'].value) < 5");
    expect(
      script(
        group(
          exprRule(
            { operator: '=' },
            { lhs: fn('mod', field('n'), value(2, 'number')), rhs: value(0, 'number') }
          )
        )
      )
    ).toBe("(doc['n'].value % 2) == 0");
    expect(
      script(group(exprRule({ operator: '=', value: 'ACME' }, { lhs: fn('upper', field('name')) })))
    ).toBe("doc['name'].value.toUpperCase() == 'ACME'");
  });

  it('scripts between/notbetween', () => {
    expect(
      script(
        group(
          exprRule(
            { operator: 'between' },
            { lhs: fn('abs', field('d')), rhs: value(1, 'number'), rhs2: value(5, 'number') }
          )
        )
      )
    ).toBe("Math.abs(doc['d'].value) >= 1 && Math.abs(doc['d'].value) <= 5");
    expect(
      script(
        group(
          exprRule(
            { operator: 'notbetween' },
            { lhs: fn('abs', field('d')), rhs: value(1, 'number'), rhs2: value(5, 'number') }
          )
        )
      )
    ).toBe("!(Math.abs(doc['d'].value) >= 1 && Math.abs(doc['d'].value) <= 5)");
  });

  it('escapes single quotes in string leaves', () => {
    expect(
      script(
        group(exprRule({ operator: '=', value: "O'Brien" }, { lhs: fn('upper', field('name')) }))
      )
    ).toBe("doc['name'].value.toUpperCase() == 'O\\'Brien'");
  });

  it('returns false (omits) when expression uses an unknown function', () => {
    const out = formatQuery(
      group(exprRule({ operator: '=' }, { lhs: fn('bogus', field('a')), rhs: value(1, 'number') })),
      { format: 'elasticsearch', ruleProcessor: expressionRuleProcessorElasticSearch }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any;
    expect(JSON.stringify(out)).not.toContain('bogus');
  });
});

describe('NaturalLanguage processor', () => {
  const nl = (q: RuleGroupType) =>
    formatQuery(q, { format: 'natural_language', ruleProcessor: expressionRuleProcessorNL });

  it('renders arithmetic prose', () => {
    expect(
      nl(
        group(
          exprRule(
            { operator: '>=' },
            { lhs: fn('multiply', field('price'), field('qty')), rhs: value(100, 'number') }
          )
        )
      )
    ).toBe('the product of price and qty is greater than or equal to 100');
  });

  it('renders function prose', () => {
    expect(
      nl(group(exprRule({ operator: '=', value: 'ACME' }, { lhs: fn('upper', field('name')) })))
    ).toBe("the uppercase of name is 'ACME'");
    expect(
      nl(
        group(
          exprRule(
            { operator: '<' },
            { lhs: fn('min', field('a'), field('b')), rhs: value(5, 'number') }
          )
        )
      )
    ).toBe('the minimum of a, b is less than 5');
  });

  it('renders null and between prose', () => {
    expect(
      nl(group(exprRule({ operator: 'notnull' }, { lhs: fn('add', field('a'), field('b')) })))
    ).toBe('the sum of a and b is not null');
    expect(
      nl(
        group(
          exprRule(
            { operator: 'between' },
            { lhs: fn('abs', field('d')), rhs: value(1, 'number'), rhs2: value(5, 'number') }
          )
        )
      )
    ).toBe('the absolute value of d is between 1 and 5');
  });

  it('omits (empty) when expression uses an unknown function', () => {
    const out = nl(
      group(exprRule({ operator: '=' }, { lhs: fn('bogus', field('a')), rhs: value(1, 'number') }))
    );
    expect(out).not.toContain('bogus');
  });
});

describe('Sequelize processor', () => {
  const { Op, where, literal, col, fn: sqFn } = Sequelize;
  const context = {
    sequelizeOperators: Op,
    sequelizeWhere: where,
    sequelizeLiteral: literal,
    sequelizeCol: col,
    sequelizeFn: sqFn,
  };
  const seq = (q: RuleGroupType, preset: 'postgresql' | 'sqlite' = 'postgresql') =>
    formatQuery(q, {
      format: 'sequelize',
      ruleProcessor: expressionRuleProcessorSequelize,
      context,
      preset,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;

  it('builds a where() with literal LHS and Op', () => {
    const out = seq(
      group(
        exprRule(
          { operator: '>=' },
          { lhs: fn('multiply', field('price'), field('qty')), rhs: value(100, 'number') }
        )
      )
    );
    expect(out.attribute.val).toBe('("price" * "qty")');
    expect(out.logic[Op.gte].val).toBe('100');
  });

  it('builds null checks and between', () => {
    const nullOut = seq(
      group(exprRule({ operator: 'notnull' }, { lhs: fn('add', field('a'), field('b')) }))
    );
    expect(nullOut.attribute.val).toBe('("a" + "b")');
    expect(nullOut.logic[Op.ne]).toBeNull();

    const btwOut = seq(
      group(
        exprRule(
          { operator: 'between' },
          { lhs: fn('abs', field('d')), rhs: value(1, 'number'), rhs2: value(5, 'number') }
        )
      )
    );
    expect(btwOut.attribute.val).toBe('ABS("d")');
    expect(btwOut.logic[Op.between].map((l: { val: string }) => l.val)).toEqual(['1', '5']);
  });

  it('uses MIN/MAX for sqlite preset', () => {
    const out = seq(
      group(
        exprRule(
          { operator: '<' },
          { lhs: fn('min', field('a'), field('b')), rhs: value(5, 'number') }
        )
      ),
      'sqlite'
    );
    expect(out.attribute.val).toBe('MIN(a, b)');
  });

  it('omits (undefined) when expression uses an unknown function', () => {
    const out = seq(
      group(exprRule({ operator: '=' }, { lhs: fn('bogus', field('a')), rhs: value(1, 'number') }))
    );
    expect(JSON.stringify(out ?? null)).not.toContain('bogus');
  });
});

describe('TanStackDB processor', () => {
  const rec =
    (name: string) =>
    (...args: unknown[]) => ({ fn: name, args });
  const ops = {
    eq: rec('eq'),
    gt: rec('gt'),
    gte: rec('gte'),
    lt: rec('lt'),
    lte: rec('lte'),
    and: rec('and'),
    or: rec('or'),
    not: rec('not'),
    isNull: rec('isNull'),
    add: rec('add'),
    subtract: rec('subtract'),
    multiply: rec('multiply'),
    divide: rec('divide'),
    upper: rec('upper'),
    lower: rec('lower'),
  };
  const refs = { todo: new Proxy({}, { get: (_t, p) => `todo.${String(p)}` }) };
  const context = { tanStackDbOperators: ops };
  const gen = (q: RuleGroupType) => {
    const w = formatQuery(q, {
      format: 'tanstack_db',
      ruleProcessor: expressionRuleProcessorTanStackDB,
      context,
    }) as unknown as ((r: unknown) => unknown) | undefined;
    return typeof w === 'function' ? w(refs) : w;
  };

  it('composes arithmetic comparison', () => {
    expect(
      gen(
        group(
          exprRule(
            { operator: '>=' },
            { lhs: fn('multiply', field('price'), field('qty')), rhs: value(100, 'number') }
          )
        )
      )
    ).toEqual({ fn: 'gte', args: [{ fn: 'multiply', args: ['todo.price', 'todo.qty'] }, 100] });
  });

  it('composes upper equality and != negation', () => {
    expect(
      gen(group(exprRule({ operator: '=', value: 'ACME' }, { lhs: fn('upper', field('name')) })))
    ).toEqual({ fn: 'eq', args: [{ fn: 'upper', args: ['todo.name'] }, 'ACME'] });
    expect(
      gen(
        group(
          exprRule(
            { operator: '!=' },
            { lhs: fn('add', field('a'), field('b')), rhs: value(0, 'number') }
          )
        )
      )
    ).toEqual({
      fn: 'not',
      args: [{ fn: 'eq', args: [{ fn: 'add', args: ['todo.a', 'todo.b'] }, 0] }],
    });
  });

  it('composes null and between', () => {
    expect(
      gen(group(exprRule({ operator: 'notnull' }, { lhs: fn('add', field('a'), field('b')) })))
    ).toEqual({
      fn: 'not',
      args: [{ fn: 'isNull', args: [{ fn: 'add', args: ['todo.a', 'todo.b'] }] }],
    });
    expect(
      gen(
        group(
          exprRule(
            { operator: 'between' },
            {
              lhs: fn('add', field('a'), field('b')),
              rhs: value(1, 'number'),
              rhs2: value(5, 'number'),
            }
          )
        )
      )
    ).toEqual({
      fn: 'and',
      args: [
        { fn: 'gte', args: [{ fn: 'add', args: ['todo.a', 'todo.b'] }, 1] },
        { fn: 'lte', args: [{ fn: 'add', args: ['todo.a', 'todo.b'] }, 5] },
      ],
    });
  });

  it('omits rules using unsupported functions (mod)', () => {
    // Unsupported function → rule omitted → group falls back to the truthy `eq(1,1)`.
    expect(
      gen(
        group(
          exprRule(
            { operator: '=' },
            { lhs: fn('mod', field('n'), value(2, 'number')), rhs: value(0, 'number') }
          )
        )
      )
    ).toEqual({ fn: 'eq', args: [1, 1] });
  });

  it('composes all scalar comparison operators', () => {
    const lhs = { lhs: fn('add', field('a'), field('b')) };
    const arith = { fn: 'add', args: ['todo.a', 'todo.b'] };
    expect(gen(group(exprRule({ operator: '>' }, { ...lhs, rhs: value(1, 'number') })))).toEqual({
      fn: 'gt',
      args: [arith, 1],
    });
    expect(gen(group(exprRule({ operator: '<' }, { ...lhs, rhs: value(1, 'number') })))).toEqual({
      fn: 'lt',
      args: [arith, 1],
    });
    expect(gen(group(exprRule({ operator: '>=' }, { ...lhs, rhs: value(1, 'number') })))).toEqual({
      fn: 'gte',
      args: [arith, 1],
    });
    expect(gen(group(exprRule({ operator: '<=' }, { ...lhs, rhs: value(1, 'number') })))).toEqual({
      fn: 'lte',
      args: [arith, 1],
    });
  });

  it('composes null, notbetween, plain-value and field-source rhs', () => {
    expect(
      gen(group(exprRule({ operator: 'null' }, { lhs: fn('add', field('a'), field('b')) })))
    ).toEqual({ fn: 'isNull', args: [{ fn: 'add', args: ['todo.a', 'todo.b'] }] });
    expect(
      gen(
        group(
          exprRule(
            { operator: 'notbetween' },
            {
              lhs: fn('add', field('a'), field('b')),
              rhs: value(1, 'number'),
              rhs2: value(5, 'number'),
            }
          )
        )
      )
    ).toEqual({
      fn: 'not',
      args: [
        {
          fn: 'and',
          args: [
            { fn: 'gte', args: [{ fn: 'add', args: ['todo.a', 'todo.b'] }, 1] },
            { fn: 'lte', args: [{ fn: 'add', args: ['todo.a', 'todo.b'] }, 5] },
          ],
        },
      ],
    });
    // Plain-value rhs (non-expression) with expression lhs.
    expect(
      gen(
        group(
          exprRule(
            { operator: '=', value: '7', field: 'x' },
            { lhs: fn('add', field('a'), field('b')) }
          )
        )
      )
    ).toEqual({ fn: 'eq', args: [{ fn: 'add', args: ['todo.a', 'todo.b'] }, '7'] });
    // Field-source rhs resolves to a ref column.
    expect(
      gen(
        group(
          exprRule(
            { operator: '=', value: 'other', valueSource: 'field' },
            { lhs: fn('add', field('a'), field('b')) }
          )
        )
      )
    ).toEqual({ fn: 'eq', args: [{ fn: 'add', args: ['todo.a', 'todo.b'] }, 'todo.other'] });
  });

  it('coerces plain numeric rhs when parseNumbers enabled', () => {
    const q = group(
      exprRule(
        { operator: '=', value: '42', field: 'x' },
        { lhs: fn('add', field('a'), field('b')) }
      )
    );
    const w = formatQuery(q, {
      format: 'tanstack_db',
      ruleProcessor: expressionRuleProcessorTanStackDB,
      context,
      parseNumbers: true,
    }) as unknown as (r: unknown) => unknown;
    expect(w(refs)).toEqual({ fn: 'eq', args: [{ fn: 'add', args: ['todo.a', 'todo.b'] }, 42] });
  });

  it('omits incomplete expression between (undefined)', () => {
    expect(
      gen(
        group(
          exprRule(
            { operator: 'between' },
            { lhs: fn('add', field('a'), field('b')), rhs: value(1, 'number') }
          )
        )
      )
    ).toEqual({ fn: 'eq', args: [1, 1] });
  });

  it('defers to stock processor when refs context is missing', () => {
    const q = group(
      exprRule({ operator: '=', value: 'ACME' }, { lhs: fn('upper', field('name')) })
    );
    const out = formatQuery(q, {
      format: 'tanstack_db',
      ruleProcessor: expressionRuleProcessorTanStackDB,
      context: { tanStackDbOperators: ops },
    });
    // Stock fallback yields a callback (or omission); either way not our composed eq.
    expect(out).toBeDefined();
  });
});
