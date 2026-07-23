import type { DefaultRuleGroupType, DefaultRuleType, ExpressionNode } from '../../types';
import { parseJSONata } from './parseJSONata';
import type { JSONataExpressionOperand, ParseJSONataExpressionContext } from './types';
import { isJSONataExpressionOperand } from './utils';

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
  node: JSONataExpressionOperand,
  ctx: ParseJSONataExpressionContext
): ExpressionNode | null => {
  // oxlint-disable-next-line typescript/no-explicit-any
  const build = (n: any): ExpressionNode | null => {
    if (n?.type === 'path') {
      const field = n.steps.map((s: { value: string }) => s.value).join('.');
      return ctx.fieldExists(field) ? { kind: 'field', field } : null;
    }
    if (n?.type === 'number' || n?.type === 'string' || n?.type === 'value') {
      return { kind: 'value', value: n.value };
    }
    if (n?.type === 'binary') {
      const l = build(n.lhs);
      const r = build(n.rhs);
      if (!l || !r) return null;
      return { kind: 'func', fn: n.value, args: [l, r] };
    }
    if (n?.type === 'function') {
      const name = n.procedure.value;
      const raw = (n.arguments ?? []).flatMap(
        (a: { type: string; value: string; expressions: unknown[] }) =>
          a.type === 'unary' && a.value === '[' ? a.expressions : [a]
      );
      const args: ExpressionNode[] = [];
      for (const a of raw) {
        const x = build(a);
        if (!x) return null;
        args.push(x);
      }
      return { kind: 'func', fn: name, args };
    }
    return null;
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
    expect(parseJSONata('price > cost * 2', opt)).toEqual(
      wrap({
        field: 'price',
        operator: '>',
        value: {
          kind: 'func',
          fn: '*',
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
    expect(parseJSONata('price * quantity > 100', opt)).toEqual(
      wrap({
        field: '',
        operator: '>',
        lhs: {
          kind: 'func',
          fn: '*',
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
    expect(parseJSONata('a + b < price * 2', opt)).toEqual(
      wrap({
        field: '',
        operator: '<',
        lhs: {
          kind: 'func',
          fn: '+',
          args: [
            { kind: 'field', field: 'a' },
            { kind: 'field', field: 'b' },
          ],
        },
        value: {
          kind: 'func',
          fn: '*',
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
    expect(parseJSONata('x = $abs(a)', opt).rules[0]).toMatchObject({
      field: 'x',
      operator: '=',
      valueSource: 'expression',
    });
  });

  it('expression <op> field flips to field <op> expression', () => {
    expect(parseJSONata('a * 2 < price', opt).rules[0]).toMatchObject({
      field: 'price',
      operator: '>',
      valueSource: 'expression',
    });
  });

  it('literal <op> expression flips operator, lhs set', () => {
    expect(parseJSONata('100 < price * 2', opt).rules[0]).toMatchObject({
      field: '',
      operator: '>',
      value: 100,
    });
  });

  it('between with expression bounds → 2-tuple value', () => {
    expect(parseJSONata('price >= a + b and price <= cost * 2', opt)).toEqual(
      wrap({
        field: 'price',
        operator: 'between',
        value: [
          {
            kind: 'func',
            fn: '+',
            args: [
              { kind: 'field', field: 'a' },
              { kind: 'field', field: 'b' },
            ],
          },
          {
            kind: 'func',
            fn: '*',
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

  it('falls through to normal parsing for non-expression comparisons', () => {
    expect(parseJSONata('price = 5', opt).rules[0]).toEqual({
      field: 'price',
      operator: '=',
      value: 5,
    });
  });

  it('drops the rule when an RHS expression leaf is invalid', () => {
    expect(parseJSONata('price > unknownField * 2', opt).rules).toEqual([]);
  });

  it('drops when an expression-vs-expression side is invalid', () => {
    expect(parseJSONata('unknownField * 2 < price * 2', opt).rules).toEqual([]);
  });

  it('drops an expression-vs-field when the expression leaf is invalid', () => {
    expect(parseJSONata('unknownField * 2 < price', opt).rules).toEqual([]);
  });

  it('drops a literal-vs-expression when the expression leaf is invalid', () => {
    expect(parseJSONata('100 < price * unknownField', opt).rules).toEqual([]);
  });

  it('drops an expression-vs-literal when the expression leaf is invalid', () => {
    expect(parseJSONata('unknownField * 2 > 100', opt).rules).toEqual([]);
  });

  it('resolves an expression rule nested inside a group', () => {
    expect(parseJSONata('(price > cost * 2)', opt).rules[0]).toMatchObject({
      field: 'price',
      valueSource: 'expression',
    });
  });

  it('drops when the comparison field is invalid', () => {
    expect(parseJSONata('notAField > $abs(a)', opt).rules).toEqual([]);
  });

  it('drops expression rule when no handler is supplied', () => {
    expect(parseJSONata('price > cost * 2', { fields }).rules).toEqual([]);
  });

  it('allows all leaf fields when no fields configured', () => {
    expect(parseJSONata('anything > $abs(foo)', { getExpression: stub }).rules[0]).toMatchObject({
      field: 'anything',
      valueSource: 'expression',
    });
  });
});

describe('isJSONataExpressionOperand', () => {
  const num = { type: 'number', value: 1 };
  const arith = { type: 'binary', value: '+', lhs: num, rhs: num };
  const func = (name: string, value = '(') => ({
    type: 'function',
    value,
    procedure: { type: 'variable', value: name },
    arguments: [num],
  });

  it.each([
    ['arithmetic binary', arith, true],
    ['parenthesized arithmetic block', { type: 'block', expressions: [arith] }, true],
    ['function call', func('abs'), true],
    ['non-arithmetic binary', { type: 'binary', value: 'and', lhs: num, rhs: num }, false],
    ['block wrapping a non-expression', { type: 'block', expressions: [num] }, false],
    ['multi-expression block', { type: 'block', expressions: [arith, arith] }, false],
    ['number literal', num, false],
    ['not function', func('not'), false],
    ['contains function', func('contains'), false],
    [
      'non-variable procedure',
      { type: 'function', value: '(', procedure: num, arguments: [num] },
      false,
    ],
    ['function without parentheses value', func('abs', 'x'), false],
    ['non-node', null, false],
  ])('%s → %s', (_label, node, expected) => {
    // oxlint-disable-next-line typescript/no-explicit-any
    expect(isJSONataExpressionOperand(node as any)).toBe(expected);
  });
});
