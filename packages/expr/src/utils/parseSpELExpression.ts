import type {
  ParseSpELExpressionContext,
  SpELExpressionOperand,
  SpELProcessedExpression,
} from '@react-querybuilder/core/parseSpEL';
import {
  isSpELIdentifier,
  isSpELMathOperation,
  isSpELPrimitive,
} from '@react-querybuilder/core/parseSpEL';
import type { SpELInverse } from '../functions/spel';
import type { ExpressionNode } from '../types';
import type { ValidateExpressionOptions } from './validateExpression';
import { validateExpression } from './validateExpression';

/**
 * Builds a converter (the inverse of {@link defaultSpELSerializers}) that turns a SpEL operand
 * subtree into an {@link ExpressionNode}. Arithmetic infix nodes (`op-plus`/`op-minus`/
 * `op-multiply`/`op-divide`/`op-modulus`) map via `inverse.operators`; identifier leaves become
 * `field` nodes (dropped — whole expression → `null` — when the field does not exist per
 * {@link ParseSpELExpressionContext.fieldExists}); literals become `value` nodes. Unknown
 * arithmetic operators produce a `func` node with an unmapped `fn`, which then fails `validate`
 * (per the auto-validate-and-drop contract). Returns `null` for anything it cannot represent.
 *
 * NOTE: Function/method-based operations (`abs`/`min`/`max`/`upper`/`lower`, custom calls) never
 * reach this converter — core's SpEL processing discards `method`/`typeref`/`compound` nodes. See
 * {@link SpELInverse}.
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
