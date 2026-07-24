import { formatQuery } from '@react-querybuilder/core';
import { parseCEL } from '@react-querybuilder/core/parseCEL';
import type {
  CELExpressionOperand,
  ParseCELExpressionContext,
} from '@react-querybuilder/core/parseCEL';
import { expressionRuleProcessorCEL } from '../index';
import { expressionParserCEL, getExpressionParserCEL } from './getExpressionParserCEL';

const fields = [
  { name: 'price', value: 'price', label: 'Price' },
  { name: 'cost', value: 'cost', label: 'Cost' },
  { name: 'quantity', value: 'quantity', label: 'Quantity' },
  { name: 'a', value: 'a', label: 'A' },
  { name: 'b', value: 'b', label: 'B' },
  { name: 'x', value: 'x', label: 'X' },
];
const opt = { getExpression: expressionParserCEL, fields } as const;
const anyCtx: ParseCELExpressionContext = { fieldExists: () => true };

/** Captures the raw CEL operand subtree passed to `getExpression` for direct-handler tests. */
const capture = (cel: string): CELExpressionOperand => {
  let node: CELExpressionOperand | undefined;
  parseCEL(cel, {
    fields,
    getExpression: n => {
      node = n;
      return null;
    },
  });
  return node as CELExpressionOperand;
};

describe('parseCEL with expressionParserCEL', () => {
  it('converts arithmetic RHS', () => {
    expect(parseCEL('price > (cost * 2)', opt).rules[0]).toEqual({
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
    expect(parseCEL('(a + b) < price', opt).rules[0]).toMatchObject({
      field: 'price',
      operator: '>',
      value: { kind: 'func', fn: 'add' },
      valueSource: 'expression',
    });
  });

  it('converts expression <op> literal to lhs', () => {
    expect(parseCEL('(price * 2) > 100', opt).rules[0]).toMatchObject({
      field: '',
      operator: '>',
      value: 100,
      lhs: { kind: 'func', fn: 'multiply' },
    });
  });

  it('converts expression <op> expression to lhs/value', () => {
    expect(parseCEL('(price * quantity) > (cost * 2)', opt).rules[0]).toMatchObject({
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
  ])('maps %s operator to %s', (celOp, op) => {
    expect(parseCEL(`x ${celOp} (a + b)`, opt).rules[0]).toMatchObject({ operator: op });
  });

  it('recovers the min template as a RHS expression', () => {
    expect(parseCEL('price > (a < b ? a : b)', opt).rules[0]).toMatchObject({
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

  it('recovers the max template as a RHS expression', () => {
    expect(parseCEL('price > (a > b ? a : b)', opt).rules[0]).toMatchObject({
      value: { kind: 'func', fn: 'max' },
    });
  });

  it('unwraps nested expression groups', () => {
    expect(parseCEL('price > ((cost * 2))', opt).rules[0]).toMatchObject({
      value: { kind: 'func', fn: 'multiply' },
    });
  });

  it('drops a rule with an unknown function', () => {
    expect(parseCEL('price > pow(a, 2)', opt).rules).toEqual([]);
  });

  it('drops a rule referencing an unknown field leaf', () => {
    expect(parseCEL('price > (cost * unknownField)', opt).rules).toEqual([]);
  });

  it('drops a non-min/max conditional template', () => {
    expect(parseCEL('price > (true ? a : b)', opt).rules).toEqual([]);
    expect(parseCEL('price > (a == b ? a : b)', opt).rules).toEqual([]);
    expect(parseCEL('price > (a < b ? b : a)', opt).rules).toEqual([]);
    expect(parseCEL('price > (a < b ? a : cost.foo)', opt).rules).toEqual([]);
  });

  it('drops a min/max template with an invalid leaf', () => {
    expect(parseCEL('price > (nope < b ? nope : b)', opt).rules).toEqual([]);
  });

  it('ignores expression operands when getExpression is omitted', () => {
    expect(parseCEL('price > (cost * 2)', { fields }).rules).toEqual([]);
  });

  it.each([
    'price > (cost * 2)',
    '(price * 2) > 100',
    'x != (a + b)',
    'price > (a < b ? a : b)',
    'price > (a > b ? a : b)',
  ])('round-trips %s', cel => {
    const query = parseCEL(cel, opt);
    const back = formatQuery(query, { format: 'cel', ruleProcessor: expressionRuleProcessorCEL });
    expect(back).toBe(cel);
  });
});

describe('getExpressionParserCEL custom registries', () => {
  it('merges a custom function inverse', () => {
    const getExpression = getExpressionParserCEL(
      { functions: { pow: 'pow' } },
      { pow: { label: 'pow', arity: 2 } }
    );
    expect(parseCEL('price > pow(a, 2)', { getExpression, fields }).rules[0]).toMatchObject({
      value: {
        kind: 'func',
        fn: 'pow',
        args: [
          { kind: 'field', field: 'a' },
          { kind: 'value', value: 2 },
        ],
      },
    });
  });

  it('drops a custom function with an arity mismatch', () => {
    const getExpression = getExpressionParserCEL(
      { functions: { pow: 'pow' } },
      { pow: { label: 'pow', arity: 2 } }
    );
    expect(parseCEL('price > pow(a, b, x)', { getExpression, fields }).rules).toEqual([]);
  });

  it('drops a custom function with an invalid arg leaf', () => {
    const getExpression = getExpressionParserCEL(
      { functions: { pow: 'pow' } },
      { pow: { label: 'pow', arity: 2 } }
    );
    expect(parseCEL('price > pow(nope, 2)', { getExpression, fields }).rules).toEqual([]);
  });
});

describe('parseCELExpression via handler directly', () => {
  it('returns null when a field leaf does not exist', () => {
    expect(
      expressionParserCEL(capture('price > (cost * 2)'), { fieldExists: () => false })
    ).toBeNull();
  });

  it('returns null for an unhandled node type', () => {
    expect(
      expressionParserCEL({ type: 'Unhandled' } as unknown as CELExpressionOperand, anyCtx)
    ).toBeNull();
  });

  it('builds a func node for a known math operand', () => {
    expect(expressionParserCEL(capture('price > (cost * 2)'), anyCtx)).toMatchObject({
      kind: 'func',
      fn: 'multiply',
    });
  });
});
