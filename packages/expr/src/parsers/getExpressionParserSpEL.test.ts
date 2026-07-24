import { formatQuery } from '@react-querybuilder/core';
import { parseSpEL } from '@react-querybuilder/core/parseSpEL';
import type {
  ParseSpELExpressionContext,
  SpELExpressionOperand,
} from '@react-querybuilder/core/parseSpEL';
import { expressionRuleProcessorSpEL } from '../index';
import { expressionParserSpEL, getExpressionParserSpEL } from './getExpressionParserSpEL';

const fields = [
  { name: 'price', value: 'price', label: 'Price' },
  { name: 'cost', value: 'cost', label: 'Cost' },
  { name: 'quantity', value: 'quantity', label: 'Quantity' },
  { name: 'a', value: 'a', label: 'A' },
  { name: 'b', value: 'b', label: 'B' },
  { name: 'x', value: 'x', label: 'X' },
];
const opt = { getExpression: expressionParserSpEL, fields } as const;
const anyCtx: ParseSpELExpressionContext = { fieldExists: () => true };

/** Captures the raw SpEL operand subtree passed to `getExpression` for direct-handler tests. */
const capture = (spel: string): SpELExpressionOperand => {
  let node: SpELExpressionOperand | undefined;
  parseSpEL(spel, {
    fields,
    getExpression: n => {
      node = n;
      return null;
    },
  });
  return node as SpELExpressionOperand;
};

describe('parseSpEL with expressionParserSpEL', () => {
  it('converts arithmetic RHS', () => {
    expect(parseSpEL('price > (cost * 2)', opt).rules[0]).toEqual({
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

  it('flips an expression LHS to field <op> expression', () => {
    expect(parseSpEL('(a + b) < price', opt).rules[0]).toMatchObject({
      field: 'price',
      operator: '>',
      value: { kind: 'func', fn: 'add' },
      valueSource: 'expression',
    });
  });

  it('converts expression <op> literal to lhs', () => {
    expect(parseSpEL('(price * 2) > 100', opt).rules[0]).toMatchObject({
      field: '',
      operator: '>',
      value: 100,
      lhs: { kind: 'func', fn: 'multiply' },
    });
  });

  it('converts literal <op> expression to lhs with a flipped operator', () => {
    expect(parseSpEL('100 < (price * 2)', opt).rules[0]).toMatchObject({
      field: '',
      operator: '>',
      value: 100,
      lhs: { kind: 'func', fn: 'multiply' },
    });
  });

  it('converts expression <op> expression to lhs/value', () => {
    expect(parseSpEL('(price * quantity) > (cost * 2)', opt).rules[0]).toMatchObject({
      field: '',
      operator: '>',
      lhs: { kind: 'func', fn: 'multiply' },
      value: { kind: 'func', fn: 'multiply' },
      valueSource: 'expression',
    });
  });

  it.each([
    ['==', '='],
    ['!=', '!='],
  ])('maps %s operator to %s', (spelOp, op) => {
    expect(parseSpEL(`x ${spelOp} (a + b)`, opt).rules[0]).toMatchObject({ operator: op });
  });

  it.each([
    ['+', 'add'],
    ['-', 'subtract'],
    ['*', 'multiply'],
    ['/', 'divide'],
    ['%', 'mod'],
  ])('recovers the %s arithmetic operator', (spelOp, fn) => {
    expect(parseSpEL(`price > (cost ${spelOp} 2)`, opt).rules[0]).toMatchObject({
      value: { kind: 'func', fn },
    });
  });

  it('drops a rule referencing an unknown field leaf', () => {
    expect(parseSpEL('price > (cost * unknownField)', opt).rules).toEqual([]);
  });

  it('ignores expression operands when getExpression is omitted', () => {
    expect(parseSpEL('price > (cost * 2)', { fields }).rules).toEqual([]);
  });

  it.each([
    'price > (cost * 2)',
    '(price * 2) > 100',
    'x != (a + b)',
    'price > (cost - 2)',
    'price > (cost / 2)',
    'price > (cost % 2)',
  ])('round-trips %s', spel => {
    const query = parseSpEL(spel, opt);
    const back = formatQuery(query, { format: 'spel', ruleProcessor: expressionRuleProcessorSpEL });
    expect(back).toBe(spel);
  });
});

describe('getExpressionParserSpEL custom registries', () => {
  it('overrides a built-in operator inverse', () => {
    const getExpression = getExpressionParserSpEL(
      { operators: { 'op-plus': 'sum' } },
      { sum: { label: 'sum', arity: 2 } }
    );
    expect(parseSpEL('price > (cost + 2)', { getExpression, fields }).rules[0]).toMatchObject({
      value: { kind: 'func', fn: 'sum' },
    });
  });

  it('drops a rule when custom meta arity does not match', () => {
    const getExpression = getExpressionParserSpEL(undefined, {
      multiply: { label: 'multiply', arity: 3 },
    });
    expect(parseSpEL('price > (cost * 2)', { getExpression, fields }).rules).toEqual([]);
  });
});

describe('parseSpELExpression via handler directly', () => {
  it('returns null when a field leaf does not exist', () => {
    expect(
      expressionParserSpEL(capture('price > (cost * 2)'), { fieldExists: () => false })
    ).toBeNull();
  });

  it('returns null for an unhandled node type', () => {
    expect(
      expressionParserSpEL({ type: 'method' } as unknown as SpELExpressionOperand, anyCtx)
    ).toBeNull();
  });

  it('builds a func node for a known math operand', () => {
    expect(expressionParserSpEL(capture('price > (cost * 2)'), anyCtx)).toMatchObject({
      kind: 'func',
      fn: 'multiply',
    });
  });
});
