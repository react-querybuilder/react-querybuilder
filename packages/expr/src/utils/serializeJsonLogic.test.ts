import { defaultFunctions } from '../defaultFunctions';
import type { ExpressionFunctionRegistry, ExpressionNode } from '../types';
import { serializeJsonLogic } from './serializeJsonLogic';

describe('serializeJsonLogic', () => {
  it('serializes a field node to a var', () => {
    expect(serializeJsonLogic({ kind: 'field', field: 'x' }, defaultFunctions)).toEqual({
      var: 'x',
    });
  });

  it('emits coerced value leaves', () => {
    expect(serializeJsonLogic({ kind: 'value', value: 5 }, defaultFunctions)).toBe(5);
    expect(serializeJsonLogic({ kind: 'value', value: 'foo' }, defaultFunctions)).toBe('foo');
    expect(serializeJsonLogic({ kind: 'value', value: '5' }, defaultFunctions)).toBe('5');
    expect(
      serializeJsonLogic({ kind: 'value', value: '5', valueType: 'number' }, defaultFunctions)
    ).toBe(5);
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
    expect(serializeJsonLogic(node, defaultFunctions)).toEqual({ '+': [{ var: 'a' }, 3] });
  });

  it('supports an operator-name string serializer', () => {
    const reg: ExpressionFunctionRegistry = { eqop: { jsonLogic: '==' } };
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
    const reg: ExpressionFunctionRegistry = { nofmt: { arity: 1 } };
    const node: ExpressionNode = {
      kind: 'func',
      fn: 'nofmt',
      args: [{ kind: 'field', field: 'a' }],
    };
    expect(() => serializeJsonLogic(node, reg)).toThrow(/No "jsonLogic" serializer/);
  });
});
