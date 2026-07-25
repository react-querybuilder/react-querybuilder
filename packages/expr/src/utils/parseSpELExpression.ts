import type {
  ParseSpELExpressionContext,
  SpELExpressionOperand,
  SpELProcessedExpression,
} from '@react-querybuilder/core/parseSpEL';
import {
  isSpELIdentifier,
  isSpELMathOperation,
  isSpELMethodCall,
  isSpELPrimitive,
} from '@react-querybuilder/core/parseSpEL';
import type { SpELInverse } from '../functions/spel';
import type { ExpressionNode } from '../types';
import type { ValidateExpressionOptions } from './validateExpression';
import { validateExpression } from './validateExpression';

/**
 * Builds a converter (the inverse of {@link defaultSpELSerializers}) that turns a SpEL operand
 * subtree into an {@link ExpressionNode}. Arithmetic infix nodes (`op-plus`/`op-minus`/
 * `op-multiply`/`op-divide`/`op-modulus`) map via `inverse.operators`; instance method calls
 * (`.toUpperCase()`) map via `inverse.methods` with the receiver as the sole argument; static and
 * bare calls (`T(java.lang.Math).abs(...)`, `myFunc(...)`) map via `inverse.functions` with the
 * call arguments; identifier leaves become `field` nodes (dropped — whole expression → `null` —
 * when the field does not exist per {@link ParseSpELExpressionContext.fieldExists}); literals
 * become `value` nodes. Unmapped operators/functions/methods produce a `func` node with an
 * unmapped `fn`, which then fails `validate` (per the auto-validate-and-drop contract). Returns
 * `null` for anything it cannot represent.
 */
export const parseSpELExpression =
  (inverse: SpELInverse, validate: ValidateExpressionOptions) =>
  (node: SpELExpressionOperand, ctx: ParseSpELExpressionContext): ExpressionNode | null => {
    const build = (n: SpELProcessedExpression): ExpressionNode | null => {
      if (isSpELMathOperation(n)) {
        const left = build(n.children[0]);
        const right = build(n.children[1]);
        if (!left || !right) return null;
        return { kind: 'func', fn: inverse.operators[n.type], args: [left, right] };
      }
      if (isSpELMethodCall(n)) {
        // Instance calls (`x.toUpperCase()`) treat the receiver as the lone argument; static and
        // bare calls (`T(java.lang.Math).abs(x)`, `myFunc(x)`) use the call arguments.
        const isInstanceCall = !!n.target;
        const operands = isInstanceCall ? [n.target as SpELProcessedExpression] : n.children;
        const args: ExpressionNode[] = [];
        for (const operand of operands) {
          const arg = build(operand);
          if (!arg) return null;
          args.push(arg);
        }
        const fn = isInstanceCall ? inverse.methods[n.methodName] : inverse.functions[n.methodName];
        return { kind: 'func', fn, args };
      }
      if (isSpELIdentifier(n)) {
        return ctx.fieldExists(n.identifier) ? { kind: 'field', field: n.identifier } : null;
      }
      if (isSpELPrimitive(n)) {
        return { kind: 'value', value: n.value };
      }
      return null;
    };

    const root = build(node);
    if (!root) return null;
    return validateExpression(root, validate).valid ? root : null;
  };
