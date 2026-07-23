import type { DefaultRuleGroupType, DefaultRuleType } from '../../types';
import type { ExpressionNode } from '../../types';
import { parseSQL } from './parseSQL';
import type { ParseSQLExpressionContext, SQLExpressionOperand } from './types';

const fields = [
  { name: 'price', value: 'price', label: 'Price' },
  { name: 'cost', value: 'cost', label: 'Cost' },
  { name: 'quantity', value: 'quantity', label: 'Quantity' },
  { name: 'age', value: 'age', label: 'Age' },
  { name: 'a', value: 'a', label: 'A' },
  { name: 'b', value: 'b', label: 'B' },
  { name: 'x', value: 'x', label: 'X' },
];

// Minimal inline handler (core must not depend on @react-querybuilder/expr). Exercises the
// core wiring; real conversion/validation is tested in the expr package.
const stub = (
  node: SQLExpressionOperand,
  ctx: ParseSQLExpressionContext
): ExpressionNode | null => {
  // oxlint-disable-next-line typescript/no-explicit-any
  const build = (n: any): ExpressionNode | null => {
    if (n?.type === 'SimpleExprParentheses') return build(n.value.value[0]);
    if (n?.type === 'Identifier') {
      return ctx.fieldExists(n.value) ? { kind: 'field', field: n.value } : null;
    }
    if (n?.type === 'PlaceHolder') return { kind: 'parameter', parameter: n.param };
    if (n?.type === 'Number') return { kind: 'value', value: Number(n.value) };
    if (n?.type === 'String' || n?.type === 'Boolean') return { kind: 'value', value: n.value };
    if (n?.type === 'Prefix')
      return { kind: 'value', value: Number(`${n.prefix}${n.value.value}`) };
    if (n?.type === 'BitExpression') {
      const l = build(n.left);
      const r = build(n.right);
      return l && r ? { kind: 'func', fn: n.operator, args: [l, r] } : null;
    }
    if (n?.type === 'FunctionCall') {
      const args: ExpressionNode[] = [];
      for (const p of n.params) {
        const a = build(p);
        if (!a) return null;
        args.push(a);
      }
      return { kind: 'func', fn: n.name, args };
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
    expect(parseSQL('price > (cost * 2)', opt)).toEqual(
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

  it('expression LHS vs identifier flips operator', () => {
    expect(parseSQL('(cost * 2) < price', opt)).toEqual(
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
    expect(parseSQL('(price * quantity) > 100', opt)).toEqual(
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

  it('literal vs LHS expression flips operator', () => {
    const q = parseSQL('100 < (price * quantity)', opt);
    expect(q.rules[0]).toMatchObject({ field: '', operator: '>', value: 100 });
    expect((q.rules[0] as DefaultRuleType).lhs).toBeDefined();
  });

  it('expression vs expression → lhs + value both expressions', () => {
    expect(parseSQL('(a + b) < (price * quantity)', opt)).toEqual(
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
            { kind: 'field', field: 'quantity' },
          ],
        },
        valueSource: 'expression',
      })
    );
  });

  it('between with expression bounds → 2-tuple value', () => {
    expect(parseSQL('price between (a + b) and (cost * 2)', opt)).toEqual(
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
    expect(parseSQL('price not between (a + b) and (cost * 2)', opt).rules[0]).toMatchObject({
      operator: 'notBetween',
      valueSource: 'expression',
    });
  });

  it('drops the rule when the handler returns null (unknown field leaf)', () => {
    expect(parseSQL('(price * unknownField) > 1', opt).rules).toEqual([]);
  });

  it('drops between when a bound handler returns null', () => {
    expect(parseSQL('price between (a + unknownField) and (cost * 2)', opt).rules).toEqual([]);
  });

  it('drops expression rule when no handler is supplied', () => {
    expect(parseSQL('(price * quantity) > 1', { fields }).rules).toEqual([]);
  });

  it('drops when the comparison field is invalid', () => {
    expect(parseSQL('(cost * 2) > notAField', { getExpression: stub, fields }).rules).toEqual([]);
  });

  it('allows all leaf fields when no fields configured', () => {
    expect(parseSQL('anything > (foo * 2)', { getExpression: stub }).rules[0]).toMatchObject({
      field: 'anything',
      valueSource: 'expression',
    });
  });
});

describe('parseParameters', () => {
  it('named placeholder (default prefix) → valueSource:parameter', () => {
    expect(parseSQL('age > :p1', { parseParameters: true, fields })).toEqual(
      wrap({ field: 'age', operator: '>', value: 'p1', valueSource: 'parameter' })
    );
  });

  it('custom prefix', () => {
    expect(parseSQL('age > @p1', { parseParameters: { prefix: '@' }, fields })).toEqual(
      wrap({ field: 'age', operator: '>', value: 'p1', valueSource: 'parameter' })
    );
  });

  it('multiple prefixes', () => {
    expect(
      parseSQL('age > @p1', { parseParameters: { prefix: [':', '@'] }, fields }).rules[0]
    ).toMatchObject({ value: 'p1', valueSource: 'parameter' });
  });

  it('positional placeholder → 1-based ordinal name', () => {
    expect(parseSQL('age > ?', { parseParameters: true, fields })).toEqual(
      wrap({ field: 'age', operator: '>', value: '1', valueSource: 'parameter' })
    );
  });

  it('positional disabled leaves `?` untouched (parser rejects it)', () => {
    expect(() => parseSQL('age > ?', { parseParameters: { positional: false }, fields })).toThrow();
  });

  it('placeholder on the left flips the operator', () => {
    expect(parseSQL(':p1 < age', { parseParameters: true, fields })).toEqual(
      wrap({ field: 'age', operator: '>', value: 'p1', valueSource: 'parameter' })
    );
  });

  it('between with both parameter bounds', () => {
    expect(parseSQL('age between :lo and :hi', { parseParameters: true, fields })).toEqual(
      wrap({ field: 'age', operator: 'between', value: 'lo, hi', valueSource: 'parameter' })
    );
  });

  it('between parameter bounds as arrays', () => {
    expect(
      parseSQL('age between :lo and :hi', { parseParameters: true, listsAsArrays: true, fields })
        .rules[0]
    ).toMatchObject({ value: ['lo', 'hi'], valueSource: 'parameter' });
  });

  it('does not treat placeholder-like text in string literals as a parameter', () => {
    expect(parseSQL(`age > ':p1'`, { parseParameters: true, fields }).rules[0]).toMatchObject({
      value: ':p1',
    });
  });

  it('params substitution takes precedence over parseParameters', () => {
    expect(parseSQL('age > :p1', { parseParameters: true, params: { p1: 5 }, fields })).toEqual(
      wrap({ field: 'age', operator: '>', value: 5 })
    );
  });

  it('unsupplied placeholder becomes a parameter rule alongside a substituted one', () => {
    const q = parseSQL('age > :p1 and age < :p2', {
      parseParameters: true,
      params: { p1: 5 },
      fields,
    });
    expect(q.rules).toEqual([
      { field: 'age', operator: '>', value: 5 },
      { field: 'age', operator: '<', value: 'p2', valueSource: 'parameter' },
    ]);
  });

  it('native ${...} placeholder dropped when parseParameters is unset', () => {
    expect(parseSQL('age > ${p1}', { fields }).rules).toEqual([]);
  });

  it('drops parameter rule when field is invalid', () => {
    expect(parseSQL('notAField > :p1', { parseParameters: true, fields }).rules).toEqual([]);
  });

  it('parameter inside an expression → parameter leaf', () => {
    expect(
      parseSQL('price * :factor > 100', { getExpression: stub, parseParameters: true, fields })
    ).toEqual(
      wrap({
        field: '',
        operator: '>',
        lhs: {
          kind: 'func',
          fn: '*',
          args: [
            { kind: 'field', field: 'price' },
            { kind: 'parameter', parameter: 'factor' },
          ],
        },
        value: 100,
      })
    );
  });

  it('drops expression compared against a bare placeholder', () => {
    expect(
      parseSQL('(price * quantity) > :p1', { getExpression: stub, parseParameters: true, fields })
        .rules
    ).toEqual([]);
  });

  it('drops when an RHS expression leaf is invalid', () => {
    expect(parseSQL('age > (notAField * 2)', { getExpression: stub, fields }).rules).toEqual([]);
  });

  it('drops when an expression-vs-expression side is invalid', () => {
    expect(
      parseSQL('(notAField * 2) > (price * 2)', { getExpression: stub, fields }).rules
    ).toEqual([]);
  });
});
