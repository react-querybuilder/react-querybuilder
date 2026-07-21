import type { RuleGroupType, RuleType } from '@react-querybuilder/core';
import { formatQuery } from '@react-querybuilder/core';
import {
  expressionRuleProcessorJsonLogic,
  expressionRuleProcessorParameterized,
  expressionRuleProcessorSQL,
  getExpressionRuleProcessorJsonLogic,
  getExpressionRuleProcessorParameterized,
  getExpressionRuleProcessorSQL,
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

// Builds a rule using the core storage contract: `lhs` lives on `rule.lhs`, and an
// `rhs` expression is stored in `rule.value` with `valueSource: 'expression'`. For a
// `between`/`notBetween` range (`rhs` + `rhs2`), `rule.value` is the 2-tuple `[rhs, rhs2]`.
// A plain value/field RHS is passed through the partial rule untouched.
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

describe('SQL processor', () => {
  it('serializes both sides as expressions', () => {
    const q = group(
      exprRule(
        { operator: '=' },
        { lhs: fn('multiply', field('price'), field('qty')), rhs: value(100, 'number') }
      )
    );
    expect(formatQuery(q, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL })).toBe(
      '((price * qty) = 100)'
    );
  });

  it('serializes an LHS expression with a plain RHS value', () => {
    const q = group(
      exprRule({ field: 'price', operator: '>', value: '100' }, { lhs: fn('abs', field('price')) })
    );
    expect(formatQuery(q, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL })).toBe(
      `(ABS(price) > '100')`
    );
  });

  it('serializes a plain LHS field with an RHS expression', () => {
    const q = group(
      exprRule({ field: 'price', operator: '<' }, { rhs: fn('add', field('a'), field('b')) })
    );
    expect(formatQuery(q, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL })).toBe(
      '(price < (a + b))'
    );
  });

  it('serializes an expression-sourced between range', () => {
    const q = group(
      exprRule(
        { field: 'price', operator: 'between' },
        {
          rhs: fn('add', field('a'), field('b')),
          rhs2: fn('multiply', field('c'), value(2, 'number')),
        }
      )
    );
    expect(formatQuery(q, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL })).toBe(
      '(price between (a + b) and (c * 2))'
    );
  });

  it('serializes between with an LHS expression and expression bounds', () => {
    const q = group(
      exprRule(
        { operator: 'between' },
        { lhs: fn('abs', field('price')), rhs: value(1, 'number'), rhs2: value(10, 'number') }
      )
    );
    expect(formatQuery(q, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL })).toBe(
      '(ABS(price) between 1 and 10)'
    );
  });

  it('serializes an expression-sourced notBetween range', () => {
    const q = group(
      exprRule(
        { field: 'price', operator: 'notBetween' },
        { rhs: value(1, 'number'), rhs2: value(10, 'number') }
      )
    );
    expect(formatQuery(q, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL })).toBe(
      '(price not between 1 and 10)'
    );
  });

  it('omits an expression between missing a bound', () => {
    const incomplete = exprRule(
      { field: 'price', operator: 'between' },
      { rhs: value(1, 'number') }
    );
    const plain = { field: 'x', operator: '=', value: '1' } as RuleType;
    expect(
      formatQuery(group(incomplete, plain), {
        format: 'sql',
        ruleProcessor: expressionRuleProcessorSQL,
      })
    ).toBe(`(x = '1')`);
  });

  it('serializes a variadic min with three args', () => {
    const q = group(
      exprRule(
        { operator: '>' },
        { lhs: fn('min', field('a'), field('b'), field('c')), rhs: value(0, 'number') }
      )
    );
    expect(formatQuery(q, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL })).toBe(
      '(LEAST(a, b, c) > 0)'
    );
  });

  it('serializes mod and upper', () => {
    const q = group(
      exprRule(
        { operator: '=' },
        { lhs: fn('mod', field('n'), value(2, 'number')), rhs: value(0, 'number') }
      ),
      exprRule({ field: 'name', operator: '=', value: 'ACME' }, { lhs: fn('upper', field('name')) })
    );
    expect(formatQuery(q, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL })).toBe(
      `((n % 2) = 0 and UPPER(name) = 'ACME')`
    );
  });

  it('handles unary operators', () => {
    const isNull = group(
      exprRule({ operator: 'null', value: null }, { lhs: fn('abs', field('y')) })
    );
    expect(formatQuery(isNull, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL })).toBe(
      '(ABS(y) is null)'
    );
    const notNull = group(exprRule({ operator: 'notNull', value: null }, { lhs: field('z') }));
    expect(formatQuery(notNull, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL })).toBe(
      '(z is not null)'
    );
  });

  it('wraps an expression RHS with LIKE wildcards (begins/ends/contains)', () => {
    const begins = group(
      exprRule(
        { field: 'lastName', operator: 'beginsWith' },
        { rhs: fn('upper', field('firstName')) }
      )
    );
    expect(formatQuery(begins, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL })).toBe(
      `(lastName like UPPER(firstName) || '%')`
    );
    const ends = group(
      exprRule(
        { field: 'lastName', operator: 'endsWith' },
        { rhs: fn('upper', field('firstName')) }
      )
    );
    expect(formatQuery(ends, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL })).toBe(
      `(lastName like '%' || UPPER(firstName))`
    );
    const contains = group(
      exprRule(
        { field: 'lastName', operator: 'contains' },
        { rhs: fn('upper', field('firstName')) }
      )
    );
    expect(
      formatQuery(contains, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL })
    ).toBe(`(lastName like '%' || UPPER(firstName) || '%')`);
  });

  it('negates a string-match expression to NOT LIKE', () => {
    const q = group(
      exprRule(
        { field: 'lastName', operator: 'doesNotContain' },
        { rhs: fn('upper', field('firstName')) }
      )
    );
    expect(formatQuery(q, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL })).toBe(
      `(lastName not like '%' || UPPER(firstName) || '%')`
    );
  });

  it('concatenates LIKE wildcards per SQL dialect', () => {
    const q = group(
      exprRule(
        { field: 'lastName', operator: 'beginsWith' },
        { rhs: fn('upper', field('firstName')) }
      )
    );
    expect(
      formatQuery(q, { format: 'sql', preset: 'mysql', ruleProcessor: expressionRuleProcessorSQL })
    ).toBe(`(lastName like CONCAT(UPPER(firstName), '%'))`);
    const c = group(
      exprRule(
        { field: 'lastName', operator: 'contains' },
        { rhs: fn('upper', field('firstName')) }
      )
    );
    expect(
      formatQuery(c, { format: 'sql', preset: 'mssql', ruleProcessor: expressionRuleProcessorSQL })
    ).toBe(`([lastName] like '%' + UPPER([firstName]) + '%')`);
  });

  it('serializes an LHS expression with a plain value RHS for LIKE', () => {
    const q = group(
      exprRule(
        { field: 'name', operator: 'beginsWith', value: 'Stev' },
        { lhs: fn('upper', field('name')) }
      )
    );
    expect(formatQuery(q, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL })).toBe(
      `(UPPER(name) like 'Stev%')`
    );
  });

  it('falls back to the default processor for unsupported operators', () => {
    const expressions: ResolvedExpressions = { lhs: fn('multiply', field('price'), field('qty')) };
    const q = group(exprRule({ field: 'price', operator: 'between', value: '1,2' }, expressions));
    expect(formatQuery(q, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL })).toBe(
      formatQuery(q, { format: 'sql' })
    );
  });

  it('falls back when there are no expressions', () => {
    const q = group({ field: 'x', operator: '=', value: '1' } as RuleType);
    expect(formatQuery(q, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL })).toBe(
      formatQuery(q, { format: 'sql' })
    );
  });

  it('falls back when the expressions payload is empty', () => {
    const q = group(exprRule({ field: 'x', operator: '=', value: '1' }, {}));
    expect(formatQuery(q, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL })).toBe(
      formatQuery(q, { format: 'sql' })
    );
  });

  it('omits rules whose expressions fail validation', () => {
    const invalid = exprRule({ operator: '=' }, { lhs: fn('add', field('a')) });
    const plain = { field: 'x', operator: '=', value: '1' } as RuleType;
    expect(
      formatQuery(group(invalid, plain), {
        format: 'sql',
        ruleProcessor: expressionRuleProcessorSQL,
      })
    ).toBe(`(x = '1')`);
  });

  it('defaults options to an empty object when called directly', () => {
    expect(expressionRuleProcessorSQL({ field: 'x', operator: '=', value: '1' } as RuleType)).toBe(
      `x = '1'`
    );
  });

  it('uses custom serializers', () => {
    const proc = getExpressionRuleProcessorSQL({ pow: (_opts, a, b) => `POWER(${a}, ${b})` });
    const rule = exprRule(
      { operator: '=' },
      { lhs: fn('pow', field('x'), value(2, 'number')), rhs: value(9, 'number') }
    );
    expect(proc(rule, {})).toBe('POWER(x, 2) = 9');
  });

  it('honors a custom valueProcessor for the RHS', () => {
    const rule = exprRule({ field: 'price', operator: '=' }, { lhs: fn('abs', field('price')) });
    expect(expressionRuleProcessorSQL(rule, { valueProcessor: () => 'CUSTOM' })).toBe(
      'ABS(price) = CUSTOM'
    );
  });

  it('uses the default value processor for the RHS when none is supplied', () => {
    const rule = exprRule(
      { field: 'price', operator: '=', value: '5' },
      { lhs: fn('abs', field('price')) }
    );
    expect(expressionRuleProcessorSQL(rule, {})).toBe(`ABS(price) = '5'`);
  });
});

