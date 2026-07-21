import type { RuleType } from '@react-querybuilder/core';
import * as dz from 'drizzle-orm';
import { integer, pgTable, text } from 'drizzle-orm/pg-core';
import * as Sequelize from 'sequelize';
import {
  expressionRuleProcessorDrizzle,
  expressionRuleProcessorElasticSearch,
  expressionRuleProcessorMongoDB,
  expressionRuleProcessorMongoDBQuery,
  expressionRuleProcessorNL,
  expressionRuleProcessorSequelize,
  expressionRuleProcessorTanStackDB,
  getExpressionRuleProcessorDrizzle,
  getExpressionRuleProcessorElasticSearch,
  getExpressionRuleProcessorMongoDBQuery,
  getExpressionRuleProcessorNL,
  getExpressionRuleProcessorSequelize,
  getExpressionRuleProcessorTanStackDB,
} from '../index';
import type { ExpressionNode } from '../types';

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

const rule = (r: Partial<RuleType> & { operator: string }): RuleType =>
  ({ field: '(expression)', value: '', ...r }) as RuleType;

// Exercise option-default and secondary branches by calling each processor directly.

describe('NL processor branches', () => {
  const p = expressionRuleProcessorNL;
  it('defaults options and defers without expressions', () => {
    // No options → `options ?? {}`; no expression → stock fallback.
    expect(typeof p({ field: 'x', operator: '=', value: '1' } as RuleType)).toBe('string');
  });

  it('renders plain-value object with custom quoting and expression lhs', () => {
    const out = p(
      rule({ field: 'price', operator: '=', value: 'ACME', lhs: fn('upper', field('name')) }),
      { quoteFieldNamesWith: ['[', ']'], fieldIdentifierSeparator: '.', quoteValuesWith: '"' }
    );
    expect(out).toContain('the uppercase of [name]');
    expect(out).toContain('"ACME"');
  });

  it('uses plain-field subject when only rhs is an expression', () => {
    const out = p(
      rule({ field: 'x', operator: '=', valueSource: 'expression', value: fn('abs', field('d')) })
    );
    expect(out).toContain('the absolute value of d');
  });

  it('omits incomplete expression between', () => {
    const out = p(
      rule({
        field: 'q',
        operator: 'between',
        valueSource: 'expression',
        value: [fn('abs', field('d'))] as unknown,
      })
    );
    expect(out).toBe('');
  });

  it('renders a string-match with an expression RHS', () => {
    const out = p(
      rule({
        field: 'q',
        operator: 'endsWith',
        valueSource: 'expression',
        value: fn('upper', field('n')),
        lhs: fn('abs', field('d')),
      })
    );
    expect(out).toBe('the absolute value of d ends with the uppercase of n');
  });

  it('defers a genuinely-unsupported operator (e.g. `in`)', () => {
    const out = p(rule({ field: 'q', operator: 'in', value: 'a,b', lhs: fn('abs', field('d')) }));
    expect(out).not.toContain('the absolute value');
  });
});

describe('ElasticSearch processor branches', () => {
  const p = expressionRuleProcessorElasticSearch;
  it('defaults options and defers without expressions', () => {
    expect(p({ field: 'x', operator: '=', value: '1' } as RuleType)).toBeDefined();
  });

  it('defers for null operator (not expressible as a script)', () => {
    const out = p(rule({ field: 'x', operator: 'null', lhs: fn('abs', field('d')) }));
    // Stock fallback shape, not a Painless script comparison.
    expect(JSON.stringify(out)).not.toContain('Math.abs');
  });

  it('uses plain-field lhs when only rhs is an expression', () => {
    const out = p(
      rule({ field: 'x', operator: '=', valueSource: 'expression', value: fn('abs', field('d')) })
    );
    expect(out.bool.filter.script.script).toContain("doc['x'].value");
  });

  it('scripts field-source rhs', () => {
    const out = p(
      rule({
        field: 'x',
        operator: '=',
        valueSource: 'field',
        value: 'y',
        lhs: fn('abs', field('d')),
      })
    );
    expect(out.bool.filter.script.script).toContain("doc['y'].value");
  });

  it('scripts plain-value rhs leaf', () => {
    const out = p(rule({ field: 'x', operator: '=', value: 'lit', lhs: fn('abs', field('d')) }));
    expect(out.bool.filter.script.script).toContain("'lit'");
  });

  it('scripts a string-match via Painless String methods (with negation)', () => {
    const contains = p(
      rule({
        field: 'x',
        operator: 'contains',
        valueSource: 'expression',
        value: fn('upper', field('n')),
        lhs: fn('abs', field('d')),
      })
    );
    expect(contains.bool.filter.script.script).toBe(
      "Math.abs(doc['d'].value).contains(doc['n'].value.toUpperCase())"
    );
    const notBegins = p(
      rule({ field: 'x', operator: 'doesNotBeginWith', value: 'lit', lhs: fn('abs', field('d')) })
    );
    expect(notBegins.bool.filter.script.script).toBe(
      "!(Math.abs(doc['d'].value).startsWith('lit'))"
    );
  });

  it('omits incomplete expression between (false)', () => {
    const out = p(
      rule({
        field: 'q',
        operator: 'between',
        valueSource: 'expression',
        value: [fn('abs', field('d'))] as unknown,
      })
    );
    expect(out).toBe(false);
  });
});

