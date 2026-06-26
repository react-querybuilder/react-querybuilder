import { defaultFunctions } from '../defaultFunctions';
import type { ExpressionFunctionRegistry, ExpressionNode } from '../types';
import { validateExpression } from './validateExpression';

const val: ExpressionNode = { kind: 'value', value: 1 };

describe('validateExpression', () => {
  it('flags a missing node', () => {
    const result = validateExpression(undefined, defaultFunctions);
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain('Missing expression node');
  });

  it('accepts a valid field reference', () => {
    expect(validateExpression({ kind: 'field', field: 'a' }, defaultFunctions).valid).toBe(true);
  });

  it('flags an empty field reference', () => {
    const result = validateExpression({ kind: 'field', field: '' }, defaultFunctions);
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain('Field reference is empty');
  });

  it('flags a non-string field reference', () => {
    const node = { kind: 'field', field: 5 } as unknown as ExpressionNode;
    expect(validateExpression(node, defaultFunctions).valid).toBe(false);
  });

  it('accepts a value node', () => {
    expect(validateExpression(val, defaultFunctions).valid).toBe(true);
  });

  it('flags an unknown function', () => {
    const result = validateExpression({ kind: 'func', fn: 'nope', args: [] }, defaultFunctions);
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain('Unknown function "nope"');
  });

  it('flags a fixed-arity mismatch', () => {
    const result = validateExpression({ kind: 'func', fn: 'add', args: [val] }, defaultFunctions);
    expect(result.valid).toBe(false);
    expect(result.reasons[0]).toMatch(/expects 2 argument/);
  });

  it('accepts a satisfied fixed arity', () => {
    const node: ExpressionNode = { kind: 'func', fn: 'add', args: [val, val] };
    expect(validateExpression(node, defaultFunctions).valid).toBe(true);
  });

  describe('range arity', () => {
    const reg: ExpressionFunctionRegistry = { rng: { arity: [1, 2] } };
    const node = (count: number): ExpressionNode => ({
      kind: 'func',
      fn: 'rng',
      args: Array.from({ length: count }, () => val),
    });

    it('rejects too few', () => {
      const result = validateExpression(node(0), reg);
      expect(result.valid).toBe(false);
      expect(result.reasons[0]).toMatch(/expects 1.2 argument/);
    });

    it('accepts within range', () => {
      expect(validateExpression(node(1), reg).valid).toBe(true);
      expect(validateExpression(node(2), reg).valid).toBe(true);
    });

    it('rejects too many', () => {
      expect(validateExpression(node(3), reg).valid).toBe(false);
    });
  });

  describe('undefined arity (unconstrained)', () => {
    const reg: ExpressionFunctionRegistry = { any: {} };

    it('accepts zero args', () => {
      const result = validateExpression({ kind: 'func', fn: 'any', args: [] }, reg);
      expect(result.valid).toBe(true);
    });

    it('accepts one arg', () => {
      expect(validateExpression({ kind: 'func', fn: 'any', args: [val] }, reg).valid).toBe(true);
    });

    it('treats a missing args property as zero args (still valid)', () => {
      const node = { kind: 'func', fn: 'any' } as unknown as ExpressionNode;
      expect(validateExpression(node, reg).valid).toBe(true);
    });
  });

  it('recurses into nested arguments', () => {
    const node: ExpressionNode = {
      kind: 'func',
      fn: 'add',
      args: [{ kind: 'field', field: '' }, val],
    };
    const result = validateExpression(node, defaultFunctions);
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain('Field reference is empty');
  });

  it('flags an unknown node kind', () => {
    const node = { kind: 'bogus' } as unknown as ExpressionNode;
    const result = validateExpression(node, defaultFunctions);
    expect(result.valid).toBe(false);
    expect(result.reasons[0]).toMatch(/Unknown expression node kind "bogus"/);
  });

  describe('serializer presence', () => {
    const reg: ExpressionFunctionRegistry = { sqlOnly: { arity: 1, sql: x => `S(${x})` } };
    const node: ExpressionNode = { kind: 'func', fn: 'sqlOnly', args: [val] };

    it('passes when the requested serializer is present', () => {
      expect(validateExpression(node, reg, 'sql').valid).toBe(true);
    });

    it('flags a function missing the requested serializer', () => {
      const result = validateExpression(node, reg, 'jsonLogic');
      expect(result.valid).toBe(false);
      expect(result.reasons).toContain('Function "sqlOnly" has no "jsonLogic" serializer');
    });

    it('ignores serializer presence when none is requested', () => {
      expect(validateExpression(node, reg).valid).toBe(true);
    });
  });
});
