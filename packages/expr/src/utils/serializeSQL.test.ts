import { defaultFunctions } from '../defaultFunctions';
import type { ExpressionFunctionRegistry, ExpressionNode } from '../types';
import { serializeSQL } from './serializeSQL';

describe('serializeSQL', () => {
  it('serializes a field node', () => {
    expect(serializeSQL({ kind: 'field', field: 'price' }, defaultFunctions)).toBe('price');
  });

  it('quotes field names per the dialect option', () => {
    expect(
      serializeSQL({ kind: 'field', field: 'price' }, defaultFunctions, {
        quoteFieldNamesWith: '"',
      })
    ).toBe('"price"');
  });

  it('renders numeric value leaves bare', () => {
    expect(serializeSQL({ kind: 'value', value: 5 }, defaultFunctions)).toBe('5');
    expect(serializeSQL({ kind: 'value', value: '5', valueType: 'number' }, defaultFunctions)).toBe(
      '5'
    );
  });

  it('quotes string value leaves', () => {
    expect(serializeSQL({ kind: 'value', value: 'foo' }, defaultFunctions)).toBe(`'foo'`);
  });

  it('honors parseNumbers from options for plain string leaves', () => {
    expect(
      serializeSQL({ kind: 'value', value: '5' }, defaultFunctions, { parseNumbers: true })
    ).toBe('5');
  });

  it('serializes nested function nodes', () => {
    const node: ExpressionNode = {
      kind: 'func',
      fn: 'multiply',
      args: [
        { kind: 'field', field: 'a' },
        { kind: 'value', value: 3 },
      ],
    };
    expect(serializeSQL(node, defaultFunctions)).toBe('(a * 3)');
  });

  it('serializes call-style functions', () => {
    const node: ExpressionNode = { kind: 'func', fn: 'abs', args: [{ kind: 'field', field: 'y' }] };
    expect(serializeSQL(node, defaultFunctions)).toBe('ABS(y)');
  });

  it('throws for an unknown function', () => {
    const node: ExpressionNode = { kind: 'func', fn: 'nope', args: [] };
    expect(() => serializeSQL(node, defaultFunctions)).toThrow(/No "sql" serializer/);
  });

  it('throws when a function lacks a sql serializer', () => {
    const reg: ExpressionFunctionRegistry = { nofmt: { name: 'nofmt', arity: 1 } };
    const node: ExpressionNode = {
      kind: 'func',
      fn: 'nofmt',
      args: [{ kind: 'field', field: 'a' }],
    };
    expect(() => serializeSQL(node, reg)).toThrow(
      /No "sql" serializer for expression function "nofmt"/
    );
  });
});