describe('Drizzle processor branches', () => {
  const p = expressionRuleProcessorDrizzle;
  const t = pgTable('t', {
    a: integer('a'),
    d: integer('d'),
    name: text('name'),
    expected: integer('expected'),
  });
  const columns: Record<string, unknown> = { a: t.a, d: t.d, name: t.name, expected: t.expected };
  const context = { columns, drizzleOperators: dz };

  it('defaults options and defers without context', () => {
    // No options → defaults; expression present but no context → stock fallback (undefined).
    expect(
      p(
        rule({
          operator: '=',
          lhs: fn('abs', field('d')),
          valueSource: 'expression',
          value: value(1),
        })
      )
    ).toBeUndefined();
  });

  it('returns undefined when expression uses an unknown function', () => {
    const out = p(
      rule({
        operator: '=',
        lhs: fn('bogus', field('a')),
        valueSource: 'expression',
        value: value(1),
      }),
      { context, preset: 'postgresql' }
    );
    expect(out).toBeUndefined();
  });

  it('defers when a plain-field lhs is missing from columns', () => {
    const out = p(
      rule({
        field: 'missing',
        operator: '=',
        valueSource: 'expression',
        value: fn('abs', field('d')),
      }),
      { context, preset: 'postgresql' }
    );
    // lhs resolved from columns.missing → undefined → stock fallback.
    expect(out).toBeUndefined();
  });

  it('renders string-match via SQL like + wildcard concat (all kinds + negation)', () => {
    const dialect = new (require('drizzle-orm/pg-core').PgDialect)();
    const sqlOf = (r: RuleType) =>
      dialect.sqlToQuery(p(r, { context, preset: 'postgresql' }) as never).sql;
    const lhs = fn('upper', field('name'));
    expect(sqlOf(rule({ operator: 'contains', value: 'x', lhs }))).toContain(
      `like '%' || $1 || '%'`
    );
    expect(sqlOf(rule({ operator: 'beginsWith', value: 'x', lhs }))).toContain(`like $1 || '%'`);
    expect(sqlOf(rule({ operator: 'endsWith', value: 'x', lhs }))).toContain(`like '%' || $1`);
    expect(sqlOf(rule({ operator: 'doesNotContain', value: 'x', lhs }))).toContain(`not like`);
  });

  it('defers a genuinely-unsupported operator (e.g. `in`) to the stock processor', () => {
    // `in` isn't a scalar/between/string-match op here, so it falls through to stock (which
    // handles it, ignoring the expression LHS).
    const out = p(
      rule({ field: 'name', operator: 'in', value: 'a,b', lhs: fn('upper', field('name')) }),
      { context, preset: 'postgresql' }
    );
    const dialect = new (require('drizzle-orm/pg-core').PgDialect)();
    expect(dialect.sqlToQuery(out as never).sql).not.toContain('upper');
  });

  it('serializes field-source and parsed-number rhs', () => {
    const dialect = new (require('drizzle-orm/pg-core').PgDialect)();
    const fieldSrc = p(
      rule({ operator: '=', valueSource: 'field', value: 'expected', lhs: fn('abs', field('d')) }),
      { context, preset: 'postgresql' }
    );
    expect(dialect.sqlToQuery(fieldSrc).sql).toContain('"t"."expected"');
    const parsed = p(rule({ operator: '=', value: '42', lhs: fn('abs', field('d')) }), {
      context,
      preset: 'postgresql',
      parseNumbers: true,
    });
    expect(dialect.sqlToQuery(parsed).params).toContain(42);
  });
});

