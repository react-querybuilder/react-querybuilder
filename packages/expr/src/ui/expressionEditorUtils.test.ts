import type { Option } from '@react-querybuilder/core';
import type { FullField, RuleType, Schema } from 'react-querybuilder';
import { defaultFunctions } from '../defaultFunctions';
import type { ExpressionFunctionRegistry } from '../types';
import { arityCount, changeFunction, defaultNode, rhsDefaultNode } from './expressionEditorUtils';

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

describe('rhsDefaultNode', () => {
  const rule: RuleType = { field: 'price', operator: '=', value: '' };

  // Stubs only the three schema members the helper reads: a single-source list, the
  // rule-default resolver, and the fieldMap used to resolve `fieldData`.
  const mkSchema = (
    valueSource: string | null,
    defaultValue: unknown,
    fieldMap: Record<string, FullField> = {}
  ): Schema<FullField, string> =>
    ({
      fieldMap,
      getValueSources: () =>
        valueSource ? [{ name: valueSource, value: valueSource, label: valueSource }] : [],
      getRuleDefaultValue: () => defaultValue,
    }) as unknown as Schema<FullField, string>;

  it('seeds a value node from the rule default when valueSource is "value"', () => {
    expect(rhsDefaultNode(mkSchema('value', 'abc'), rule)).toEqual({ kind: 'value', value: 'abc' });
  });

  it('seeds a field node naming the comparator field when valueSource is "field"', () => {
    expect(rhsDefaultNode(mkSchema('field', 'qty'), rule)).toEqual({ kind: 'field', field: 'qty' });
  });

  it('falls back to an empty field name when the field default is not a string', () => {
    expect(rhsDefaultNode(mkSchema('field', 42), rule)).toEqual({ kind: 'field', field: '' });
  });

  it('defaults to a value node when no valueSource is configured', () => {
    expect(rhsDefaultNode(mkSchema(null, ''), rule)).toEqual({ kind: 'value', value: '' });
  });

  it('resolves fieldData from the schema fieldMap when the field is present', () => {
    const fieldMap = { price: { name: 'price', value: 'price', label: 'Price' } as FullField };
    expect(rhsDefaultNode(mkSchema('value', 'x', fieldMap), rule)).toEqual({
      kind: 'value',
      value: 'x',
    });
  });
});
