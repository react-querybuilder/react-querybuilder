import { defaultSQLSerializers } from '../functions/sql';
import type { ExpressionNode, SQLSerializerRegistry } from '../types';
import { serializeSQL } from './serializeSQL';

describe('serializeSQL', () => {
  it('serializes a field node', () => {
    expect(serializeSQL({ kind: 'field', field: 'price' }, defaultSQLSerializers)).toBe('price');
  });

  it('quotes field names per the dialect option', () => {
    expect(
      serializeSQL({ kind: 'field', field: 'price' }, defaultSQLSerializers, {
        quoteFieldNamesWith: '"',
      })
    ).toBe('"price"');
  });

  it('renders numeric value leaves bare', () => {
    expect(serializeSQL({ kind: 'value', value: 5 }, defaultSQLSerializers)).toBe('5');
    expect(
      serializeSQL({ kind: 'value', value: '5', valueType: 'number' }, defaultSQLSerializers)
    ).toBe('5');
  });

  it('quotes string value leaves', () => {
    expect(serializeSQL({ kind: 'value', value: 'foo' }, defaultSQLSerializers)).toBe(`'foo'`);
  });

  it('honors parseNumbers from options for plain string leaves', () => {
    expect(
      serializeSQL({ kind: 'value', value: '5' }, defaultSQLSerializers, { parseNumbers: true })
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
    expect(serializeSQL(node, defaultSQLSerializers)).toBe('(a * 3)');
  });

  it('serializes call-style functions', () => {
    const node: ExpressionNode = { kind: 'func', fn: 'abs', args: [{ kind: 'field', field: 'y' }] };
    expect(serializeSQL(node, defaultSQLSerializers)).toBe('ABS(y)');
  });

  it('resolves preset-specific serializers (min/max)', () => {
    const node: ExpressionNode = {
      kind: 'func',
      fn: 'min',
      args: [
        { kind: 'field', field: 'a' },
        { kind: 'field', field: 'b' },
      ],
    };
    // Default preset emits LEAST; the `sqlite` preset overrides to scalar MIN.
    expect(serializeSQL(node, defaultSQLSerializers)).toBe('LEAST(a, b)');
    expect(serializeSQL(node, defaultSQLSerializers, { preset: 'sqlite' })).toBe('MIN(a, b)');
    // A preset without an explicit override falls back to `default`.
    expect(serializeSQL(node, defaultSQLSerializers, { preset: 'mysql' })).toBe('LEAST(a, b)');
  });

  it('throws for an unknown function', () => {
    const node: ExpressionNode = { kind: 'func', fn: 'nope', args: [] };
    expect(() => serializeSQL(node, defaultSQLSerializers)).toThrow(/No "sql" serializer/);
  });

  it('throws when a populated registry lacks the requested serializer', () => {
    const reg: SQLSerializerRegistry = { other: (_opts, x) => `O(${x})` };
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
