import { defaultJsonLogicSerializers } from '../functions/jsonLogic';
import type { ExpressionNode, JsonLogicSerializerRegistry } from '../types';
import { serializeJsonLogic } from './serializeJsonLogic';

describe('serializeJsonLogic', () => {
  it('serializes a field node to a var', () => {
    expect(serializeJsonLogic({ kind: 'field', field: 'x' }, defaultJsonLogicSerializers)).toEqual({
      var: 'x',
    });
  });

  it('emits coerced value leaves', () => {
    expect(serializeJsonLogic({ kind: 'value', value: 5 }, defaultJsonLogicSerializers)).toBe(5);
    expect(serializeJsonLogic({ kind: 'value', value: 'foo' }, defaultJsonLogicSerializers)).toBe(
      'foo'
    );
    expect(serializeJsonLogic({ kind: 'value', value: '5' }, defaultJsonLogicSerializers)).toBe(
      '5'
    );
    expect(
      serializeJsonLogic(
        { kind: 'value', value: '5', valueType: 'number' },
        defaultJsonLogicSerializers
      )
    ).toBe(5);
  });

  it('emits a parameter name as a literal', () => {
    expect(
      serializeJsonLogic({ kind: 'parameter', parameter: 'p1' }, defaultJsonLogicSerializers)
    ).toBe('p1');
  });

  it('serializes function nodes via the function-style serializer', () => {
    const node: ExpressionNode = {
      kind: 'func',
      fn: 'add',
      args: [
        { kind: 'field', field: 'a' },
        { kind: 'value', value: 3 },
      ],
    };
    expect(serializeJsonLogic(node, defaultJsonLogicSerializers)).toEqual({
      '+': [{ var: 'a' }, 3],
    });
  });

  it('supports an operator-name string serializer', () => {
    const reg: JsonLogicSerializerRegistry = { eqop: '==' };
    const node: ExpressionNode = {
      kind: 'func',
      fn: 'eqop',
      args: [
        { kind: 'field', field: 'a' },
        { kind: 'value', value: 1 },
      ],
    };
    expect(serializeJsonLogic(node, reg)).toEqual({ '==': [{ var: 'a' }, 1] });
  });

  it('throws when a function lacks a jsonLogic serializer', () => {
    const reg: JsonLogicSerializerRegistry = { other: '!' };
    const node: ExpressionNode = {
      kind: 'func',
      fn: 'nofmt',
      args: [{ kind: 'field', field: 'a' }],
    };
    expect(() => serializeJsonLogic(node, reg)).toThrow(/No "jsonLogic" serializer/);
  });
});
