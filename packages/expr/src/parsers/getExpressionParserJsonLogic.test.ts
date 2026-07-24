import { formatQuery } from '@react-querybuilder/core';
import type { RQBJsonLogic } from '@react-querybuilder/core';
import { parseJsonLogic } from '@react-querybuilder/core/parseJsonLogic';
import type {
  JsonLogicExpressionOperand,
  ParseJsonLogicExpressionContext,
} from '@react-querybuilder/core/parseJsonLogic';
import { expressionRuleProcessorJsonLogic } from '../index';
import {
  expressionParserJsonLogic,
  getExpressionParserJsonLogic,
} from './getExpressionParserJsonLogic';

const fields = [
  { name: 'price', value: 'price', label: 'Price' },
  { name: 'cost', value: 'cost', label: 'Cost' },
  { name: 'quantity', value: 'quantity', label: 'Quantity' },
  { name: 'a', value: 'a', label: 'A' },
  { name: 'b', value: 'b', label: 'B' },
  { name: 'x', value: 'x', label: 'X' },
];
const opt = { getExpression: expressionParserJsonLogic, fields } as const;
const anyCtx: ParseJsonLogicExpressionContext = { fieldExists: () => true };
// Arithmetic/function operands aren't part of the RQBJsonLogic type; cast test inputs through it.
const parse = (logic: unknown, options: object = opt) =>
  parseJsonLogic(logic as RQBJsonLogic, options as never);

describe('parseJsonLogic with expressionParserJsonLogic', () => {
  it('converts arithmetic RHS', () => {
    expect(parse({ '>': [{ var: 'price' }, { '*': [{ var: 'cost' }, 2] }] }).rules[0]).toEqual({
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
    expect(
      parse({
        '>': [{ '*': [{ var: 'price' }, { var: 'quantity' }] }, { '*': [{ var: 'cost' }, 2] }],
      }).rules[0]
    ).toMatchObject({
      field: '',
      operator: '>',
      lhs: { kind: 'func', fn: 'multiply' },
      value: { kind: 'func', fn: 'multiply' },
      valueSource: 'expression',
    });
  });

  it('converts expression <op> literal to lhs', () => {
    expect(parse({ '>': [{ abs: { var: 'a' } }, 5] }).rules[0]).toEqual({
      field: '',
      operator: '>',
      lhs: { kind: 'func', fn: 'abs', args: [{ kind: 'field', field: 'a' }] },
      value: 5,
    });
  });

  it.each([
    ['==', '='],
    ['===', '='],
    ['!=', '!='],
    ['!==', '!='],
  ])('maps %s operator to %s', (jlOp, op) => {
    expect(parse({ [jlOp]: [{ var: 'x' }, { abs: { var: 'a' } }] }).rules[0]).toMatchObject({
      operator: op,
    });
  });

  it.each(['abs', 'upper', 'lower'])('unary function %s', name => {
    expect(parse({ '>': [{ var: 'x' }, { [name]: { var: 'a' } }] }).rules[0]).toMatchObject({
      value: { kind: 'func', fn: name, args: [{ kind: 'field', field: 'a' }] },
    });
  });

  it('converts a between with expression bounds', () => {
    expect(
      parse({
        '<=': [
          { '+': [{ var: 'a' }, { var: 'b' }] },
          { var: 'price' },
          { '*': [{ var: 'cost' }, 2] },
        ],
      }).rules[0]
    ).toMatchObject({
      field: 'price',
      operator: 'between',
      value: [
        { kind: 'func', fn: 'add' },
        { kind: 'func', fn: 'multiply' },
      ],
      valueSource: 'expression',
    });
  });

  it('converts a notBetween with expression bounds', () => {
    expect(
      parse({
        '!': { '<=': [{ abs: { var: 'a' } }, { var: 'price' }, { '*': [{ var: 'cost' }, 2] }] },
      }).rules[0]
    ).toMatchObject({ field: 'price', operator: 'notBetween', valueSource: 'expression' });
  });

  it('drops a rule with an unknown operation', () => {
    expect(parse({ '>': [{ var: 'x' }, { foo: [{ var: 'a' }, 1] }] }).rules).toEqual([]);
  });

  it('drops a rule with an arity mismatch', () => {
    expect(parse({ '>': [{ var: 'x' }, { abs: [{ var: 'a' }, { var: 'b' }] }] }).rules).toEqual([]);
  });

  it('drops a rule referencing an unknown field leaf', () => {
    expect(
      parse({ '>': [{ var: 'x' }, { '*': [{ var: 'price' }, { var: 'unknownField' }] }] }).rules
    ).toEqual([]);
  });

  it('drops an expression between with an incomplete bound', () => {
    expect(
      parse({ '<=': [{ abs: [{ var: 'a' }, { var: 'b' }] }, { var: 'price' }, { var: 'cost' }] })
        .rules
    ).toEqual([]);
  });

  it('ignores expression operands when getExpression is omitted', () => {
    expect(
      parse({ '>': [{ var: 'price' }, { '*': [{ var: 'cost' }, 2] }] }, { fields }).rules
    ).toEqual([]);
  });

  it.each([
    { '>': [{ var: 'price' }, { '*': [{ var: 'cost' }, 2] }] },
    { '>': [{ '*': [{ var: 'price' }, { var: 'quantity' }] }, 100] },
    {
      '<=': [
        { '+': [{ var: 'a' }, { var: 'b' }] },
        { var: 'price' },
        { '*': [{ var: 'cost' }, 2] },
      ],
    },
    { '>=': [{ var: 'x' }, { abs: { var: 'a' } }] },
  ])('round-trips %o', logic => {
    const query = parse(logic);
    const back = formatQuery(query, {
      format: 'jsonlogic',
      ruleProcessor: expressionRuleProcessorJsonLogic,
      parseNumbers: true,
    });
    expect(back).toEqual({ and: [logic] });
  });
});

describe('getExpressionParserJsonLogic custom registries', () => {
  it('merges a custom operation', () => {
    const getExpression = getExpressionParserJsonLogic(
      { pow: 'pow' },
      { pow: { label: 'pow', arity: 2 } }
    );
    expect(
      parse({ '>=': [{ pow: [{ var: 'x' }, 2] }, 9] }, { getExpression, fields }).rules[0]
    ).toMatchObject({
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

describe('parseJsonLogicExpression via handler directly', () => {
  it('returns null for an arity mismatch', () => {
    const node = { abs: [{ var: 'a' }, { var: 'b' }] } as unknown as JsonLogicExpressionOperand;
    expect(expressionParserJsonLogic(node, anyCtx)).toBeNull();
  });

  it('returns null when a field leaf does not exist', () => {
    const node = { var: 'nope' } as unknown as JsonLogicExpressionOperand;
    expect(expressionParserJsonLogic(node, { fieldExists: () => false })).toBeNull();
  });

  it('builds a value leaf from a scalar', () => {
    const node = { abs: 5 } as unknown as JsonLogicExpressionOperand;
    expect(expressionParserJsonLogic(node, anyCtx)).toEqual({
      kind: 'func',
      fn: 'abs',
      args: [{ kind: 'value', value: 5 }],
    });
  });

  it('returns null for an empty object node', () => {
    const node = {} as unknown as JsonLogicExpressionOperand;
    expect(expressionParserJsonLogic(node, anyCtx)).toBeNull();
  });
});
