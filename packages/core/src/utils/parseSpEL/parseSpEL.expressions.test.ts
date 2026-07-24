import type { DefaultRuleGroupType, DefaultRuleType, ExpressionNode } from '../../types';
import { parseSpEL } from './parseSpEL';
import type { ParseSpELExpressionContext, SpELProcessedExpression } from './types';
import {
  isSpELExpressionOperand,
  isSpELIdentifier,
  isSpELMathOperation,
  isSpELPrimitive,
} from './utils';

const fields = [
  { name: 'price', value: 'price', label: 'Price' },
  { name: 'cost', value: 'cost', label: 'Cost' },
  { name: 'a', value: 'a', label: 'A' },
  { name: 'b', value: 'b', label: 'B' },
];

// Math node type → fn (mirror of the expr-side inverse; core must not depend on the expr pkg).
const mathFn: Record<string, string> = {
  'op-plus': 'add',
  'op-minus': 'subtract',
  'op-multiply': 'multiply',
  'op-divide': 'divide',
  'op-modulus': 'mod',
};

// Minimal inline handler exercising the core wiring; real conversion is tested in the expr pkg.
const stub = (
  node: SpELProcessedExpression,
  ctx: ParseSpELExpressionContext
): ExpressionNode | null => {
  const build = (n: SpELProcessedExpression): ExpressionNode | null => {
    if (isSpELMathOperation(n)) {
      const l = build(n.children[0]);
      const r = build(n.children[1]);
      return l && r ? { kind: 'func', fn: mathFn[n.type], args: [l, r] } : null;
    }
    if (isSpELIdentifier(n)) {
      return ctx.fieldExists(n.identifier) ? { kind: 'field', field: n.identifier } : null;
    }
    if (isSpELPrimitive(n)) return { kind: 'value', value: n.value };
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
    expect(parseSpEL('price > (cost * 2)', opt)).toEqual(
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
    expect(parseSpEL('(a + b) < price', opt).rules[0]).toMatchObject({
      field: 'price',
      operator: '>',
      valueSource: 'expression',
      value: { kind: 'func', fn: 'add' },
    });
  });

  it('expression <op> literal → lhs = expression, plain value', () => {
    expect(parseSpEL('(price * 2) > 100', opt).rules[0]).toMatchObject({
      field: '',
      operator: '>',
      value: 100,
      lhs: { kind: 'func', fn: 'multiply' },
    });
  });

  it('literal <op> expression flips operator, lhs set', () => {
    expect(parseSpEL('100 < (price * 2)', opt).rules[0]).toMatchObject({
      field: '',
      operator: '>',
      value: 100,
      lhs: { kind: 'func', fn: 'multiply' },
    });
  });

  it('expression <op> expression → both sides on lhs/value', () => {
    expect(parseSpEL('(a + b) > (a - b)', opt).rules[0]).toMatchObject({
      field: '',
      operator: '>',
      valueSource: 'expression',
      lhs: { kind: 'func', fn: 'add' },
      value: { kind: 'func', fn: 'subtract' },
    });
  });

  it('recovers the modulus operator', () => {
    expect(parseSpEL('price > (cost % 2)', opt).rules[0]).toMatchObject({
      value: { kind: 'func', fn: 'mod' },
    });
  });

  it('drops a field <op> expression when the expression leaf is invalid', () => {
    expect(parseSpEL('price > (notAField * 2)', opt).rules).toEqual([]);
  });

  it('drops a field <op> expression when the subject field is invalid', () => {
    expect(parseSpEL('notAField > (a + b)', opt).rules).toEqual([]);
  });

  it('drops an expression <op> field when the subject field is invalid', () => {
    expect(parseSpEL('(a + b) < notAField', opt).rules).toEqual([]);
  });

  it('drops an expression <op> field when the expression leaf is invalid', () => {
    expect(parseSpEL('(notAField + b) < price', opt).rules).toEqual([]);
  });

  it('drops an expression <op> literal when the expression leaf is invalid', () => {
    expect(parseSpEL('(notAField * 2) > 100', opt).rules).toEqual([]);
  });

  it('drops a literal <op> expression when the expression leaf is invalid', () => {
    expect(parseSpEL('100 < (notAField * 2)', opt).rules).toEqual([]);
  });

  it('drops an expression <op> expression when either leaf is invalid', () => {
    expect(parseSpEL('(a + b) > (notAField - b)', opt).rules).toEqual([]);
  });

  it('drops an expression compared to an unsupported (function/method) operand', () => {
    expect(parseSpEL('(a + b) > name.toUpperCase()', opt).rules).toEqual([]);
  });

  it('allows all leaf fields when no fields configured', () => {
    expect(parseSpEL('price > (anything * 2)', { getExpression: stub }).rules[0]).toMatchObject({
      field: 'price',
      valueSource: 'expression',
    });
  });

  it('ignores expression operands when no getExpression supplied', () => {
    expect(parseSpEL('price > (cost * 2)', { fields }).rules).toEqual([]);
  });

  it('leaves plain comparisons untouched', () => {
    expect(parseSpEL('price > 5', opt).rules[0]).toMatchObject({
      field: 'price',
      operator: '>',
      value: 5,
    });
  });
});

describe('isSpELExpressionOperand', () => {
  const parse = (spel: string): SpELProcessedExpression => {
    let captured: SpELProcessedExpression | undefined;
    parseSpEL(spel, {
      fields,
      getExpression: node => {
        captured = node;
        return null;
      },
    });
    return captured as SpELProcessedExpression;
  };

  it('recognizes arithmetic infix operands', () => {
    expect(isSpELExpressionOperand(parse('price > (cost * 2)'))).toBe(true);
    expect(isSpELExpressionOperand(parse('price > (cost + 2)'))).toBe(true);
  });
});
