import type { DefaultRuleGroupType, DefaultRuleType, ExpressionNode } from '../../types';
import { parseMongoDB } from './parseMongoDB';
import type { MongoDBExpressionOperand, ParseMongoDBExpressionContext } from './types';
import { flipMongoDbOperator, isMongoDBExpressionOperand } from './utils';

const fields = [
  { name: 'price', value: 'price', label: 'Price' },
  { name: 'cost', value: 'cost', label: 'Cost' },
  { name: 'quantity', value: 'quantity', label: 'Quantity' },
  { name: 'a', value: 'a', label: 'A' },
  { name: 'b', value: 'b', label: 'B' },
  { name: 'x', value: 'x', label: 'X' },
];

// Minimal inline handler (core must not depend on @react-querybuilder/expr). Exercises the
// core wiring; real conversion/validation is tested in the expr package.
const stub = (
  node: MongoDBExpressionOperand,
  ctx: ParseMongoDBExpressionContext
): ExpressionNode | null => {
  const build = (n: unknown): ExpressionNode | null => {
    if (typeof n === 'string' && n.startsWith('$')) {
      const field = n.slice(1);
      return ctx.fieldExists(field) ? { kind: 'field', field } : null;
    }
    if (typeof n !== 'object' || n === null || Array.isArray(n)) {
      return { kind: 'value', value: n };
    }
    const [key, payload] = Object.entries(n)[0];
    const raw = Array.isArray(payload) ? payload : [payload];
    const args: ExpressionNode[] = [];
    for (const a of raw) {
      const x = build(a);
      if (!x) return null;
      args.push(x);
    }
    return { kind: 'func', fn: key, args };
  };
  return build(node);
};

const wrap = (rule: DefaultRuleType): DefaultRuleGroupType => ({
  combinator: 'and',
  rules: [rule],
});
const opt = { getExpression: stub, fields } as const;

