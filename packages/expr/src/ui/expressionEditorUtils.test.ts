import type { Option } from '@react-querybuilder/core';
import { defaultFunctionMeta } from '../functions/meta';
import type { ExpressionFunctionMetaRegistry } from '../types';
import {
  arityCount,
  changeFunction,
  defaultNode,
  isUnaryArity,
  rhsDefaultNode,
} from './expressionEditorUtils';

const fields: Option[] = [
  { name: 'price', value: 'price', label: 'Price' },
  { name: 'qty', value: 'qty', label: 'Qty' },
];

describe('arityCount', () => {
  it('uses a fixed numeric arity verbatim', () => {
    expect(arityCount(2, 5)).toBe(2);
  });

  it('clamps the current count into a [min, max] range', () => {
    expect(arityCount([2, 4], 0)).toBe(2); // below min -> min
    expect(arityCount([2, 4], 3)).toBe(3); // within range -> current
    expect(arityCount([2, 4], 9)).toBe(4); // above max -> max
  });

  it('falls back to the current count when arity is absent', () => {
    expect(arityCount(undefined, 3)).toBe(3);
  });
});

describe('defaultNode', () => {
  it('builds a field node from the first field (or empty)', () => {
    expect(defaultNode('field', fields)).toEqual({ kind: 'field', field: 'price' });
    expect(defaultNode('field', [])).toEqual({ kind: 'field', field: '' });
  });

  it('builds an empty value node', () => {
    expect(defaultNode('value', fields)).toEqual({ kind: 'value', value: '' });
  });

  it('builds a func node from the first registry entry with default args', () => {
    expect(defaultNode('func', fields, defaultFunctionMeta)).toEqual({
      kind: 'func',
      fn: 'add',
      args: [
        { kind: 'field', field: 'price' },
        { kind: 'field', field: 'price' },
      ],
    });
  });

  it('builds an empty func node when no registry is supplied', () => {
    expect(defaultNode('func', fields)).toEqual({ kind: 'func', fn: '', args: [] });
  });
});

describe('changeFunction', () => {
  it('keeps existing args within the new arity', () => {
    const args = [
      { kind: 'field', field: 'price' } as const,
      { kind: 'field', field: 'qty' } as const,
    ];
    expect(changeFunction('abs', args, fields, defaultFunctionMeta)).toEqual({
      kind: 'func',
      fn: 'abs',
      args: [{ kind: 'field', field: 'price' }],
    });
  });

  it('fills new arg slots with default field nodes', () => {
    expect(changeFunction('multiply', [], fields, defaultFunctionMeta)).toEqual({
      kind: 'func',
      fn: 'multiply',
      args: [
        { kind: 'field', field: 'price' },
        { kind: 'field', field: 'price' },
      ],
    });
  });

  it('uses the current arg count for an unknown function', () => {
    const reg: ExpressionFunctionMetaRegistry = {};
    expect(changeFunction('nope', [{ kind: 'value', value: 1 }], fields, reg)).toEqual({
      kind: 'func',
      fn: 'nope',
      args: [{ kind: 'value', value: 1 }],
    });
  });
});

describe('rhsDefaultNode', () => {
  it('roots the RHS at the first registered function with default field args', () => {
    expect(rhsDefaultNode(fields, defaultFunctionMeta)).toEqual({
      kind: 'func',
      fn: 'add',
      args: [
        { kind: 'field', field: 'price' },
        { kind: 'field', field: 'price' },
      ],
    });
  });

  it('falls back to an empty func node when the registry is empty', () => {
    expect(rhsDefaultNode(fields, {})).toEqual({ kind: 'func', fn: '', args: [] });
  });
});

describe('isUnaryArity', () => {
  it('accepts a fixed arity of exactly 1', () => {
    expect(isUnaryArity(1)).toBe(true);
    expect(isUnaryArity(2)).toBe(false);
    expect(isUnaryArity(0)).toBe(false);
  });

  it('accepts a [min, max] range that includes 1', () => {
    expect(isUnaryArity([1, 2])).toBe(true);
    expect(isUnaryArity([0, 3])).toBe(true);
    expect(isUnaryArity([2, 4])).toBe(false);
  });

  it('treats an absent arity as variadic (eligible)', () => {
    expect(isUnaryArity(undefined)).toBe(true);
  });
});
