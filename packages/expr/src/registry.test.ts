import type { ExpressionNode, RuleType } from '@react-querybuilder/core';
import { defaultFunctionMeta } from './functions/meta';
import { getRuleExpressions, mergeFunctionMeta } from './registry';
import type { ExpressionFunctionMetaRegistry } from './types';

describe('mergeFunctionMeta', () => {
  it('returns a copy of the defaults when called with no arguments', () => {
    const merged = mergeFunctionMeta();
    expect(merged).toEqual(defaultFunctionMeta);
    expect(merged).not.toBe(defaultFunctionMeta);
  });

  it('ignores undefined sources', () => {
    expect(mergeFunctionMeta(undefined)).toEqual(defaultFunctionMeta);
  });

  it('adds custom function metadata on top of the defaults', () => {
    const custom: ExpressionFunctionMetaRegistry = { pow: { arity: 2 } };
    const merged = mergeFunctionMeta(custom);
    expect(merged.pow).toBe(custom.pow);
    expect(merged.add).toBe(defaultFunctionMeta.add);
  });

  it('lets later registries win', () => {
    const merged = mergeFunctionMeta({ add: { label: 'first' } }, { add: { label: 'second' } });
    expect(merged.add.label).toBe('second');
  });
});

describe('getRuleExpressions', () => {
  const lhs: ExpressionNode = { kind: 'field', field: 'a' };
  const rhs: ExpressionNode = { kind: 'func', fn: 'abs', args: [{ kind: 'field', field: 'b' }] };

  it('reads an LHS expression from rule.lhs', () => {
    const rule = { field: 'a', operator: '=', value: 1, lhs } as RuleType;
    expect(getRuleExpressions(rule)).toEqual({ lhs, rhs: undefined });
  });

  it('reads an RHS expression from value when valueSource is "expression"', () => {
    const rule = { field: 'a', operator: '=', value: rhs, valueSource: 'expression' } as RuleType;
    expect(getRuleExpressions(rule)).toEqual({ lhs: undefined, rhs });
  });

  it('reads both sides at once', () => {
    const rule = {
      field: 'a',
      operator: '=',
      value: rhs,
      valueSource: 'expression',
      lhs,
    } as RuleType;
    expect(getRuleExpressions(rule)).toEqual({ lhs, rhs });
  });

  it('ignores value when valueSource is not "expression"', () => {
    const rule = { field: 'a', operator: '=', value: rhs } as RuleType;
    expect(getRuleExpressions(rule)).toBeUndefined();
  });

  it('returns undefined when the rule carries no expression', () => {
    expect(getRuleExpressions({ field: 'a', operator: '=', value: 1 } as RuleType)).toBeUndefined();
  });
});
