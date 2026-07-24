import type { DefaultRuleGroupType, DefaultRuleType, ExpressionNode } from '../../types';
import { parseCEL } from './parseCEL';
import type { CELConditionalExpr, CELExpression, ParseCELExpressionContext } from './types';
import {
  evalCELLiteralValue,
  getCELIdentifierFromChain,
  isCELExpressionGroup,
  isCELExpressionOperand,
  isCELIdentifierOrChain,
  isCELLiteral,
  isCELMathOperation,
} from './utils';

const fields = [
  { name: 'price', value: 'price', label: 'Price' },
  { name: 'cost', value: 'cost', label: 'Cost' },
  { name: 'a', value: 'a', label: 'A' },
  { name: 'b', value: 'b', label: 'B' },
  { name: 'c', value: 'c', label: 'C' },
  { name: 'd', value: 'd', label: 'D' },
];

// Math node type → fn (mirror of the expr-side inverse; core must not depend on the expr pkg).
const mathFn: Record<string, string> = {
  Addition: 'add',
  Subtraction: 'subtract',
  Multiplication: 'multiply',
  Division: 'divide',
  Modulo: 'mod',
};

// Minimal inline handler exercising the core wiring; real conversion is tested in the expr pkg.
const stub = (node: CELExpression, ctx: ParseCELExpressionContext): ExpressionNode | null => {
  const build = (n: CELExpression): ExpressionNode | null => {
    if (isCELExpressionGroup(n)) return build(n.value);
    if (isCELIdentifierOrChain(n)) {
      const field = getCELIdentifierFromChain(n);
      return ctx.fieldExists(field) ? { kind: 'field', field } : null;
    }
    if (isCELLiteral(n)) return { kind: 'value', value: evalCELLiteralValue(n) };
    if (isCELMathOperation(n)) {
      const m = n as CELExpression & { left: CELExpression; right: CELExpression };
      const l = build(m.left);
      const r = build(m.right);
      return l && r ? { kind: 'func', fn: mathFn[n.type], args: [l, r] } : null;
    }
    if (n.type === 'ConditionalExpr') {
      const c = n as CELConditionalExpr;
      const rel = c.condition as CELExpression & {
        type: string;
        operator: string;
        left: CELExpression;
        right: CELExpression;
      };
      if (rel.type !== 'Relation') return null;
      const l = build(rel.left);
      const r = build(rel.right);
      return l && r
        ? { kind: 'func', fn: rel.operator === '<' ? 'min' : 'max', args: [l, r] }
        : null;
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
  it('field <op> expression → value + valueSource:expression', () => {
    expect(parseCEL('price > (cost * 2)', opt)).toEqual(
      wrap({
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
      })
    );
  });

  it('expression <op> field flips to field <op> expression', () => {
    expect(parseCEL('(a + b) < price', opt).rules[0]).toMatchObject({
      field: 'price',
      operator: '>',
      valueSource: 'expression',
      value: { kind: 'func', fn: 'add' },
    });
  });

  it('expression <op> literal → lhs = expression, plain value', () => {
    expect(parseCEL('(price * 2) > 100', opt).rules[0]).toMatchObject({
      field: '',
      operator: '>',
      value: 100,
      lhs: { kind: 'func', fn: 'multiply' },
    });
  });

  it('literal <op> expression flips operator, lhs set', () => {
    expect(parseCEL('100 < (price * 2)', opt).rules[0]).toMatchObject({
      field: '',
      operator: '>',
      value: 100,
      lhs: { kind: 'func', fn: 'multiply' },
    });
  });

  it('expression <op> expression → both sides on lhs/value', () => {
    expect(parseCEL('(a + b) > (c - d)', opt).rules[0]).toMatchObject({
      field: '',
      operator: '>',
      valueSource: 'expression',
      lhs: { kind: 'func', fn: 'add' },
      value: { kind: 'func', fn: 'subtract' },
    });
  });

  it('recovers min/max templates as RHS expressions', () => {
    expect(parseCEL('price > (a < b ? a : b)', opt).rules[0]).toMatchObject({
      field: 'price',
      operator: '>',
      valueSource: 'expression',
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

  it('drops a field <op> expression when the expression leaf is invalid', () => {
    expect(parseCEL('price > (notAField * 2)', opt).rules).toEqual([]);
  });

  it('drops an expression <op> field when the subject field is invalid', () => {
    expect(parseCEL('(a + b) < notAField', opt).rules).toEqual([]);
  });

  it('drops an expression <op> literal when the expression leaf is invalid', () => {
    expect(parseCEL('(notAField * 2) > 100', opt).rules).toEqual([]);
  });

  it('drops a literal <op> expression when the expression leaf is invalid', () => {
    expect(parseCEL('100 < (notAField * 2)', opt).rules).toEqual([]);
  });

  it('drops an expression <op> expression when either leaf is invalid', () => {
    expect(parseCEL('(a + b) > (notAField - d)', opt).rules).toEqual([]);
  });

  it('allows all leaf fields when no fields configured', () => {
    expect(parseCEL('price > (anything * 2)', { getExpression: stub }).rules[0]).toMatchObject({
      field: 'price',
      valueSource: 'expression',
    });
  });

  it('ignores expression operands when no getExpression supplied', () => {
    expect(parseCEL('price > (cost * 2)', { fields }).rules).toEqual([]);
  });

  it('unwraps nested expression groups', () => {
    expect(parseCEL('price > ((cost * 2))', opt).rules[0]).toMatchObject({
      field: 'price',
      operator: '>',
      valueSource: 'expression',
      value: { kind: 'func', fn: 'multiply' },
    });
  });

  it('forwards negation to an expression comparison', () => {
    expect(parseCEL('!(price > (cost * 2))', opt)).toEqual(
      wrap({
        field: 'price',
        operator: '<=',
        value: { kind: 'func', fn: 'multiply', args: expect.anything() },
        valueSource: 'expression',
      })
    );
  });

  it('leaves plain comparisons untouched', () => {
    expect(parseCEL('price > 5', opt).rules[0]).toMatchObject({
      field: 'price',
      operator: '>',
      value: 5,
    });
  });
});

describe('isCELExpressionOperand', () => {
  const parse = (cel: string): CELExpression => {
    let captured: CELExpression | undefined;
    parseCEL(cel, {
      fields,
      getExpression: node => {
        captured = node;
        return null;
      },
    });
    return captured as CELExpression;
  };

  it('recognizes arithmetic, function calls, and conditionals', () => {
    expect(isCELExpressionOperand(parse('price > (cost * 2)'))).toBe(true);
    expect(isCELExpressionOperand(parse('price > pow(cost, 2)'))).toBe(true);
    expect(isCELExpressionOperand(parse('price > (a < b ? a : b)'))).toBe(true);
  });
});
