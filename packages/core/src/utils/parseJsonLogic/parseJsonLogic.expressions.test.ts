import type { Except } from 'type-fest';
import type {
  DefaultRuleGroupType,
  DefaultRuleType,
  ExpressionNode,
  RQBJsonLogic,
} from '../../types';
import { parseJsonLogic } from './parseJsonLogic';
import type { ParseJsonLogicOptions } from './parseJsonLogic';
import type { JsonLogicExpressionOperand, ParseJsonLogicExpressionContext } from './types';
import { isRQBJsonLogicVar } from './utils';

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
  node: JsonLogicExpressionOperand,
  ctx: ParseJsonLogicExpressionContext
): ExpressionNode | null => {
  const build = (n: unknown): ExpressionNode | null => {
    if (isRQBJsonLogicVar(n)) {
      return ctx.fieldExists(n.var) ? { kind: 'field', field: n.var } : null;
    }
    if (n === null || typeof n !== 'object') return { kind: 'value', value: n };
    const [key, payload] = Object.entries(n)[0] ?? [];
    if (key === undefined) return null;
    const rawArgs = Array.isArray(payload) ? payload : [payload];
    const args: ExpressionNode[] = [];
    for (const a of rawArgs) {
      const arg = build(a);
      if (!arg) return null;
      args.push(arg);
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
// Arithmetic/function operands aren't part of the RQBJsonLogic type; cast test inputs through it.
const parse = (
  logic: unknown,
  options: Except<ParseJsonLogicOptions, 'independentCombinators'> & {
    independentCombinators?: false;
  } = opt
): DefaultRuleGroupType => parseJsonLogic(logic as RQBJsonLogic, options);

describe('getExpression wiring', () => {
  it('RHS expression → value + valueSource:expression', () => {
    expect(parse({ '>': [{ var: 'price' }, { '*': [{ var: 'cost' }, 2] }] }, opt)).toEqual(
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
    expect(parse({ '>': [{ '*': [{ var: 'price' }, { var: 'quantity' }] }, 100] }, opt)).toEqual(
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
    expect(
      parse({ '<': [{ '+': [{ var: 'a' }, { var: 'b' }] }, { '*': [{ var: 'price' }, 2] }] }, opt)
    ).toEqual(
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

  it.each([
    ['==', '='],
    ['!=', '!='],
  ])('maps %s to %s', (jlOp, op) => {
    expect(parse({ [jlOp]: [{ var: 'x' }, { abs: { var: 'a' } }] }, opt).rules[0]).toMatchObject({
      field: 'x',
      operator: op,
      valueSource: 'expression',
    });
  });

  it('between with expression bounds → 2-tuple value', () => {
    expect(
      parse(
        {
          '<=': [
            { '+': [{ var: 'a' }, { var: 'b' }] },
            { var: 'price' },
            { '*': [{ var: 'cost' }, 2] },
          ],
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

  it('not between with expression bounds', () => {
    expect(
      parse(
        { '!': { '<=': [{ abs: { var: 'a' } }, { var: 'price' }, { '*': [{ var: 'cost' }, 2] }] } },
        opt
      ).rules[0]
    ).toMatchObject({ operator: 'notBetween', valueSource: 'expression' });
  });

  it('drops the rule when an RHS expression leaf is invalid', () => {
    expect(
      parse({ '>': [{ var: 'price' }, { '*': [{ var: 'unknownField' }, 2] }] }, opt).rules
    ).toEqual([]);
  });

  it('drops when an expression-vs-expression side is invalid', () => {
    expect(
      parse({ '<': [{ '*': [{ var: 'unknownField' }, 2] }, { '*': [{ var: 'price' }, 2] }] }, opt)
        .rules
    ).toEqual([]);
  });

  it('drops an expression-vs-literal when the expression leaf is invalid', () => {
    expect(parse({ '>': [{ '*': [{ var: 'unknownField' }, 2] }, 100] }, opt).rules).toEqual([]);
  });

  it('resolves an expression rule nested inside a group', () => {
    expect(
      parse({ and: [{ '>': [{ var: 'price' }, { '*': [{ var: 'cost' }, 2] }] }] }, opt).rules[0]
    ).toMatchObject({ field: 'price', valueSource: 'expression' });
  });

  it('drops when the comparison field is invalid', () => {
    expect(parse({ '>': [{ var: 'notAField' }, { abs: { var: 'a' } }] }, opt).rules).toEqual([]);
  });

  it('drops an expression compared against a field operand', () => {
    expect(parse({ '>': [{ abs: { var: 'a' } }, { var: 'price' }] }, opt).rules).toEqual([]);
  });

  it('drops between when a bound handler returns null', () => {
    expect(
      parse(
        {
          '<=': [
            { '+': [{ var: 'a' }, { var: 'unknownField' }] },
            { var: 'price' },
            { var: 'cost' },
          ],
        },
        opt
      ).rules
    ).toEqual([]);
  });

  it('drops expression rule when no handler is supplied', () => {
    expect(
      parse({ '>': [{ var: 'price' }, { '*': [{ var: 'cost' }, 2] }] }, { fields }).rules
    ).toEqual([]);
  });

  it('allows all leaf fields when no fields configured', () => {
    expect(
      parse({ '>': [{ var: 'anything' }, { abs: { var: 'foo' } }] }, { getExpression: stub })
        .rules[0]
    ).toMatchObject({ field: 'anything', valueSource: 'expression' });
  });
});