describe('Sequelize processor branches', () => {
  const p = expressionRuleProcessorSequelize;
  const { Op, where, literal, col, fn: sqFn } = Sequelize;
  const context = {
    sequelizeOperators: Op,
    sequelizeWhere: where,
    sequelizeLiteral: literal,
    sequelizeCol: col,
    sequelizeFn: sqFn,
  };

  it('defaults options and defers without expressions', () => {
    expect(p({ field: 'x', operator: '=', value: '1' } as RuleType)).toBeUndefined();
  });

  it('defers when required context helpers are missing', () => {
    const out = p(
      rule({
        operator: '=',
        lhs: fn('abs', field('d')),
        valueSource: 'expression',
        value: value(1),
      }),
      {}
    );
    expect(out).toBeUndefined();
  });

  it('renders a plain-value string-match via Op.like with a wildcard pattern', () => {
    const lhs = fn('abs', field('d'));
    expect(p(rule({ operator: 'contains', value: 'x', lhs }), { context }).logic[Op.like]).toBe(
      '%x%'
    );
    expect(p(rule({ operator: 'beginsWith', value: 'x', lhs }), { context }).logic[Op.like]).toBe(
      'x%'
    );
    expect(p(rule({ operator: 'endsWith', value: 'x', lhs }), { context }).logic[Op.like]).toBe(
      '%x'
    );
    // Negation → Op.notLike.
    expect(
      p(rule({ operator: 'doesNotContain', value: 'x', lhs }), { context }).logic[Op.notLike]
    ).toBe('%x%');
  });

  it('renders an expression-RHS string-match with a concatenated literal pattern', () => {
    const lhs = fn('abs', field('d'));
    const like = (op: string) =>
      JSON.stringify(
        p(rule({ operator: op, valueSource: 'expression', value: fn('upper', field('n')), lhs }), {
          context,
        }).logic[Op.like]
      );
    expect(like('contains')).toContain("'%' || UPPER(n) || '%'");
    expect(like('beginsWith')).toContain("UPPER(n) || '%'");
    expect(like('endsWith')).toContain("'%' || UPPER(n)");
  });

  it('omits a field-source string-match (not expressible as a literal pattern)', () => {
    const out = p(
      rule({ operator: 'endsWith', valueSource: 'field', value: 'y', lhs: fn('abs', field('d')) }),
      { context }
    );
    expect(out).toBeUndefined();
  });

  it('defers a genuinely-unsupported operator (e.g. `in`) to the stock processor', () => {
    const out = p(rule({ operator: 'in', value: 'a,b', lhs: fn('abs', field('d')) }), { context });
    // Stock fallback: does not build our literal ABS expression.
    expect(JSON.stringify(out ?? null)).not.toContain('ABS');
  });

  it('uses col() for a plain-field lhs when only rhs is an expression', () => {
    const out = p(
      rule({ field: 'x', operator: '=', valueSource: 'expression', value: fn('abs', field('d')) }),
      { context }
    );
    expect(out.attribute.col).toBe('x');
  });

  it('uses col() for a field-source rhs', () => {
    const out = p(
      rule({ operator: '=', valueSource: 'field', value: 'y', lhs: fn('abs', field('d')) }),
      { context }
    );
    expect(out.logic[Op.eq].col).toBe('y');
  });

  it('parses numeric plain-value rhs and reads array value[0]', () => {
    const out = p(
      rule({ operator: '=', value: ['42', 'ignored'] as unknown, lhs: fn('abs', field('d')) }),
      { context, parseNumbers: true }
    );
    expect(out.logic[Op.eq]).toBe(42);
  });

  it('omits incomplete expression between (undefined)', () => {
    const out = p(
      rule({
        field: 'q',
        operator: 'between',
        valueSource: 'expression',
        value: [fn('abs', field('d'))] as unknown,
      }),
      { context }
    );
    expect(out).toBeUndefined();
  });
});