describe('getExpression wiring', () => {
  it('RHS expression → value + valueSource:expression', () => {
    expect(parseMongoDB({ $expr: { $gt: ['$price', { $multiply: ['$cost', 2] }] } }, opt)).toEqual(
      wrap({
        field: 'price',
        operator: '>',
        value: {
          kind: 'func',
          fn: '$multiply',
          args: [
            { kind: 'field', field: 'cost' },
            { kind: 'value', value: 2 },
          ],
        },
        valueSource: 'expression',
      })
    );
  });

  it('LHS expression vs literal → lhs set, plain value', () => {
    expect(
      parseMongoDB({ $expr: { $gt: [{ $multiply: ['$price', '$quantity'] }, 100] } }, opt)
    ).toEqual(
      wrap({
        field: '',
        operator: '>',
        lhs: {
          kind: 'func',
          fn: '$multiply',
          args: [
            { kind: 'field', field: 'price' },
            { kind: 'field', field: 'quantity' },
          ],
        },
        value: 100,
      })
    );
  });

  it('expression vs expression → lhs + value both expressions', () => {
    expect(
      parseMongoDB({ $expr: { $lt: [{ $add: ['$a', '$b'] }, { $multiply: ['$price', 2] }] } }, opt)
    ).toEqual(
      wrap({
        field: '',
        operator: '<',
        lhs: {
          kind: 'func',
          fn: '$add',
          args: [
            { kind: 'field', field: 'a' },
            { kind: 'field', field: 'b' },
          ],
        },
        value: {
          kind: 'func',
          fn: '$multiply',
          args: [
            { kind: 'field', field: 'price' },
            { kind: 'value', value: 2 },
          ],
        },
        valueSource: 'expression',
      })
    );
  });

  it('field = function expression', () => {
    expect(parseMongoDB({ $expr: { $eq: ['$x', { $abs: '$a' }] } }, opt).rules[0]).toMatchObject({
      field: 'x',
      operator: '=',
      valueSource: 'expression',
    });
  });

  it('expression <op> field flips to field <op> expression', () => {
    expect(
      parseMongoDB({ $expr: { $lt: [{ $multiply: ['$a', 2] }, '$price'] } }, opt).rules[0]
    ).toMatchObject({ field: 'price', operator: '>', valueSource: 'expression' });
  });

  it('literal <op> expression flips operator, lhs set', () => {
    expect(
      parseMongoDB({ $expr: { $lt: [100, { $multiply: ['$price', 2] }] } }, opt).rules[0]
    ).toMatchObject({ field: '', operator: '>', value: 100 });
  });

  it('between with expression bounds → 2-tuple value', () => {
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
      )
    ).toEqual(
      wrap({
        field: 'price',
        operator: 'between',
        value: [
          {
            kind: 'func',
            fn: '$add',
            args: [
              { kind: 'field', field: 'a' },
              { kind: 'field', field: 'b' },
            ],
          },
          {
            kind: 'func',
            fn: '$multiply',
            args: [
              { kind: 'field', field: 'cost' },
              { kind: 'value', value: 2 },
            ],
          },
        ],
        valueSource: 'expression',
      })
    );
  });

  it('notBetween with expression bounds', () => {
    expect(
      parseMongoDB(
        {
          $expr: {
            $or: [
              { $lt: ['$price', { $add: ['$a', '$b'] }] },
              { $gt: ['$price', { $multiply: ['$cost', 2] }] },
            ],
          },
        },
        opt
      ).rules[0]
    ).toMatchObject({ field: 'price', operator: 'notBetween', valueSource: 'expression' });
  });

  it('falls through to field-to-field for non-expression $expr comparisons', () => {
    expect(
      parseMongoDB({ $expr: { $eq: ['$a', '$b'] } }, { getExpression: stub }).rules[0]
    ).toEqual({ field: 'a', operator: '=', value: 'b', valueSource: 'field' });
  });

  it('drops the rule when an RHS expression leaf is invalid', () => {
    expect(
      parseMongoDB({ $expr: { $gt: ['$price', { $multiply: ['$unknownField', 2] }] } }, opt).rules
    ).toEqual([]);
  });

  it('drops when an expression-vs-expression side is invalid', () => {
    expect(
      parseMongoDB(
        { $expr: { $lt: [{ $multiply: ['$unknownField', 2] }, { $multiply: ['$price', 2] }] } },
        opt
      ).rules
    ).toEqual([]);
  });

  it('drops an expression-vs-field when the expression leaf is invalid', () => {
    expect(
      parseMongoDB({ $expr: { $lt: [{ $multiply: ['$unknownField', 2] }, '$price'] } }, opt).rules
    ).toEqual([]);
  });

  it('drops a literal-vs-expression when the expression leaf is invalid', () => {
    expect(
      parseMongoDB({ $expr: { $lt: [100, { $multiply: ['$price', '$unknownField'] }] } }, opt).rules
    ).toEqual([]);
  });

  it('drops an expression-vs-literal when the expression leaf is invalid', () => {
    expect(
      parseMongoDB({ $expr: { $gt: [{ $multiply: ['$unknownField', 2] }, 100] } }, opt).rules
    ).toEqual([]);
  });

  it('drops when the comparison field is invalid', () => {
    expect(parseMongoDB({ $expr: { $gt: ['$notAField', { $abs: '$a' }] } }, opt).rules).toEqual([]);
  });

  it('drops a between when the expression bound leaf is invalid', () => {
    expect(
      parseMongoDB(
        {
          $expr: {
            $and: [
              { $gte: ['$price', { $add: ['$a', '$unknownField'] }] },
              { $lte: ['$price', { $multiply: ['$cost', 2] }] },
            ],
          },
        },
        opt
      ).rules
    ).toEqual([]);
  });

  it('drops a between when the subject field is invalid', () => {
    expect(
      parseMongoDB(
        {
          $expr: {
            $and: [
              { $gte: ['$notAField', { $add: ['$a', '$b'] }] },
              { $lte: ['$notAField', { $multiply: ['$cost', 2] }] },
            ],
          },
        },
        opt
      ).rules
    ).toEqual([]);
  });

  it('ignores a $and whose inner keys are not between bounds', () => {
    // Falls through (not an expression between); no matching stock handler → empty
    expect(
      parseMongoDB({ $expr: { $and: [{ $eq: ['$a', 1] }, { $eq: ['$b', 2] }] } }, opt).rules
    ).toEqual([]);
  });

  it('ignores a between whose bounds are not two-element arrays', () => {
    expect(
      parseMongoDB(
        { $expr: { $and: [{ $gte: '$price' }, { $lte: ['$price', { $abs: '$a' }] }] } },
        opt
      ).rules
    ).toEqual([]);
  });

  it('ignores a between whose conjuncts are not objects', () => {
    expect(
      parseMongoDB({ $expr: { $and: [5, { $lte: ['$price', { $abs: '$a' }] }] } }, opt).rules
    ).toEqual([]);
  });

  it('ignores a between whose bound subjects differ', () => {
    expect(
      parseMongoDB(
        {
          $expr: {
            $and: [{ $gte: ['$price', { $abs: '$a' }] }, { $lte: ['$cost', { $abs: '$b' }] }],
          },
        },
        opt
      ).rules
    ).toEqual([]);
  });

  it('ignores a between whose bounds are both non-expression operands', () => {
    // Both bounds literals → not routed as expression between; no stock handler → dropped
    expect(
      parseMongoDB({ $expr: { $and: [{ $gte: ['$price', 1] }, { $lte: ['$price', 5] }] } }, opt)
        .rules
    ).toEqual([]);
  });

  it('ignores an unknown $expr aggregation operator', () => {
    expect(parseMongoDB({ $expr: { $unknownOp: ['$a', '$b'] } }, opt).rules).toEqual([]);
  });

  it('allows all leaf fields when no fields configured', () => {
    expect(
      parseMongoDB({ $expr: { $gt: ['$anything', { $abs: '$foo' }] } }, { getExpression: stub })
        .rules[0]
    ).toMatchObject({ field: 'anything', valueSource: 'expression' });
  });
});

describe('flipMongoDbOperator', () => {
  it.each([
    ['<', '>'],
    ['<=', '>='],
    ['>', '<'],
    ['>=', '<='],
    ['=', '='],
    ['!=', '!='],
  ] as const)('%s → %s', (op, expected) => {
    expect(flipMongoDbOperator(op)).toBe(expected);
  });
});

describe('isMongoDBExpressionOperand', () => {
  it.each([
    ['aggregation object', { $multiply: ['$a', 2] }, true],
    ['field ref string', '$price', false],
    ['plain string', 'hello', false],
    ['number', 5, false],
    ['array', ['$a', '$b'], false],
    ['null', null, false],
  ])('%s → %s', (_label, operand, expected) => {
    expect(isMongoDBExpressionOperand(operand)).toBe(expected);
  });
});
