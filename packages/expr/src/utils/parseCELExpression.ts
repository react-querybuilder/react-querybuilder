import type {
  CELConditionalExpr,
  CELExpression,
  CELExpressionOperand,
  CELFunctionCall,
  CELRelation,
  ParseCELExpressionContext,
} from '@react-querybuilder/core/parseCEL';
import {
  evalCELLiteralValue,
  getCELIdentifierFromChain,
  isCELExpressionGroup,
  isCELIdentifierOrChain,
  isCELLiteral,
  isCELMathOperation,
} from '@react-querybuilder/core/parseCEL';
import type { CELInverse } from '../functions/cel';
import type { ExpressionNode } from '../types';
import type { ValidateExpressionOptions } from './validateExpression';
import { validateExpression } from './validateExpression';

/** Structural deep-equality for CEL AST subtrees (used by the `min`/`max` template matcher). */
const celEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  return ak.every(k =>
    celEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
  );
};

/**
 * Builds a converter (the inverse of {@link defaultCELSerializers}) that turns a CEL operand
 * subtree into an {@link ExpressionNode}. Arithmetic infix nodes map via `inverse.operators`;
 * `FunctionCall`s via `inverse.functions`; the `min`/`max` emulated templates
 * (`(a < b ? a : b)` / `(a > b ? a : b)`, reduced left-to-right for >2 args → nested funcs) are
 * recovered structurally. Identifier leaves become `field` nodes (dropped — whole expression →
 * `null` — when the field does not exist per {@link ParseCELExpressionContext.fieldExists});
 * literals become `value` nodes. `ExpressionGroup` wrappers are unwrapped. Unknown operators/
 * functions produce a `func` node with an unmapped `fn`, which then fails `validate` (per the
 * auto-validate-and-drop contract). Returns `null` for anything it cannot represent.
 *
 * Note: `abs`/`upper`/`lower` are not handled — the CEL grammar cannot parse the constructs
 * their exporters emit.
 */
export const parseCELExpression =
  (inverse: CELInverse, validate: ValidateExpressionOptions) =>
  (node: CELExpressionOperand, ctx: ParseCELExpressionContext): ExpressionNode | null => {
    const matchTemplate = (n: CELConditionalExpr): ExpressionNode | null => {
      const cond = n.condition;
      if (cond.type !== 'Relation') return null;
      const rel = cond as CELRelation;
      if (rel.operator !== '<' && rel.operator !== '>') return null;
      if (!celEqual(rel.left, n.valueIfTrue) || !celEqual(rel.right, n.valueIfFalse)) return null;
      const a = build(rel.left);
      const b = build(rel.right);
      if (!a || !b) return null;
      return { kind: 'func', fn: rel.operator === '<' ? 'min' : 'max', args: [a, b] };
    };

    const build = (n: CELExpression): ExpressionNode | null => {
      if (isCELExpressionGroup(n)) return build(n.value);
      if (isCELIdentifierOrChain(n)) {
        const field = getCELIdentifierFromChain(n);
        return ctx.fieldExists(field) ? { kind: 'field', field } : null;
      }
      if (isCELLiteral(n)) {
        return { kind: 'value', value: evalCELLiteralValue(n) };
      }
      if (isCELMathOperation(n)) {
        const m = n as CELExpression & { left: CELExpression; right: CELExpression };
        const left = build(m.left);
        const right = build(m.right);
        if (!left || !right) return null;
        return { kind: 'func', fn: inverse.operators[n.type], args: [left, right] };
      }
      if (n.type === 'ConditionalExpr') {
        return matchTemplate(n as CELConditionalExpr);
      }
      if (n.type === 'FunctionCall') {
        const fc = n as CELFunctionCall;
        const name = fc.name.value;
        const args: ExpressionNode[] = [];
        for (const a of fc.args.value) {
          const arg = build(a);
          if (!arg) return null;
          args.push(arg);
        }
        return { kind: 'func', fn: inverse.functions[name] ?? name, args };
      }
      return null;
    };

    const root = build(node);
    if (!root) return null;
    return validateExpression(root, validate).valid ? root : null;
  };
