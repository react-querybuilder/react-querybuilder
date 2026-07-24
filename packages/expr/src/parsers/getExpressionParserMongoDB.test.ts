import { formatQuery } from '@react-querybuilder/core';
import { parseMongoDB } from '@react-querybuilder/core/parseMongoDB';
import type { ParseMongoDBExpressionContext } from '@react-querybuilder/core/parseMongoDB';
import { expressionRuleProcessorMongoDBQuery } from '../index';
import { expressionParserMongoDB, getExpressionParserMongoDB } from './getExpressionParserMongoDB';

const fields = [
  { name: 'price', value: 'price', label: 'Price' },
  { name: 'cost', value: 'cost', label: 'Cost' },
  { name: 'quantity', value: 'quantity', label: 'Quantity' },
  { name: 'a', value: 'a', label: 'A' },
  { name: 'b', value: 'b', label: 'B' },
  { name: 'x', value: 'x', label: 'X' },
  { name: 'd', value: 'd', label: 'D' },
];
const opt = { getExpression: expressionParserMongoDB, fields } as const;
const anyCtx: ParseMongoDBExpressionContext = { fieldExists: () => true };

describe('parseMongoDB with expressionParserMongoDB', () => {
  it('converts arithmetic RHS', () => {
    expect(
      parseMongoDB({ $expr: { $gt: ['$price', { $multiply: ['$cost', 2] }] } }, opt).rules[0]
    ).toEqual({
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
      parseMongoDB(
        { $expr: { $gt: [{ $multiply: ['$price', '$quantity'] }, { $multiply: ['$cost', 2] }] } },
        opt
      ).rules[0]
    ).toMatchObject({
      field: '',
      operator: '>',
      lhs: { kind: 'func', fn: 'multiply' },
      value: { kind: 'func', fn: 'multiply' },
      valueSource: 'expression',
    });
  });

  it('converts expression <op> literal to lhs', () => {
    expect(parseMongoDB({ $expr: { $gt: [{ $abs: '$a' }, 5] } }, opt).rules[0]).toEqual({
      field: '',
      operator: '>',
      lhs: { kind: 'func', fn: 'abs', args: [{ kind: 'field', field: 'a' }] },
      value: 5,
    });
  });

  it.each([
    ['$eq', '='],
    ['$ne', '!='],
  ])('maps %s operator to %s', (mOp, op) => {
    expect(parseMongoDB({ $expr: { [mOp]: ['$x', { $abs: '$a' }] } }, opt).rules[0]).toMatchObject({
      operator: op,
    });
  });

  it.each([
    ['$abs', 'abs'],
    ['$toUpper', 'upper'],
    ['$toLower', 'lower'],
  ])('unary function %s → %s', (mFn, fn) => {
    expect(parseMongoDB({ $expr: { $gt: ['$x', { [mFn]: '$a' }] } }, opt).rules[0]).toMatchObject({
      value: { kind: 'func', fn, args: [{ kind: 'field', field: 'a' }] },
    });
  });

  it('flattens $min/$max array arguments', () => {
    expect(
      parseMongoDB({ $expr: { $gt: ['$x', { $min: ['$a', '$b'] }] } }, opt).rules[0]
    ).toMatchObject({
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
    expect(
      parseMongoDB(
        {
          $expr: {
            $and: [
              { $gte: ['$price', { $add: ['$a', '$b'] }] },
              { $lte: ['$price', { $multiply: ['$cost', 2] }] },
            ],
          },
        },
        opt
      ).rules[0]
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

  it('drops a rule with an unknown operator', () => {
    expect(parseMongoDB({ $expr: { $gt: ['$x', { $pow: ['$a', 2] }] } }, opt).rules).toEqual([]);
  });

  it('drops a rule with an arity mismatch', () => {
    expect(parseMongoDB({ $expr: { $gt: ['$x', { $abs: ['$a', '$b'] }] } }, opt).rules).toEqual([]);
  });

  it('drops a rule referencing an unknown field leaf', () => {
    expect(
      parseMongoDB({ $expr: { $gt: ['$x', { $multiply: ['$price', '$unknownField'] }] } }, opt)
        .rules
    ).toEqual([]);
  });

  it('ignores expression operands when getExpression is omitted', () => {
    expect(
      parseMongoDB({ $expr: { $gt: ['$price', { $multiply: ['$cost', 2] }] } }, { fields }).rules
    ).toEqual([]);
  });

  it.each([
    { $expr: { $gt: ['$price', { $multiply: ['$cost', 2] }] } },
    { $expr: { $gt: [{ $abs: '$a' }, 5] } },
    { $expr: { $eq: ['$x', { $abs: '$a' }] } },
    { $expr: { $lt: [{ $min: ['$a', '$b'] }, 5] } },
    {
      $expr: {
        $and: [
          { $gte: ['$price', { $add: ['$a', '$b'] }] },
          { $lte: ['$price', { $multiply: ['$cost', 2] }] },
        ],
      },
    },
  ])('round-trips %o', mongo => {
    const query = parseMongoDB(mongo, opt);
    const back = formatQuery(query, {
      format: 'mongodb_query',
      ruleProcessor: expressionRuleProcessorMongoDBQuery,
      parseNumbers: true,
    });
    expect(back).toEqual(mongo);
  });
});

describe('getExpressionParserMongoDB custom registries', () => {
  it('merges a custom operator', () => {
    const getExpression = getExpressionParserMongoDB(
      { $pow: 'pow' },
      { pow: { label: 'pow', arity: 2 } }
    );
    expect(
      parseMongoDB({ $expr: { $gte: [{ $pow: ['$x', 2] }, 9] } }, { getExpression, fields })
        .rules[0]
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

describe('parseMongoDBExpression via handler directly', () => {
  it('returns null for an arity mismatch', () => {
    expect(expressionParserMongoDB({ $abs: ['$a', '$b'] }, anyCtx)).toBeNull();
  });

  it('returns null when a field leaf does not exist', () => {
    expect(expressionParserMongoDB('$nope', { fieldExists: () => false })).toBeNull();
  });

  it('returns null for an empty object', () => {
    expect(expressionParserMongoDB({}, anyCtx)).toBeNull();
  });

  it('returns null for an unmapped operator', () => {
    expect(expressionParserMongoDB({ $pow: ['$a', 2] }, anyCtx)).toBeNull();
  });

  it('treats a non-$ string as a value node', () => {
    expect(expressionParserMongoDB('hello', anyCtx)).toEqual({ kind: 'value', value: 'hello' });
  });
});
