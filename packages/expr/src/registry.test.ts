import type { RuleType } from '@react-querybuilder/core';
import { defaultFunctions } from './defaultFunctions';
import { getExpressions, mergeFunctions } from './registry';
import type { ExpressionFunctionRegistry, RuleExpressions } from './types';

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
    const custom: ExpressionFunctionRegistry = { pow: { name: 'pow', arity: 2 } };
    const merged = mergeFunctions(custom);
    expect(merged.pow).toBe(custom.pow);
    expect(merged.add).toBe(defaultFunctions.add);
  });

  it('lets later registries win', () => {
    const merged = mergeFunctions({ add: { name: 'first' } }, { add: { name: 'second' } });
    expect(merged.add.name).toBe('second');
  });
});

describe('getExpressions', () => {
  const expressions: RuleExpressions = { version: 1, lhs: { kind: 'field', field: 'a' } };

  it('reads the payload from rule.meta', () => {
    const rule = { field: 'a', operator: '=', value: 1, meta: { expressions } } as RuleType;
    expect(getExpressions(rule)).toBe(expressions);
  });

  it('returns undefined when meta is absent', () => {
    expect(getExpressions({ field: 'a', operator: '=', value: 1 } as RuleType)).toBeUndefined();
  });

  it('returns undefined when meta has no expressions', () => {
    const rule = { field: 'a', operator: '=', value: 1, meta: {} } as RuleType;
    expect(getExpressions(rule)).toBeUndefined();
  });
});
