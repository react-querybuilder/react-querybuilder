import { formatQuery } from '@react-querybuilder/core';
import { parseJSONata } from '@react-querybuilder/core/parseJSONata';
import type { ParseJSONataExpressionContext } from '@react-querybuilder/core/parseJSONata';
import { expressionRuleProcessorJSONata } from '../index';
import { expressionParserJSONata, getExpressionParserJSONata } from './getExpressionParserJSONata';

const fields = [
  { name: 'price', value: 'price', label: 'Price' },
  { name: 'cost', value: 'cost', label: 'Cost' },
  { name: 'quantity', value: 'quantity', label: 'Quantity' },
  { name: 'a', value: 'a', label: 'A' },
  { name: 'b', value: 'b', label: 'B' },
  { name: 'x', value: 'x', label: 'X' },
];
const opt = { getExpression: expressionParserJSONata, fields } as const;
const anyCtx: ParseJSONataExpressionContext = { fieldExists: () => true };

describe('parseJSONata with expressionParserJSONata', () => {
  it('converts arithmetic RHS', () => {
    expect(parseJSONata('price > cost * 2', opt).rules[0]).toEqual({
      field: 'price',
      operator: '>',
      value: {
        kind: 'func',
        fn: 'multiply',
        args: [
          { kind: 'field', field: 'cost' },
          { kind: 'value', value: 2 },
        ],
      },
      valueSource: 'expression',
    });
  });

  it('converts expression <op> expression to lhs/value', () => {
    expect(parseJSONata('price * quantity > cost * 2', opt).rules[0]).toMatchObject({
      field: '',
      operator: '>',
      lhs: { kind: 'func', fn: 'multiply' },
      value: { kind: 'func', fn: 'multiply' },
      valueSource: 'expression',
    });
  });

  it('converts expression <op> literal to lhs', () => {
    expect(parseJSONata('$abs(a) > 5', opt).rules[0]).toEqual({
      field: '',
      operator: '>',
      lhs: { kind: 'func', fn: 'abs', args: [{ kind: 'field', field: 'a' }] },
      value: 5,
    });
  });

  it.each([
    ['=', '='],
    ['!=', '!='],
  ])('maps %s operator to %s', (jOp, op) => {
    expect(parseJSONata(`x ${jOp} $abs(a)`, opt).rules[0]).toMatchObject({ operator: op });
  });

  it.each([
    ['$abs', 'abs'],
    ['$uppercase', 'upper'],
    ['$lowercase', 'lower'],
  ])('unary function %s → %s', (jFn, fn) => {
    expect(parseJSONata(`x > ${jFn}(a)`, opt).rules[0]).toMatchObject({
      value: { kind: 'func', fn, args: [{ kind: 'field', field: 'a' }] },
    });
  });

  it('flattens $min/$max list arguments', () => {
    expect(parseJSONata('x > $min([a, b])', opt).rules[0]).toMatchObject({
      value: {
        kind: 'func',
        fn: 'min',
        args: [
          { kind: 'field', field: 'a' },
          { kind: 'field', field: 'b' },
        ],
      },
    });
  });

  it('converts a between with expression bounds', () => {
    expect(parseJSONata('price >= a + b and price <= cost * 2', opt).rules[0]).toMatchObject({
      field: 'price',
      operator: 'between',
      value: [
        { kind: 'func', fn: 'add' },
        { kind: 'func', fn: 'multiply' },
      ],
      valueSource: 'expression',
    });
  });

  it('drops a rule with an unknown function', () => {
    expect(parseJSONata('x > $foo(a)', opt).rules).toEqual([]);
  });

  it('drops a rule with an arity mismatch', () => {
    expect(parseJSONata('x > $abs(a, b)', opt).rules).toEqual([]);
  });

  it('drops a rule referencing an unknown field leaf', () => {
    expect(parseJSONata('x > price * unknownField', opt).rules).toEqual([]);
  });

  it('drops a rule whose function argument references an unknown field', () => {
    expect(parseJSONata('x > $abs(unknownField)', opt).rules).toEqual([]);
  });

  it('ignores expression operands when getExpression is omitted', () => {
    expect(parseJSONata('price > cost * 2', { fields }).rules).toEqual([]);
  });

  it.each([
    'price > (cost * 2)',
    '$abs(a) > 5',
    'x = $abs(a)',
    '(price >= (a + b) and price <= (cost * 2))',
    'x > $min([a, b])',
  ])('round-trips %s', jsonata => {
    const query = parseJSONata(jsonata, opt);
    const back = formatQuery(query, {
      format: 'jsonata',
      ruleProcessor: expressionRuleProcessorJSONata,
      parseNumbers: true,
    });
    expect(back).toBe(jsonata);
  });
});

describe('getExpressionParserJSONata custom registries', () => {
  it('merges a custom function', () => {
    const getExpression = getExpressionParserJSONata(
      { functions: { pow: 'pow' } },
      { pow: { label: 'pow', arity: 2 } }
    );
    expect(parseJSONata('$pow(x, 2) >= 9', { getExpression, fields }).rules[0]).toMatchObject({
      lhs: {
        kind: 'func',
        fn: 'pow',
        args: [
          { kind: 'field', field: 'x' },
          { kind: 'value', value: 2 },
        ],
      },
    });
  });
});

describe('parseJSONataExpression via handler directly', () => {
  it('returns null for an arity mismatch', () => {
    const node = {
      type: 'function',
      value: '(',
      procedure: { type: 'variable', value: 'abs' },
      arguments: [
        { type: 'number', value: 1 },
        { type: 'number', value: 2 },
      ],
    };
    expect(expressionParserJSONata(node, anyCtx)).toBeNull();
  });

  it('returns null when a field leaf does not exist', () => {
    const node = { type: 'path', steps: [{ type: 'name', value: 'nope' }] };
    expect(expressionParserJSONata(node, { fieldExists: () => false })).toBeNull();
  });

  it('returns null for an unrecognized node', () => {
    const node = { type: 'lambda' };
    expect(expressionParserJSONata(node, anyCtx)).toBeNull();
  });

  it('returns null for an unmapped infix operator', () => {
    const node = {
      type: 'binary',
      value: '&',
      lhs: { type: 'number', value: 1 },
      rhs: { type: 'number', value: 2 },
    };
    expect(expressionParserJSONata(node, anyCtx)).toBeNull();
  });

  it('handles a function node with no arguments', () => {
    const node = { type: 'function', value: '(', procedure: { type: 'variable', value: 'abs' } };
    // abs requires one argument, so validation drops it
    expect(expressionParserJSONata(node, anyCtx)).toBeNull();
  });
});
