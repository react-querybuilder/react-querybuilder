import { defaultFunctions } from '../defaultFunctions';
import type { ExpressionFunctionRegistry } from '../types';
import type { ExpressionFieldOption } from './expressionEditorUtils';
import { arityCount, changeFunction, coerceNumber, defaultNode } from './expressionEditorUtils';

const fields: ExpressionFieldOption[] = [
  { name: 'price', label: 'Price' },
  { name: 'qty', label: 'Qty' },
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

describe('coerceNumber', () => {
  it('returns the (string) input for empty/blank values', () => {
    expect(coerceNumber('')).toBe('');
    expect(coerceNumber('   ')).toBe('   ');
    expect(coerceNumber(null)).toBe('');
    expect(coerceNumber(undefined)).toBe('');
  });

  it('parses numeric strings', () => {
    expect(coerceNumber('42')).toBe(42);
    expect(coerceNumber('3.5')).toBe(3.5);
    expect(coerceNumber(7)).toBe(7);
  });

  it('returns the original string for non-numeric input', () => {
    expect(coerceNumber('abc')).toBe('abc');
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
    expect(defaultNode('func', fields, defaultFunctions)).toEqual({
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
    expect(changeFunction('abs', args, fields, defaultFunctions)).toEqual({
      kind: 'func',
      fn: 'abs',
      args: [{ kind: 'field', field: 'price' }],
    });
  });

  it('fills new arg slots with default field nodes', () => {
    expect(changeFunction('multiply', [], fields, defaultFunctions)).toEqual({
      kind: 'func',
      fn: 'multiply',
      args: [
        { kind: 'field', field: 'price' },
        { kind: 'field', field: 'price' },
      ],
    });
  });

  it('uses the current arg count for an unknown function', () => {
    const reg: ExpressionFunctionRegistry = {};
    expect(changeFunction('nope', [{ kind: 'value', value: 1 }], fields, reg)).toEqual({
      kind: 'func',
      fn: 'nope',
      args: [{ kind: 'value', value: 1 }],
    });
  });
});
