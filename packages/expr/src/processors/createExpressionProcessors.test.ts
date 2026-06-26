import type { RuleGroupType, RuleType } from '@react-querybuilder/core';
import { formatQuery } from '@react-querybuilder/core';
import type { ExpressionNode, ResolvedExpressions } from '../types';
import { createExpressionProcessors } from './createExpressionProcessors';

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

describe('createExpressionProcessors', () => {
  it('binds the built-ins when called with no functions', () => {
    const { sql, parameterized, jsonLogic } = createExpressionProcessors();
    const rule = exprRule(
      { operator: '=' },
      { lhs: fn('multiply', field('price'), field('qty')), rhs: value(100, 'number') }
    );
    expect(formatQuery(group(rule), { format: 'sql', ruleProcessor: sql })).toBe(
      '((price * qty) = 100)'
    );
    expect(
      formatQuery(group(rule), { format: 'parameterized', ruleProcessor: parameterized })
    ).toEqual({ sql: '((price * qty) = ?)', params: [100] });
    expect(formatQuery(group(rule), { format: 'jsonlogic', ruleProcessor: jsonLogic })).toEqual({
      and: [{ '==': [{ '*': [{ var: 'price' }, { var: 'qty' }] }, 100] }],
    });
  });

  it('flows one custom registry to every format (configure once)', () => {
    const procs = createExpressionProcessors({
      pow: {
        arity: 2,
        sql: (a, b) => `POWER(${a}, ${b})`,
        parameterized: (a, b) => `POWER(${a}, ${b})`,
        jsonLogic: (a, b) => ({ pow: [a, b] }),
      },
    });
    const rule = exprRule(
      { operator: '=' },
      { lhs: fn('pow', field('x'), value(2, 'number')), rhs: value(9, 'number') }
    );
    expect(formatQuery(group(rule), { format: 'sql', ruleProcessor: procs.sql })).toBe(
      '(POWER(x, 2) = 9)'
    );
    expect(
      formatQuery(group(rule), { format: 'parameterized', ruleProcessor: procs.parameterized })
    ).toEqual({ sql: '(POWER(x, ?) = ?)', params: [2, 9] });
    expect(
      formatQuery(group(rule), { format: 'jsonlogic', ruleProcessor: procs.jsonLogic })
    ).toEqual({ and: [{ '==': [{ pow: [{ var: 'x' }, 2] }, 9] }] });
  });

  it('omits rather than throws when a function lacks the target serializer', () => {
    const procs = createExpressionProcessors({
      jlOnly: { arity: 1, jsonLogic: 'abs' },
    });
    const rule = exprRule(
      { operator: '=' },
      { lhs: fn('jlOnly', field('x')), rhs: value(1, 'number') }
    );
    const plain = { field: 'y', operator: '=', value: '2' } as RuleType;

    // JSONLogic registers the serializer -> rule is included.
    expect(
      formatQuery(group(rule, plain), { format: 'jsonlogic', ruleProcessor: procs.jsonLogic })
    ).toEqual({ and: [{ '==': [{ abs: [{ var: 'x' }] }, 1] }, { '==': [{ var: 'y' }, '2'] }] });

    // SQL / parameterized lack the serializer -> rule omitted, no throw.
    expect(formatQuery(group(rule, plain), { format: 'sql', ruleProcessor: procs.sql })).toBe(
      `(y = '2')`
    );
    expect(
      formatQuery(group(rule, plain), {
        format: 'parameterized',
        ruleProcessor: procs.parameterized,
      })
    ).toEqual({ sql: '(y = ?)', params: ['2'] });
  });
});
