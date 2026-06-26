import type { ExpressionNode, RuleType } from '@react-querybuilder/core';
import { defaultFunctions } from './defaultFunctions';
import { getExpressions, mergeFunctions } from './registry';
import type { ExpressionFunctionRegistry } from './types';

describe('mergeFunctions', () => {
  it('returns a copy of the defaults when called with no arguments', () => {
    const merged = mergeFunctions();
    expect(merged).toEqual(defaultFunctions);
    expect(merged).not.toBe(defaultFunctions);
  });

  it('ignores undefined sources', () => {
    expect(mergeFunctions(undefined)).toEqual(defaultFunctions);
  });

  it('adds custom functions on top of the defaults', () => {
    const custom: ExpressionFunctionRegistry = { pow: { arity: 2 } };
    const merged = mergeFunctions(custom);
    expect(merged.pow).toBe(custom.pow);
    expect(merged.add).toBe(defaultFunctions.add);
  });

  it('lets later registries win', () => {
    const merged = mergeFunctions({ add: { label: 'first' } }, { add: { label: 'second' } });
    expect(merged.add.label).toBe('second');
  });
});

describe('getExpressions', () => {
  const lhs: ExpressionNode = { kind: 'field', field: 'a' };
  const rhs: ExpressionNode = { kind: 'func', fn: 'abs', args: [{ kind: 'field', field: 'b' }] };

  it('reads an LHS expression from rule.lhs', () => {
    const rule = { field: 'a', operator: '=', value: 1, lhs } as RuleType;
    expect(getExpressions(rule)).toEqual({ lhs, rhs: undefined });
  });

  it('reads an RHS expression from value when valueSource is "expression"', () => {
    const rule = { field: 'a', operator: '=', value: rhs, valueSource: 'expression' } as RuleType;
    expect(getExpressions(rule)).toEqual({ lhs: undefined, rhs });
  });

  it('reads both sides at once', () => {
    const rule = {
      field: 'a',
      operator: '=',
      value: rhs,
      valueSource: 'expression',
      lhs,
    } as RuleType;
    expect(getExpressions(rule)).toEqual({ lhs, rhs });
  });

  it('ignores value when valueSource is not "expression"', () => {
    const rule = { field: 'a', operator: '=', value: rhs } as RuleType;
    expect(getExpressions(rule)).toBeUndefined();
  });

  it('returns undefined when the rule carries no expression', () => {
    expect(getExpressions({ field: 'a', operator: '=', value: 1 } as RuleType)).toBeUndefined();
  });
});
