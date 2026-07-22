import { defaultParameterizedSerializers } from '../functions/parameterized';
import type { ExpressionNode, ParameterizedSerializerRegistry } from '../types';
import type { ParameterizedSerializeContext } from './serializeParameterized';
import { serializeParameterized } from './serializeParameterized';

const makeCtx = (
  overrides: Partial<ParameterizedSerializeContext> = {}
): ParameterizedSerializeContext => ({
  serializers: defaultParameterizedSerializers,
  options: {},
  parameterized: true,
  processedParamsLength: 0,
  paramBase: 'expr',
  params: [],
  paramsNamed: {},
  ...overrides,
});

describe('serializeParameterized', () => {
  it('inlines field names', () => {
    const ctx = makeCtx({ options: { quoteFieldNamesWith: '"' } });
    expect(serializeParameterized({ kind: 'field', field: 'price' }, ctx)).toBe('"price"');
  });

  it('binds positional placeholders', () => {
    const ctx = makeCtx();
    expect(serializeParameterized({ kind: 'value', value: 5 }, ctx)).toBe('?');
    expect(ctx.params).toEqual([5]);
  });

  it('binds numbered placeholders continuing from processed params', () => {
    const ctx = makeCtx({
      options: { numberedParams: true, paramPrefix: '$' },
      processedParamsLength: 2,
    });
    expect(serializeParameterized({ kind: 'value', value: 100 }, ctx)).toBe('$3');
    expect(ctx.params).toEqual([100]);
  });

  it('binds named parameters', () => {
    const ctx = makeCtx({
      parameterized: false,
      paramBase: 'price',
      options: { getNextNamedParam: base => `${base}_1`, paramPrefix: ':' },
    });
    expect(serializeParameterized({ kind: 'value', value: 7 }, ctx)).toBe(':price_1');
    expect(ctx.paramsNamed).toEqual({ price_1: 7 });
  });

  it('keeps the prefix in named keys when requested', () => {
    const ctx = makeCtx({
      parameterized: false,
      paramBase: 'price',
      options: { getNextNamedParam: base => `${base}_1`, paramPrefix: ':', paramsKeepPrefix: true },
    });
    expect(serializeParameterized({ kind: 'value', value: 7 }, ctx)).toBe(':price_1');
    expect(ctx.paramsNamed).toEqual({ ':price_1': 7 });
  });

  it('emits a positional parameter reference without binding a value', () => {
    const ctx = makeCtx();
    expect(serializeParameterized({ kind: 'parameter', parameter: 'p1' }, ctx)).toBe(':p1');
    expect(ctx.params).toEqual([]);
    expect(ctx.paramsNamed).toEqual({});
  });

  it('registers a named parameter with a null placeholder', () => {
    const ctx = makeCtx({ parameterized: false });
    expect(serializeParameterized({ kind: 'parameter', parameter: 'p1' }, ctx)).toBe(':p1');
    expect(ctx.paramsNamed).toEqual({ p1: null });
  });

  it('keeps the prefix in the named parameter key when requested', () => {
    const ctx = makeCtx({
      parameterized: false,
      options: { paramPrefix: '$', paramsKeepPrefix: true },
    });
    expect(serializeParameterized({ kind: 'parameter', parameter: 'p1' }, ctx)).toBe('$p1');
    expect(ctx.paramsNamed).toEqual({ $p1: null });
  });

  it('serializes nested functions and accumulates params in order', () => {
    const ctx = makeCtx();
    const node: ExpressionNode = {
      kind: 'func',
      fn: 'multiply',
      args: [
        { kind: 'field', field: 'a' },
        { kind: 'value', value: 4 },
      ],
    };
    expect(serializeParameterized(node, ctx)).toBe('(a * ?)');
    expect(ctx.params).toEqual([4]);
  });

  it('resolves preset-specific serializers (min/max)', () => {
    const node: ExpressionNode = {
      kind: 'func',
      fn: 'max',
      args: [
        { kind: 'field', field: 'a' },
        { kind: 'field', field: 'b' },
      ],
    };
    expect(serializeParameterized(node, makeCtx())).toBe('GREATEST(a, b)');
    expect(serializeParameterized(node, makeCtx({ options: { preset: 'sqlite' } }))).toBe(
      'MAX(a, b)'
    );
  });

  it('throws when a function lacks a parameterized serializer', () => {
    const reg: ParameterizedSerializerRegistry = { other: (_opts, x) => `O(${x})` };
    const ctx = makeCtx({ serializers: reg });
    const node: ExpressionNode = {
      kind: 'func',
      fn: 'nofmt',
      args: [{ kind: 'field', field: 'a' }],
    };
    expect(() => serializeParameterized(node, ctx)).toThrow(/No "parameterized" serializer/);
  });
});