describe('Parameterized processor', () => {
  it('binds positional params for both sides', () => {
    const q = group(
      exprRule(
        { operator: '=' },
        { lhs: fn('multiply', field('price'), field('qty')), rhs: value(100, 'number') }
      )
    );
    expect(
      formatQuery(q, {
        format: 'parameterized',
        ruleProcessor: expressionRuleProcessorParameterized,
      })
    ).toEqual({ sql: '((price * qty) = ?)', params: [100] });
  });

  it('binds named params using a safe base for the sentinel field', () => {
    const q = group(
      exprRule(
        { operator: '=' },
        { lhs: fn('multiply', field('price'), field('qty')), rhs: value(100, 'number') }
      )
    );
    expect(
      formatQuery(q, {
        format: 'parameterized_named',
        ruleProcessor: expressionRuleProcessorParameterized,
      })
    ).toEqual({ sql: '((price * qty) = :expr_1)', params: { expr_1: 100 } });
  });

  it('uses numbered placeholders for the postgresql preset', () => {
    const q = group(
      exprRule(
        { operator: '=' },
        { lhs: fn('multiply', field('price'), field('qty')), rhs: value(100, 'number') }
      )
    );
    expect(
      formatQuery(q, {
        format: 'parameterized',
        preset: 'postgresql',
        ruleProcessor: expressionRuleProcessorParameterized,
      })
    ).toEqual({ sql: '(("price" * "qty") = $1)', params: [100] });
  });

  it('binds params for a binary mod expression', () => {
    const q = group(
      exprRule(
        { operator: '=' },
        { lhs: fn('mod', field('n'), value(2, 'number')), rhs: value(0, 'number') }
      )
    );
    expect(
      formatQuery(q, {
        format: 'parameterized',
        ruleProcessor: expressionRuleProcessorParameterized,
      })
    ).toEqual({ sql: '((n % ?) = ?)', params: [2, 0] });
  });

  it('continues numbered params across preceding rules', () => {
    const fields = [
      { name: 'price', label: 'price' },
      { name: 'qty', label: 'qty' },
    ];
    const ruleA = { field: 'price', operator: '>', value: '50' } as RuleType;
    const ruleB = exprRule(
      { field: 'qty', operator: '=' },
      { lhs: field('qty'), rhs: value(100, 'number') }
    );
    expect(
      formatQuery(group(ruleA, ruleB), {
        format: 'parameterized',
        preset: 'postgresql',
        fields,
        ruleProcessor: expressionRuleProcessorParameterized,
      })
    ).toEqual({ sql: '("price" > $1 and "qty" = $2)', params: ['50', 100] });
  });

  it('inlines a field-source RHS', () => {
    const rule = exprRule(
      { operator: '=', value: 'otherCol', valueSource: 'field' },
      { lhs: fn('abs', field('price')) }
    );
    expect(
      formatQuery(group(rule), {
        format: 'parameterized',
        ruleProcessor: expressionRuleProcessorParameterized,
      })
    ).toEqual({ sql: '(ABS(price) = otherCol)', params: [] });
  });

  it('binds a plain RHS value', () => {
    const rule = exprRule(
      { field: 'price', operator: '=', value: '42' },
      { lhs: fn('abs', field('price')) }
    );
    expect(
      formatQuery(group(rule), {
        format: 'parameterized',
        ruleProcessor: expressionRuleProcessorParameterized,
      })
    ).toEqual({ sql: '(ABS(price) = ?)', params: ['42'] });
  });

  it('concatenates wildcards in SQL for an expression RHS (LIKE)', () => {
    const rule = exprRule(
      { field: 'lastName', operator: 'beginsWith' },
      { rhs: fn('upper', field('firstName')) }
    );
    expect(
      formatQuery(group(rule), {
        format: 'parameterized',
        ruleProcessor: expressionRuleProcessorParameterized,
      })
    ).toEqual({ sql: `(lastName like UPPER(firstName) || '%')`, params: [] });
  });

  it('bakes wildcards into the bound param for a plain literal RHS (LIKE)', () => {
    const rule = exprRule(
      { field: 'name', operator: 'beginsWith', value: 'Stev' },
      { lhs: fn('upper', field('name')) }
    );
    expect(
      formatQuery(group(rule), {
        format: 'parameterized',
        ruleProcessor: expressionRuleProcessorParameterized,
      })
    ).toEqual({ sql: '(UPPER(name) like ?)', params: ['Stev%'] });
  });

  it('concatenates a field-source RHS wildcard in SQL (LIKE)', () => {
    const rule = exprRule(
      { field: 'name', operator: 'endsWith', value: 'otherCol', valueSource: 'field' },
      { lhs: fn('upper', field('name')) }
    );
    expect(
      formatQuery(group(rule), {
        format: 'parameterized',
        ruleProcessor: expressionRuleProcessorParameterized,
      })
    ).toEqual({ sql: `(UPPER(name) like '%' || otherCol)`, params: [] });
  });

  it('serializes a plain LHS field with an RHS expression', () => {
    const rule = exprRule(
      { field: 'price', operator: '<' },
      { rhs: fn('add', field('a'), field('b')) }
    );
    expect(
      formatQuery(group(rule), {
        format: 'parameterized',
        ruleProcessor: expressionRuleProcessorParameterized,
      })
    ).toEqual({ sql: '(price < (a + b))', params: [] });
  });

  it('binds positional params for an expression-sourced between range', () => {
    const q = group(
      exprRule(
        { field: 'price', operator: 'between' },
        { rhs: value(1, 'number'), rhs2: value(10, 'number') }
      )
    );
    expect(
      formatQuery(q, {
        format: 'parameterized',
        ruleProcessor: expressionRuleProcessorParameterized,
      })
    ).toEqual({ sql: '(price between ? and ?)', params: [1, 10] });
  });

  it('binds positional params for an expression-sourced notBetween range', () => {
    const q = group(
      exprRule(
        { field: 'price', operator: 'notBetween' },
        { rhs: value(1, 'number'), rhs2: value(10, 'number') }
      )
    );
    expect(
      formatQuery(q, {
        format: 'parameterized',
        ruleProcessor: expressionRuleProcessorParameterized,
      })
    ).toEqual({ sql: '(price not between ? and ?)', params: [1, 10] });
  });

  it('binds nested value params within between expression bounds', () => {
    const q = group(
      exprRule(
        { field: 'price', operator: 'between' },
        { rhs: fn('add', field('a'), value(5, 'number')), rhs2: field('b') }
      )
    );
    expect(
      formatQuery(q, {
        format: 'parameterized',
        ruleProcessor: expressionRuleProcessorParameterized,
      })
    ).toEqual({ sql: '(price between (a + ?) and b)', params: [5] });
  });

  it('binds named params for an expression-sourced between range', () => {
    const q = group(
      exprRule(
        { field: 'price', operator: 'between' },
        { rhs: value(1, 'number'), rhs2: value(10, 'number') }
      )
    );
    expect(
      formatQuery(q, {
        format: 'parameterized_named',
        ruleProcessor: expressionRuleProcessorParameterized,
      })
    ).toEqual({
      sql: '(price between :price_1 and :price_2)',
      params: { price_1: 1, price_2: 10 },
    });
  });

  it('omits an expression between missing a bound', () => {
    const incomplete = exprRule(
      { field: 'price', operator: 'between' },
      { rhs: value(1, 'number') }
    );
    const plain = { field: 'x', operator: '=', value: '1' } as RuleType;
    expect(
      formatQuery(group(incomplete, plain), {
        format: 'parameterized',
        ruleProcessor: expressionRuleProcessorParameterized,
      })
    ).toEqual({ sql: '(x = ?)', params: ['1'] });
  });

  it('handles unary operators', () => {
    const rule = exprRule({ operator: 'null', value: null }, { lhs: fn('abs', field('y')) });
    expect(
      formatQuery(group(rule), {
        format: 'parameterized',
        ruleProcessor: expressionRuleProcessorParameterized,
      })
    ).toEqual({ sql: '(ABS(y) is null)', params: [] });
  });

  it('falls back for unsupported operators', () => {
    const expressions: ResolvedExpressions = { lhs: fn('multiply', field('price'), field('qty')) };
    const q = group(exprRule({ field: 'price', operator: 'between', value: '1,2' }, expressions));
    expect(
      formatQuery(q, {
        format: 'parameterized',
        ruleProcessor: expressionRuleProcessorParameterized,
      })
    ).toEqual(formatQuery(q, { format: 'parameterized' }));
  });

  it('falls back when the expressions payload is empty', () => {
    const q = group(exprRule({ field: 'x', operator: '=', value: '1' }, {}));
    expect(
      formatQuery(q, {
        format: 'parameterized',
        ruleProcessor: expressionRuleProcessorParameterized,
      })
    ).toEqual(formatQuery(q, { format: 'parameterized' }));
  });

  it('omits rules whose expressions fail validation', () => {
    const invalid = exprRule({ operator: '=' }, { lhs: fn('add', field('a')) });
    const plain = { field: 'x', operator: '=', value: '1' } as RuleType;
    expect(
      formatQuery(group(invalid, plain), {
        format: 'parameterized',
        ruleProcessor: expressionRuleProcessorParameterized,
      })
    ).toEqual({ sql: '(x = ?)', params: ['1'] });
  });

  it('omits invalid rules in the named format with an empty named bag', () => {
    const invalid = exprRule({ operator: '=' }, { lhs: fn('add', field('a')) });
    const plain = { field: 'x', operator: '=', value: '1' } as RuleType;
    expect(
      formatQuery(group(invalid, plain), {
        format: 'parameterized_named',
        ruleProcessor: expressionRuleProcessorParameterized,
      })
    ).toEqual({ sql: '(x = :x_1)', params: { x_1: '1' } });
  });

  it('defaults options and meta when called directly', () => {
    const rule = exprRule({ operator: '=' }, { lhs: field('price'), rhs: value(100, 'number') });
    expect(expressionRuleProcessorParameterized(rule)).toEqual({ sql: 'price = ?', params: [100] });
  });

  it('uses custom serializers and binds nested value args', () => {
    const proc = getExpressionRuleProcessorParameterized({
      pow: (_opts, a, b) => `POWER(${a}, ${b})`,
    });
    const rule = exprRule(
      { operator: '=' },
      { lhs: fn('pow', field('x'), value(2, 'number')), rhs: value(9, 'number') }
    );
    expect(proc(rule, {}, { processedParams: [] })).toEqual({
      sql: 'POWER(x, ?) = ?',
      params: [2, 9],
    });
  });
});

