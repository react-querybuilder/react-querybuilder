import { defaultFunctionMeta } from '../functions/meta';
import type { ExpressionFunctionMetaRegistry, ExpressionNode } from '../types';
import { validateExpression } from './validateExpression';

const val: ExpressionNode = { kind: 'value', value: 1 };
const meta = { meta: defaultFunctionMeta };

describe('validateExpression', () => {
  it('flags a missing node', () => {
    const result = validateExpression(undefined, meta);
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain('Missing expression node');
  });

  it('accepts a valid field reference', () => {
    expect(validateExpression({ kind: 'field', field: 'a' }, meta).valid).toBe(true);
  });

  it('flags an empty field reference', () => {
    const result = validateExpression({ kind: 'field', field: '' }, meta);
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain('Field reference is empty');
  });

  it('flags a non-string field reference', () => {
    const node = { kind: 'field', field: 5 } as unknown as ExpressionNode;
    expect(validateExpression(node, meta).valid).toBe(false);
  });

  it('accepts a value node', () => {
    expect(validateExpression(val, meta).valid).toBe(true);
  });

  it('flags an unknown function', () => {
    const result = validateExpression({ kind: 'func', fn: 'nope', args: [] }, meta);
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain('Unknown function "nope"');
  });

  it('defaults to an empty known set when no options are given', () => {
    const result = validateExpression({ kind: 'func', fn: 'add', args: [] });
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain('Unknown function "add"');
  });

  it('flags a fixed-arity mismatch', () => {
    const result = validateExpression({ kind: 'func', fn: 'add', args: [val] }, meta);
    expect(result.valid).toBe(false);
    expect(result.reasons[0]).toMatch(/expects 2 argument/);
  });

  it('accepts a satisfied fixed arity', () => {
    const node: ExpressionNode = { kind: 'func', fn: 'add', args: [val, val] };
    expect(validateExpression(node, meta).valid).toBe(true);
  });

  it('treats mod as binary (arity 2)', () => {
    expect(validateExpression({ kind: 'func', fn: 'mod', args: [val, val] }, meta).valid).toBe(
      true
    );
    const result = validateExpression({ kind: 'func', fn: 'mod', args: [val] }, meta);
    expect(result.valid).toBe(false);
    expect(result.reasons[0]).toMatch(/expects 2 argument/);
  });

  describe('range arity', () => {
    const reg: ExpressionFunctionMetaRegistry = { rng: { arity: [1, 2] } };
    const node = (count: number): ExpressionNode => ({
      kind: 'func',
      fn: 'rng',
      args: Array.from({ length: count }, () => val),
    });

    it('rejects too few', () => {
      const result = validateExpression(node(0), { meta: reg });
      expect(result.valid).toBe(false);
      expect(result.reasons[0]).toMatch(/expects 1.2 argument/);
    });

    it('accepts within range', () => {
      expect(validateExpression(node(1), { meta: reg }).valid).toBe(true);
      expect(validateExpression(node(2), { meta: reg }).valid).toBe(true);
    });

    it('rejects too many', () => {
      expect(validateExpression(node(3), { meta: reg }).valid).toBe(false);
    });
  });

  describe('undefined arity (unconstrained)', () => {
    const reg: ExpressionFunctionMetaRegistry = { any: {} };

    it('accepts zero args', () => {
      const result = validateExpression({ kind: 'func', fn: 'any', args: [] }, { meta: reg });
      expect(result.valid).toBe(true);
    });

    it('accepts one arg', () => {
      expect(
        validateExpression({ kind: 'func', fn: 'any', args: [val] }, { meta: reg }).valid
      ).toBe(true);
    });

    it('treats a missing args property as zero args (still valid)', () => {
      const node = { kind: 'func', fn: 'any' } as unknown as ExpressionNode;
      expect(validateExpression(node, { meta: reg }).valid).toBe(true);
    });
  });

  it('recurses into nested arguments', () => {
    const node: ExpressionNode = {
      kind: 'func',
      fn: 'add',
      args: [{ kind: 'field', field: '' }, val],
    };
    const result = validateExpression(node, meta);
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain('Field reference is empty');
  });

  it('flags an unknown node kind', () => {
    const node = { kind: 'bogus' } as unknown as ExpressionNode;
    const result = validateExpression(node, meta);
    expect(result.valid).toBe(false);
    expect(result.reasons[0]).toMatch(/Unknown expression node kind "bogus"/);
  });

  describe('known set via the functions map', () => {
    // A serializer map (the rule-processor path): its keys define the known set, while
    // `meta` still supplies arity. A function present in `meta` but absent from `functions`
    // is treated as unknown so its rule is omitted from that format's export.
    const functions: Record<string, unknown> = { known: (_o: unknown, x: string) => `K(${x})` };
    const argMeta: ExpressionFunctionMetaRegistry = { known: { arity: 1 } };
    const node = (count: number): ExpressionNode => ({
      kind: 'func',
      fn: 'known',
      args: Array.from({ length: count }, () => val),
    });

    it('treats a function present in functions as known', () => {
      expect(validateExpression(node(1), { functions, meta: argMeta }).valid).toBe(true);
    });

    it('flags a function absent from functions as unknown', () => {
      const result = validateExpression(node(1), { functions: {}, meta: argMeta });
      expect(result.valid).toBe(false);
      expect(result.reasons).toContain('Unknown function "known"');
    });

    it('still enforces arity from meta when functions defines the known set', () => {
      const result = validateExpression(node(2), { functions, meta: argMeta });
      expect(result.valid).toBe(false);
      expect(result.reasons[0]).toMatch(/expects 1 argument/);
    });
  });
});