describe('MongoDBQuery processor branches', () => {
  it('defaults options when called without them', () => {
    const out = expressionRuleProcessorMongoDBQuery(
      rule({
        operator: '=',
        lhs: fn('abs', field('d')),
        valueSource: 'expression',
        value: value(1),
      })
    );
    expect(out).toEqual({ $expr: { $eq: [{ $abs: '$d' }, 1] } });
  });
});

describe('TanStackDB processor branches', () => {
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
  const context = {
    tanStackDbOperators: ops,
    _tanstackDbRefs: refs,
    _tanstackDbPrimaryRef: 'todo',
  };

  it('composes an expression when refs context is present', () => {
    const out = expressionRuleProcessorTanStackDB(
      rule({ operator: '=', value: 'ACME', lhs: fn('upper', field('name')) }),
      { context }
    );
    expect(out).toEqual({ fn: 'eq', args: [{ fn: 'upper', args: ['todo.name'] }, 'ACME'] });
  });

  it('resolves a dotted field via a matching ref prefix', () => {
    const out = expressionRuleProcessorTanStackDB(
      rule({ operator: '=', value: 'ACME', lhs: fn('upper', field('todo.name')) }),
      { context }
    );
    expect(out).toEqual({ fn: 'eq', args: [{ fn: 'upper', args: ['todo.name'] }, 'ACME'] });
  });

  it('omits (undefined) when an expression bound uses an unknown function', () => {
    const out = expressionRuleProcessorTanStackDB(
      rule({
        operator: '=',
        lhs: fn('bogus', field('name')),
        valueSource: 'expression',
        value: value(1),
      }),
      { context }
    );
    expect(out).toBeUndefined();
  });

  it('composes notbetween', () => {
    const out = expressionRuleProcessorTanStackDB(
      rule({
        operator: 'notbetween',
        lhs: fn('add', field('a'), field('b')),
        valueSource: 'expression',
        value: [value(1, 'number'), value(5, 'number')] as unknown,
      }),
      { context }
    );
    expect(out.fn).toBe('not');
  });

  it('merges custom serializers', () => {
    const proc = getExpressionRuleProcessorTanStackDB({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      add: (o: any, _opt: unknown, a: unknown, b: unknown) => o.add(a, b),
    });
    const out = proc(rule({ operator: '=', value: '1', lhs: fn('add', field('a'), field('b')) }), {
      context,
    });
    expect(out).toEqual({ fn: 'eq', args: [{ fn: 'add', args: ['todo.a', 'todo.b'] }, '1'] });
  });
});

