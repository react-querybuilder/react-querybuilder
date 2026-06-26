import { defaultFunctions } from '../defaultFunctions';
import type { ExpressionFunctionRegistry, ExpressionNode } from '../types';
import type { ParameterizedSerializeContext } from './serializeParameterized';
import { serializeParameterized } from './serializeParameterized';

const makeCtx = (
  overrides: Partial<ParameterizedSerializeContext> = {}
): ParameterizedSerializeContext => ({
  registry: defaultFunctions,
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

  it('throws when a function lacks a parameterized serializer', () => {
    const reg: ExpressionFunctionRegistry = { nofmt: { arity: 1 } };
    const ctx = makeCtx({ registry: reg });
    const node: ExpressionNode = {
      kind: 'func',
      fn: 'nofmt',
      args: [{ kind: 'field', field: 'a' }],
    };
    expect(() => serializeParameterized(node, ctx)).toThrow(/No "parameterized" serializer/);
  });
});
