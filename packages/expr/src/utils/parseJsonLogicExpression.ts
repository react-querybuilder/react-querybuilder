import { isPojo } from '@react-querybuilder/core';
import type {
  JsonLogicExpressionOperand,
  ParseJsonLogicExpressionContext,
} from '@react-querybuilder/core/parseJsonLogic';
import { isRQBJsonLogicVar } from '@react-querybuilder/core/parseJsonLogic';
import type { JsonLogicInverse } from '../functions/jsonLogic';
import type { ExpressionNode } from '../types';
import type { ValidateExpressionOptions } from './validateExpression';
import { validateExpression } from './validateExpression';

/**
 * Builds a converter (the inverse of {@link serializeJsonLogic}) that turns a JsonLogic operand
 * subtree into an {@link ExpressionNode}, using `inverse` to map operation-object keys to `fn`
 * keys. `{ var }` leaves become `field` nodes (dropped — whole expression → `null` — when the
 * field does not exist per {@link ParseJsonLogicExpressionContext.fieldExists}); scalars become
 * `value` nodes. An operation node's payload is read as an array (or a scalar wrapped in one) to
 * recover its arguments. Unknown keys produce a `func` node with an unmapped `fn`, which then
 * fails `validate` (per the auto-validate-and-drop contract). Returns `null` for anything it
 * cannot represent.
 */
export const parseJsonLogicExpression =
  (inverse: JsonLogicInverse, validate: ValidateExpressionOptions) =>
  (
    node: JsonLogicExpressionOperand,
    ctx: ParseJsonLogicExpressionContext
  ): ExpressionNode | null => {
    const build = (n: unknown): ExpressionNode | null => {
      if (isRQBJsonLogicVar(n)) {
        return ctx.fieldExists(n.var) ? { kind: 'field', field: n.var } : null;
      }
      if (!isPojo(n)) {
        return { kind: 'value', value: n };
      }
      const [key, payload] = Object.entries(n)[0] ?? [];
      if (key === undefined) return null;
      const fn = inverse[key] ?? key;
      const rawArgs = Array.isArray(payload) ? payload : [payload];
      const args: ExpressionNode[] = [];
      for (const a of rawArgs) {
        const arg = build(a);
        if (!arg) return null;
        args.push(arg);
      }
      return { kind: 'func', fn, args };
    };

    const root = build(node);
    if (!root) return null;
    return validateExpression(root, validate).valid ? root : null;
  };