describe('custom-serializer merge and remaining variants', () => {
  const t = pgTable('t2', { a: integer('a'), b: integer('b'), d: integer('d') });
  const drizzleContext = { columns: { a: t.a, b: t.b, d: t.d }, drizzleOperators: dz };
  const { Op, where, literal, col, fn: sqFn } = Sequelize;
  const seqContext = {
    sequelizeOperators: Op,
    sequelizeWhere: where,
    sequelizeLiteral: literal,
    sequelizeCol: col,
    sequelizeFn: sqFn,
  };

  it('Drizzle: custom serializers, null/notnull, and notbetween', () => {
    const proc = getExpressionRuleProcessorDrizzle({ add: (sql, _o, a, b) => sql`(${a} + ${b})` });
    expect(
      proc(rule({ operator: '=', value: '1', lhs: fn('add', field('a'), field('b')) }), {
        context: drizzleContext,
        preset: 'postgresql',
      })
    ).toBeDefined();
    expect(
      expressionRuleProcessorDrizzle(
        rule({ operator: 'null', lhs: fn('add', field('a'), field('b')) }),
        { context: drizzleContext }
      )
    ).toBeDefined();
    expect(
      expressionRuleProcessorDrizzle(
        rule({ operator: 'notnull', lhs: fn('add', field('a'), field('b')) }),
        { context: drizzleContext }
      )
    ).toBeDefined();
    // String-match with an expression LHS now renders natively (SQL like + wildcard concat).
    expect(
      expressionRuleProcessorDrizzle(
        rule({ operator: 'contains', value: 'x', lhs: fn('add', field('a'), field('b')) }),
        { context: drizzleContext }
      )
    ).toBeDefined();
    expect(
      expressionRuleProcessorDrizzle(
        rule({
          operator: 'notbetween',
          lhs: fn('add', field('a'), field('b')),
          valueSource: 'expression',
          value: [value(1, 'number'), value(5, 'number')] as unknown,
        }),
        { context: drizzleContext, preset: 'postgresql' }
      )
    ).toBeDefined();
  });

  it('ElasticSearch: custom serializers and notbetween', () => {
    const proc = getExpressionRuleProcessorElasticSearch({ add: (_o, a, b) => `(${a} + ${b})` });
    expect(
      proc(rule({ operator: '=', value: '1', lhs: fn('add', field('a'), field('b')) }))
    ).toBeDefined();
    const nb = expressionRuleProcessorElasticSearch(
      rule({
        operator: 'notbetween',
        lhs: fn('abs', field('d')),
        valueSource: 'expression',
        value: [value(1, 'number'), value(5, 'number')] as unknown,
      })
    );
    expect(nb.bool.filter.script.script).toContain('!(');
  });

  it('MongoDBQuery: custom serializers and string field-source rhs', () => {
    const proc = getExpressionRuleProcessorMongoDBQuery({ add: (_o, a, b) => ({ $add: [a, b] }) });
    expect(
      proc(rule({ operator: '=', value: '1', lhs: fn('add', field('a'), field('b')) }))
    ).toEqual({ $expr: { $eq: [{ $add: ['$a', '$b'] }, '1'] } });
  });

  it('NL: custom serializers and notbetween prose', () => {
    const proc = getExpressionRuleProcessorNL({ add: (_o, a, b) => `the sum of ${a} and ${b}` });
    expect(
      proc(rule({ operator: '=', value: '1', lhs: fn('add', field('a'), field('b')) }))
    ).toContain('the sum of');
    expect(
      expressionRuleProcessorNL(
        rule({
          operator: 'notbetween',
          lhs: fn('abs', field('d')),
          valueSource: 'expression',
          value: [value(1, 'number'), value(5, 'number')] as unknown,
        })
      )
    ).toContain('is not between');
  });

  it('Sequelize: custom serializers, null Op.eq, and notbetween', () => {
    const proc = getExpressionRuleProcessorSequelize({ add: (_o, a, b) => `(${a} + ${b})` });
    expect(
      proc(rule({ operator: '=', value: '1', lhs: fn('add', field('a'), field('b')) }), {
        context: seqContext,
      })
    ).toBeDefined();
    // null → Op.eq branch (notnull covered elsewhere → Op.ne).
    const nullOut = expressionRuleProcessorSequelize(
      rule({ operator: 'null', lhs: fn('add', field('a'), field('b')) }),
      { context: seqContext }
    );
    expect(nullOut.logic[Op.eq]).toBeNull();
    const nb = expressionRuleProcessorSequelize(
      rule({
        operator: 'notbetween',
        lhs: fn('abs', field('d')),
        valueSource: 'expression',
        value: [value(1, 'number'), value(5, 'number')] as unknown,
      }),
      { context: seqContext }
    );
    expect(nb.logic[Op.notBetween]).toBeDefined();
  });

  it('covers rhs2-only between short-circuit and incomplete-between omission', () => {
    // value = [null, node]: rhs falsy, rhs2 truthy → exercises `expr.rhs || expr.rhs2`.
    const rhs2Only = (v: unknown) =>
      rule({
        operator: 'between',
        lhs: fn('abs', field('d')),
        valueSource: 'expression',
        value: [null, v] as unknown,
      });
    expect(expressionRuleProcessorElasticSearch(rhs2Only(value(5, 'number')))).toBe(false);
    expect(expressionRuleProcessorNL(rhs2Only(value(5, 'number')))).toBe('');
    expect(
      expressionRuleProcessorSequelize(rhs2Only(value(5, 'number')), { context: seqContext })
    ).toBeUndefined();
    expect(
      expressionRuleProcessorDrizzle(rhs2Only(value(5, 'number')), {
        context: drizzleContext,
        preset: 'postgresql',
      })
    ).toBeUndefined();
  });

  it('Drizzle: defers plain (no-expression) rules and omits incomplete between', () => {
    // No expression at all → `!expr` branch → stock fallback.
    expect(
      expressionRuleProcessorDrizzle({ field: 'x', operator: '=', value: '1' } as RuleType, {
        context: drizzleContext,
      })
    ).toBeUndefined();
    // Incomplete expression between (rhs only) → undefined.
    expect(
      expressionRuleProcessorDrizzle(
        rule({
          operator: 'between',
          lhs: fn('abs', field('d')),
          valueSource: 'expression',
          value: [value(1, 'number')] as unknown,
        }),
        { context: drizzleContext, preset: 'postgresql' }
      )
    ).toBeUndefined();
  });

  it('MongoDBQuery: renders a plain non-numeric string rhs', () => {
    expect(
      expressionRuleProcessorMongoDBQuery(
        rule({ operator: '=', value: 'text', lhs: fn('abs', field('d')) })
      )
    ).toEqual({ $expr: { $eq: [{ $abs: '$d' }, 'text'] } });
  });

  it('MongoDBQuery: renders string-match via $indexOfCP/$substrCP (all kinds + negation)', () => {
    const lhs = fn('upper', field('n'));
    expect(
      expressionRuleProcessorMongoDBQuery(rule({ operator: 'contains', value: 'x', lhs }))
    ).toEqual({ $expr: { $gte: [{ $indexOfCP: [{ $toUpper: '$n' }, 'x'] }, 0] } });
    expect(
      expressionRuleProcessorMongoDBQuery(rule({ operator: 'doesNotContain', value: 'x', lhs }))
    ).toEqual({ $expr: { $eq: [{ $indexOfCP: [{ $toUpper: '$n' }, 'x'] }, -1] } });
    expect(
      expressionRuleProcessorMongoDBQuery(rule({ operator: 'beginsWith', value: 'x', lhs }))
    ).toEqual({
      $expr: { $eq: [{ $substrCP: [{ $toUpper: '$n' }, 0, { $strLenCP: 'x' }] }, 'x'] },
    });
    expect(
      expressionRuleProcessorMongoDBQuery(rule({ operator: 'doesNotBeginWith', value: 'x', lhs }))
    ).toEqual({
      $expr: { $ne: [{ $substrCP: [{ $toUpper: '$n' }, 0, { $strLenCP: 'x' }] }, 'x'] },
    });
    expect(
      expressionRuleProcessorMongoDBQuery(rule({ operator: 'endsWith', value: 'x', lhs }))
    ).toEqual({
      $expr: {
        $eq: [
          {
            $substrCP: [
              { $toUpper: '$n' },
              { $subtract: [{ $strLenCP: { $toUpper: '$n' } }, { $strLenCP: 'x' }] },
              { $strLenCP: 'x' },
            ],
          },
          'x',
        ],
      },
    });
    expect(
      expressionRuleProcessorMongoDBQuery(rule({ operator: 'doesNotEndWith', value: 'x', lhs }))
    ).toEqual({
      $expr: {
        $ne: [
          {
            $substrCP: [
              { $toUpper: '$n' },
              { $subtract: [{ $strLenCP: { $toUpper: '$n' } }, { $strLenCP: 'x' }] },
              { $strLenCP: 'x' },
            ],
          },
          'x',
        ],
      },
    });
  });

  it('NL: renders an expression string-match as subject/verb/object', () => {
    const out = expressionRuleProcessorNL(
      rule({ field: 'q', operator: 'contains', value: 'x', lhs: fn('abs', field('d')) })
    );
    expect(out).toBe(`the absolute value of d contains 'x'`);
  });

  it('TanStackDB: missing refs context, plain-field lhs, field-source and array-scalar rhs', () => {
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
      not: rec('not'),
      isNull: rec('isNull'),
      like: rec('like'),
      ilike: rec('ilike'),
      inArray: rec('inArray'),
      add: rec('add'),
      upper: rec('upper'),
    };
    const refs = { todo: new Proxy({}, { get: (_t, p) => `todo.${String(p)}` }) };
    const ctxFull = {
      tanStackDbOperators: ops,
      _tanstackDbRefs: refs,
      _tanstackDbPrimaryRef: 'todo',
    };
    // Missing refs → stock fallback (returns undefined here).
    expect(
      expressionRuleProcessorTanStackDB(
        rule({ operator: '=', value: '1', lhs: fn('add', field('a'), field('b')) }),
        { context: { tanStackDbOperators: ops } }
      )
    ).toBeUndefined();
    // Plain-field lhs (expr rhs only).
    expect(
      expressionRuleProcessorTanStackDB(
        rule({
          field: 'x',
          operator: '=',
          valueSource: 'expression',
          value: fn('add', field('a'), field('b')),
        }),
        { context: ctxFull }
      )
    ).toEqual({ fn: 'eq', args: ['todo.x', { fn: 'add', args: ['todo.a', 'todo.b'] }] });
    // Field-source rhs.
    expect(
      expressionRuleProcessorTanStackDB(
        rule({
          operator: '=',
          valueSource: 'field',
          value: 'other',
          lhs: fn('add', field('a'), field('b')),
        }),
        { context: ctxFull }
      )
    ).toEqual({ fn: 'eq', args: [{ fn: 'add', args: ['todo.a', 'todo.b'] }, 'todo.other'] });
    // Array-valued scalar rhs → reads value[0].
    expect(
      expressionRuleProcessorTanStackDB(
        rule({
          operator: '=',
          value: ['7', 'x'] as unknown,
          lhs: fn('add', field('a'), field('b')),
        }),
        { context: ctxFull }
      )
    ).toEqual({ fn: 'eq', args: [{ fn: 'add', args: ['todo.a', 'todo.b'] }, '7'] });

    // No options at all → `options ?? {}` / `opts.context ?? {}` defaults → stock fallback.
    expect(
      expressionRuleProcessorTanStackDB(
        rule({ operator: '=', value: '1', lhs: fn('add', field('a'), field('b')) })
      )
    ).toBeUndefined();
    // Plain rule with no expression → `!expr` branch → stock fallback.
    expect(
      expressionRuleProcessorTanStackDB({ field: 'x', operator: '=', value: '1' } as RuleType, {
        context: ctxFull,
      })
    ).toBeDefined();
    // Context lacking operators → `!ops` fallback branch.
    expect(
      expressionRuleProcessorTanStackDB(
        rule({ operator: '=', value: '1', lhs: fn('add', field('a'), field('b')) }),
        { context: { _tanstackDbRefs: refs, _tanstackDbPrimaryRef: 'todo' } }
      )
    ).toBeUndefined();
    // Dotted field with a non-matching prefix falls through to the primary ref.
    expect(
      expressionRuleProcessorTanStackDB(
        rule({ operator: '=', value: 'X', lhs: fn('upper', field('other.name')) }),
        { context: ctxFull }
      )
    ).toEqual({ fn: 'eq', args: [{ fn: 'upper', args: ['todo.other.name'] }, 'X'] });
    // String-match with an expression operand is omitted (TanStack `like` needs a static pattern).
    expect(
      expressionRuleProcessorTanStackDB(
        rule({ operator: 'contains', value: 'x', lhs: fn('add', field('a'), field('b')) }),
        { context: ctxFull }
      )
    ).toBeUndefined();
    // A genuinely-unsupported operator (e.g. `in`) defers to the stock processor.
    expect(
      expressionRuleProcessorTanStackDB(
        rule({ operator: 'in', value: 'a,b', lhs: fn('add', field('a'), field('b')) }),
        { context: ctxFull }
      )
    ).toEqual({ fn: 'inArray', args: ['todo.(expression)', ['a', 'b']] });
    // rhs2-only between short-circuit (`expr.rhs || expr.rhs2`) → incomplete → undefined.
    expect(
      expressionRuleProcessorTanStackDB(
        rule({
          operator: 'between',
          lhs: fn('add', field('a'), field('b')),
          valueSource: 'expression',
          value: [null, value(5, 'number')] as unknown,
        }),
        { context: ctxFull }
      )
    ).toBeUndefined();
  });

  it('MongoDBQuery: parses a plain numeric rhs; MongoDB (deprecated) passes through falsy output', () => {
    expect(
      expressionRuleProcessorMongoDBQuery(
        rule({ operator: '=', value: '5', lhs: fn('abs', field('d')) }),
        { parseNumbers: true }
      )
    ).toEqual({ $expr: { $eq: [{ $abs: '$d' }, 5] } });
    // Deprecated mongodb wrapper: unknown function → inner returns '' → passthrough (not stringified object).
    expect(
      expressionRuleProcessorMongoDB(
        rule({
          operator: '=',
          lhs: fn('bogus', field('a')),
          valueSource: 'expression',
          value: value(1),
        })
      )
    ).toBe('');
  });
});
