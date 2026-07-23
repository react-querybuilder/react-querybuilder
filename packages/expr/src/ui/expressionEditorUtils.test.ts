import type { Option } from '@react-querybuilder/core';
import { defaultFunctionMeta } from '../functions/meta';
import type { ExpressionFunctionMetaRegistry } from '../types';
import {
  admitsLHSArg,
  arityCount,
  changeFunction,
  defaultNode,
  lhsFuncNode,
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

  it('builds a parameter node from the first parameter (or empty)', () => {
    const params: Option[] = [{ name: 'p1', value: 'p1', label: 'P1' }];
    expect(defaultNode('parameter', fields, undefined, params)).toEqual({
      kind: 'parameter',
      parameter: 'p1',
    });
    expect(defaultNode('parameter', fields)).toEqual({ kind: 'parameter', parameter: '' });
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

describe('admitsLHSArg', () => {
  it('accepts a fixed arity of at least 1', () => {
    expect(admitsLHSArg(1)).toBe(true);
    expect(admitsLHSArg(2)).toBe(true);
    expect(admitsLHSArg(0)).toBe(false);
  });

  it('accepts a [min, max] range whose max is at least 1', () => {
    expect(admitsLHSArg([1, 2])).toBe(true);
    expect(admitsLHSArg([2, 4])).toBe(true);
    expect(admitsLHSArg([0, 0])).toBe(false);
  });

  it('treats an absent arity as eligible', () => {
    expect(admitsLHSArg(undefined)).toBe(true);
  });
});

describe('lhsFuncNode', () => {
  it('wraps the governing field as arg 0 for a single-argument function', () => {
    expect(lhsFuncNode('abs', 'price', [], fields, defaultFunctionMeta)).toEqual({
      kind: 'func',
      fn: 'abs',
      args: [{ kind: 'field', field: 'price' }],
    });
  });

  it('seeds extra operand slots with default field nodes', () => {
    expect(lhsFuncNode('mod', 'price', [], fields, defaultFunctionMeta)).toEqual({
      kind: 'func',
      fn: 'mod',
      args: [
        { kind: 'field', field: 'price' },
        { kind: 'field', field: 'price' },
      ],
    });
  });

  it('re-points arg 0 to the new field while preserving extra operands', () => {
    const existing = [
      { kind: 'field', field: 'price' } as const,
      { kind: 'value', value: 2 } as const,
    ];
    expect(lhsFuncNode('mod', 'qty', existing, fields, defaultFunctionMeta)).toEqual({
      kind: 'func',
      fn: 'mod',
      args: [
        { kind: 'field', field: 'qty' },
        { kind: 'value', value: 2 },
      ],
    });
  });

  it('carries extra operands across a switch between multi-argument functions', () => {
    const existing = [
      { kind: 'field', field: 'price' } as const,
      { kind: 'value', value: 2 } as const,
    ];
    expect(lhsFuncNode('min', 'price', existing, fields, defaultFunctionMeta)).toEqual({
      kind: 'func',
      fn: 'min',
      args: [
        { kind: 'field', field: 'price' },
        { kind: 'value', value: 2 },
      ],
    });
  });

  it('drops extra operands when switching to a single-argument function', () => {
    const existing = [
      { kind: 'field', field: 'price' } as const,
      { kind: 'value', value: 2 } as const,
    ];
    expect(lhsFuncNode('abs', 'price', existing, fields, defaultFunctionMeta)).toEqual({
      kind: 'func',
      fn: 'abs',
      args: [{ kind: 'field', field: 'price' }],
    });
  });

  it('guarantees the governing field arg for a zero-arity function', () => {
    const reg: ExpressionFunctionMetaRegistry = { zero: { arity: 0 } };
    expect(lhsFuncNode('zero', 'price', [], fields, reg)).toEqual({
      kind: 'func',
      fn: 'zero',
      args: [{ kind: 'field', field: 'price' }],
    });
  });
});