describe('JsonLogic processor', () => {
  it('serializes both sides as expressions', () => {
    const rule = exprRule(
      { operator: '=' },
      { lhs: fn('multiply', field('price'), field('qty')), rhs: value(100, 'number') }
    );
    expect(expressionRuleProcessorJsonLogic(rule, {})).toEqual({
      '==': [{ '*': [{ var: 'price' }, { var: 'qty' }] }, 100],
    });
  });

  it('renders a plain RHS leaf, honoring parseNumbers', () => {
    const rule = exprRule(
      { field: 'price', operator: '>', value: '50' },
      { lhs: fn('abs', field('price')) }
    );
    expect(expressionRuleProcessorJsonLogic(rule, {})).toEqual({
      '>': [{ abs: { var: 'price' } }, '50'],
    });
    expect(expressionRuleProcessorJsonLogic(rule, { parseNumbers: true })).toEqual({
      '>': [{ abs: { var: 'price' } }, 50],
    });
  });

  it('serializes a plain LHS field with an RHS expression', () => {
    const rule = exprRule(
      { field: 'price', operator: '<' },
      { rhs: fn('add', field('a'), field('b')) }
    );
    expect(expressionRuleProcessorJsonLogic(rule, {})).toEqual({
      '<': [{ var: 'price' }, { '+': [{ var: 'a' }, { var: 'b' }] }],
    });
  });

  it('serializes an expression-sourced between range', () => {
    const rule = exprRule(
      { field: 'price', operator: 'between' },
      { rhs: value(1, 'number'), rhs2: value(10, 'number') }
    );
    expect(expressionRuleProcessorJsonLogic(rule, {})).toEqual({ '<=': [1, { var: 'price' }, 10] });
  });

  it('negates an expression-sourced notBetween range', () => {
    const rule = exprRule(
      { field: 'price', operator: 'notBetween' },
      { rhs: value(1, 'number'), rhs2: value(10, 'number') }
    );
    expect(expressionRuleProcessorJsonLogic(rule, {})).toEqual({
      '!': { '<=': [1, { var: 'price' }, 10] },
    });
  });

  it('serializes between with expression operands on all sides', () => {
    const rule = exprRule(
      { operator: 'between' },
      {
        lhs: fn('abs', field('price')),
        rhs: fn('add', field('a'), field('b')),
        rhs2: value(100, 'number'),
      }
    );
    expect(expressionRuleProcessorJsonLogic(rule, {})).toEqual({
      '<=': [{ '+': [{ var: 'a' }, { var: 'b' }] }, { abs: { var: 'price' } }, 100],
    });
  });

  it('omits an expression between missing a bound', () => {
    const incomplete = exprRule(
      { field: 'price', operator: 'between' },
      { rhs: value(1, 'number') }
    );
    const plain = { field: 'x', operator: '=', value: '1' } as RuleType;
    expect(
      formatQuery(group(incomplete, plain), {
        format: 'jsonlogic',
        ruleProcessor: expressionRuleProcessorJsonLogic,
      })
    ).toEqual({ and: [{ '==': [{ var: 'x' }, '1'] }] });
  });

  it('serializes variadic max and unary lower', () => {
    const rule = exprRule(
      { operator: '=' },
      {
        lhs: fn('max', field('a'), field('b'), value(10, 'number')),
        rhs: fn('lower', field('name')),
      }
    );
    expect(expressionRuleProcessorJsonLogic(rule, {})).toEqual({
      '==': [{ max: [{ var: 'a' }, { var: 'b' }, 10] }, { lower: { var: 'name' } }],
    });
  });

  it('serializes mod via the % operator', () => {
    const rule = exprRule(
      { operator: '=' },
      { lhs: fn('mod', field('n'), value(2, 'number')), rhs: value(0, 'number') }
    );
    expect(expressionRuleProcessorJsonLogic(rule, {})).toEqual({
      '==': [{ '%': [{ var: 'n' }, 2] }, 0],
    });
  });

  it('handles unary operators', () => {
    const isNull = exprRule({ operator: 'null', value: null }, { lhs: fn('abs', field('y')) });
    expect(expressionRuleProcessorJsonLogic(isNull, {})).toEqual({
      '==': [{ abs: { var: 'y' } }, null],
    });
    const notNull = exprRule({ operator: 'notNull', value: null }, { lhs: field('z') });
    expect(expressionRuleProcessorJsonLogic(notNull, {})).toEqual({ '!=': [{ var: 'z' }, null] });
  });

  it('renders a field-source RHS as a var', () => {
    const rule = exprRule(
      { operator: '=', value: 'otherCol', valueSource: 'field' },
      { lhs: fn('abs', field('price')) }
    );
    expect(expressionRuleProcessorJsonLogic(rule, {})).toEqual({
      '==': [{ abs: { var: 'price' } }, { var: 'otherCol' }],
    });
  });

  it('serializes string-match operators with expression operands', () => {
    const begins = exprRule(
      { field: 'lastName', operator: 'beginsWith' },
      { rhs: fn('upper', field('firstName')) }
    );
    expect(expressionRuleProcessorJsonLogic(begins, {})).toEqual({
      startsWith: [{ var: 'lastName' }, { upper: { var: 'firstName' } }],
    });
    const contains = exprRule(
      { field: 'lastName', operator: 'contains' },
      { rhs: fn('lower', field('firstName')) }
    );
    expect(expressionRuleProcessorJsonLogic(contains, {})).toEqual({
      in: [{ lower: { var: 'firstName' } }, { var: 'lastName' }],
    });
    const ends = exprRule(
      { field: 'x', operator: 'endsWith', value: 'Z' },
      { lhs: fn('upper', field('lastName')) }
    );
    expect(expressionRuleProcessorJsonLogic(ends, {})).toEqual({
      endsWith: [{ upper: { var: 'lastName' } }, 'Z'],
    });
  });

  it('negates doesNot string-match operators', () => {
    const rule = exprRule(
      { field: 'lastName', operator: 'doesNotBeginWith' },
      { rhs: fn('upper', field('firstName')) }
    );
    expect(expressionRuleProcessorJsonLogic(rule, {})).toEqual({
      '!': { startsWith: [{ var: 'lastName' }, { upper: { var: 'firstName' } }] },
    });
  });

  it('falls back for unsupported operators', () => {
    const expressions: ResolvedExpressions = { lhs: fn('multiply', field('price'), field('qty')) };
    const q = group(exprRule({ field: 'price', operator: 'between', value: '1,2' }, expressions));
    expect(
      formatQuery(q, { format: 'jsonlogic', ruleProcessor: expressionRuleProcessorJsonLogic })
    ).toEqual(formatQuery(q, { format: 'jsonlogic' }));
  });

  it('falls back when there are no expressions', () => {
    const q = group({ field: 'x', operator: '=', value: '1' } as RuleType);
    expect(
      formatQuery(q, { format: 'jsonlogic', ruleProcessor: expressionRuleProcessorJsonLogic })
    ).toEqual(formatQuery(q, { format: 'jsonlogic' }));
  });

  it('falls back when the expressions payload is empty', () => {
    const q = group(exprRule({ field: 'x', operator: '=', value: '1' }, {}));
    expect(
      formatQuery(q, { format: 'jsonlogic', ruleProcessor: expressionRuleProcessorJsonLogic })
    ).toEqual(formatQuery(q, { format: 'jsonlogic' }));
  });

  it('omits rules whose expressions fail validation', () => {
    const invalid = exprRule({ operator: '=' }, { lhs: fn('add', field('a')) });
    const plain = { field: 'x', operator: '=', value: '1' } as RuleType;
    expect(
      formatQuery(group(invalid, plain), {
        format: 'jsonlogic',
        ruleProcessor: expressionRuleProcessorJsonLogic,
      })
    ).toEqual({ and: [{ '==': [{ var: 'x' }, '1'] }] });
  });

  it('defaults options when called directly', () => {
    expect(
      expressionRuleProcessorJsonLogic({ field: 'x', operator: '=', value: '1' } as RuleType)
    ).toEqual({ '==': [{ var: 'x' }, '1'] });
  });

  it('uses custom serializers', () => {
    const proc = getExpressionRuleProcessorJsonLogic({ pow: (_opts, a, b) => ({ pow: [a, b] }) });
    const rule = exprRule(
      { operator: '=' },
      { lhs: fn('pow', field('x'), value(2, 'number')), rhs: value(9, 'number') }
    );
    expect(proc(rule, {})).toEqual({ '==': [{ pow: [{ var: 'x' }, 2] }, 9] });
  });
});
