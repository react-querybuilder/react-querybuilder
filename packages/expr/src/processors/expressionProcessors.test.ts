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
import { mergeFunctions } from '../registry';
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
// `rhs` expression is stored in `rule.value` with `valueSource: 'expression'`. A plain
// value/field RHS is passed through the partial rule untouched.
const exprRule = (
  rule: Partial<RuleType> & { operator: string },
  { lhs, rhs }: ResolvedExpressions = {}
): RuleType => {
  const result = { field: '(expression)', value: '', ...rule } as RuleType;
  if (lhs) result.lhs = lhs;
  if (rhs) {
    result.value = rhs;
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

  it('uses a custom registry', () => {
    const reg = mergeFunctions({
      pow: { name: 'pow', arity: 2, sql: (a, b) => `POWER(${a}, ${b})` },
    });
    const proc = getExpressionRuleProcessorSQL(reg);
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

  it('uses a custom registry and binds nested value args', () => {
    const reg = mergeFunctions({
      pow: { name: 'pow', arity: 2, parameterized: (a, b) => `POWER(${a}, ${b})` },
    });
    const proc = getExpressionRuleProcessorParameterized(reg);
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
      '>': [{ abs: [{ var: 'price' }] }, '50'],
    });
    expect(expressionRuleProcessorJsonLogic(rule, { parseNumbers: true })).toEqual({
      '>': [{ abs: [{ var: 'price' }] }, 50],
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

  it('handles unary operators', () => {
    const isNull = exprRule({ operator: 'null', value: null }, { lhs: fn('abs', field('y')) });
    expect(expressionRuleProcessorJsonLogic(isNull, {})).toEqual({
      '==': [{ abs: [{ var: 'y' }] }, null],
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
      '==': [{ abs: [{ var: 'price' }] }, { var: 'otherCol' }],
    });
  });

  it('falls back for unsupported operators', () => {
    const expressions: ResolvedExpressions = { lhs: fn('multiply', field('price'), field('qty')) };
    const q = group(exprRule({ field: 'price', operator: 'contains', value: 'x' }, expressions));
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

  it('uses a custom registry', () => {
    const reg = mergeFunctions({
      pow: { name: 'pow', arity: 2, jsonLogic: (a, b) => ({ pow: [a, b] }) },
    });
    const proc = getExpressionRuleProcessorJsonLogic(reg);
    const rule = exprRule(
      { operator: '=' },
      { lhs: fn('pow', field('x'), value(2, 'number')), rhs: value(9, 'number') }
    );
    expect(proc(rule, {})).toEqual({ '==': [{ pow: [{ var: 'x' }, 2] }, 9] });
  });
});
