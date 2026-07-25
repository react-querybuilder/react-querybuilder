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

  it.each([
    ['toUpperCase', 'upper'],
    ['toLowerCase', 'lower'],
  ])('recovers the %s instance method as %s', (method, fn) => {
    expect(parseSpEL(`x == price.${method}()`, opt).rules[0]).toMatchObject({
      field: 'x',
      operator: '=',
      value: { kind: 'func', fn, args: [{ kind: 'field', field: 'price' }] },
      valueSource: 'expression',
    });
  });

  it('recovers a static T(java.lang.Math) call', () => {
    expect(parseSpEL('price > T(java.lang.Math).abs(cost)', opt).rules[0]).toEqual({
      field: 'price',
      operator: '>',
      value: { kind: 'func', fn: 'abs', args: [{ kind: 'field', field: 'cost' }] },
      valueSource: 'expression',
    });
  });

  it('recovers nested static min calls as nested binary nodes (documented caveat)', () => {
    expect(
      parseSpEL('price > T(java.lang.Math).min(T(java.lang.Math).min(a, b), cost)', opt).rules[0]
    ).toEqual({
      field: 'price',
      operator: '>',
      valueSource: 'expression',
      value: {
        kind: 'func',
        fn: 'min',
        args: [
          {
            kind: 'func',
            fn: 'min',
            args: [
              { kind: 'field', field: 'a' },
              { kind: 'field', field: 'b' },
            ],
          },
          { kind: 'field', field: 'cost' },
        ],
      },
    });
  });

  it.each([['min'], ['max']])('recovers the %s static call', fn => {
    expect(parseSpEL(`price > T(java.lang.Math).${fn}(a, b)`, opt).rules[0]).toMatchObject({
      value: {
        kind: 'func',
        fn,
        args: [
          { kind: 'field', field: 'a' },
          { kind: 'field', field: 'b' },
        ],
      },
    });
  });

  it('recovers nested static calls as nested binary calls', () => {
    expect(
      parseSpEL('price > T(java.lang.Math).min(T(java.lang.Math).min(a, b), x)', opt).rules[0]
    ).toMatchObject({
      value: {
        kind: 'func',
        fn: 'min',
        args: [
          { kind: 'func', fn: 'min' },
          { kind: 'field', field: 'x' },
        ],
      },
    });
  });

  it('recovers arithmetic nested inside a call argument', () => {
    expect(parseSpEL('price > T(java.lang.Math).abs((a + b))', opt).rules[0]).toMatchObject({
      value: { kind: 'func', fn: 'abs', args: [{ kind: 'func', fn: 'add' }] },
    });
  });

  it('recovers a method call on a dotted receiver', () => {
    expect(parseSpEL(`x == price.toUpperCase()`, opt).rules[0]).toMatchObject({
      value: { kind: 'func', fn: 'upper' },
    });
  });

  it('recovers chained method calls', () => {
    expect(parseSpEL(`x == price.toUpperCase().toLowerCase()`, opt).rules[0]).toMatchObject({
      value: { kind: 'func', fn: 'lower', args: [{ kind: 'func', fn: 'upper' }] },
    });
  });

  it('drops a rule with an unknown function name', () => {
    expect(parseSpEL('price > unknownFunc(cost)', opt).rules).toEqual([]);
  });

  it('drops a rule with an unknown method name', () => {
    expect(parseSpEL('x == price.trim()', opt).rules).toEqual([]);
  });

  it('drops a call whose argument references an unknown field', () => {
    expect(parseSpEL('price > T(java.lang.Math).abs(unknownField)', opt).rules).toEqual([]);
  });

  it('ignores expression operands when getExpression is omitted', () => {
    expect(parseSpEL('price > (cost * 2)', { fields }).rules).toEqual([]);
  });

  it('ignores method operands when getExpression is omitted', () => {
    expect(parseSpEL('x == price.toUpperCase()', { fields }).rules).toEqual([]);
  });

  it.each([
    'price > (cost * 2)',
    '(price * 2) > 100',
    'x != (a + b)',
    'price > (cost - 2)',
    'price > (cost / 2)',
    'price > (cost % 2)',
    'price > T(java.lang.Math).abs(cost)',
    'price > T(java.lang.Math).min(a, b)',
    'price > T(java.lang.Math).max(a, b)',
    'x == price.toUpperCase()',
    'x == price.toLowerCase()',
    'T(java.lang.Math).abs(cost) > 100',
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

  it('adds a custom function inverse', () => {
    const getExpression = getExpressionParserSpEL(
      { functions: { myFunc: 'custom' } },
      { custom: { label: 'custom', arity: 2 } }
    );
    expect(parseSpEL('price > myFunc(a, b)', { getExpression, fields }).rules[0]).toMatchObject({
      value: {
        kind: 'func',
        fn: 'custom',
        args: [
          { kind: 'field', field: 'a' },
          { kind: 'field', field: 'b' },
        ],
      },
    });
  });

  it('adds a custom method inverse', () => {
    const getExpression = getExpressionParserSpEL(
      { methods: { trim: 'trim' } },
      { trim: { label: 'trim', arity: 1 } }
    );
    expect(parseSpEL('x == price.trim()', { getExpression, fields }).rules[0]).toMatchObject({
      value: { kind: 'func', fn: 'trim', args: [{ kind: 'field', field: 'price' }] },
    });
  });

  // Mirrors the combined registry example in `website/docs/expr.mdx` (the "SpEL" import section).
  describe('documented custom registry example', () => {
    const getExpression = getExpressionParserSpEL(
      {
        operators: { 'op-multiply': 'scale' },
        functions: { pow: 'pow' },
        methods: { trim: 'trim' },
      },
      {
        scale: { label: 'scale', arity: 2 },
        pow: { label: 'pow', arity: 2 },
        trim: { label: 'trim', arity: 1 },
      }
    );

    it('parses a custom bare function call with a literal argument', () => {
      expect(parseSpEL('price > pow(cost, 2)', { getExpression, fields }).rules[0]).toMatchObject({
        field: 'price',
        operator: '>',
        valueSource: 'expression',
        value: {
          kind: 'func',
          fn: 'pow',
          args: [
            { kind: 'field', field: 'cost' },
            { kind: 'value', value: 2 },
          ],
        },
      });
    });

    it('applies a custom arithmetic operator override', () => {
      expect(parseSpEL('price > (cost * 2)', { getExpression, fields }).rules[0]).toMatchObject({
        value: { kind: 'func', fn: 'scale' },
      });
    });

    it('applies a custom method override', () => {
      expect(parseSpEL('x == cost.trim()', { getExpression, fields }).rules[0]).toMatchObject({
        value: { kind: 'func', fn: 'trim', args: [{ kind: 'field', field: 'cost' }] },
      });
    });
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
