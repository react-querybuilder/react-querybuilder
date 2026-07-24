import { isPojo } from '@react-querybuilder/core';
import type {
  MongoDBExpressionOperand,
  ParseMongoDBExpressionContext,
} from '@react-querybuilder/core/parseMongoDB';
import { mongoDbFieldRef } from '@react-querybuilder/core/parseMongoDB';
import type { MongoDBInverse } from '../functions/mongodb';
import type { ExpressionNode } from '../types';
import type { ValidateExpressionOptions } from './validateExpression';
import { validateExpression } from './validateExpression';

/**
 * Builds a converter (the inverse of {@link serializeMongoAgg}/{@link defaultMongoDBSerializers})
 * that turns a MongoDB aggregation-expression operand into an {@link ExpressionNode}, using
 * `inverse` to map aggregation-operator names to `fn` keys. `"$field"` path leaves become
 * `field` nodes (dropped — whole expression → `null` — when the field does not exist per
 * {@link ParseMongoDBExpressionContext.fieldExists}); scalars become `value` nodes. An operator
 * object's payload is read as an array (or a scalar wrapped in one) to recover its arguments.
 * Unknown operators produce a `func` node with an unmapped `fn`, which then fails `validate`
 * (per the auto-validate-and-drop contract). Returns `null` for anything it cannot represent.
 */
export const parseMongoDBExpression =
  (inverse: MongoDBInverse, validate: ValidateExpressionOptions) =>
  (node: MongoDBExpressionOperand, ctx: ParseMongoDBExpressionContext): ExpressionNode | null => {
    const build = (n: unknown): ExpressionNode | null => {
      const field = mongoDbFieldRef(n);
      if (field !== null) {
        return ctx.fieldExists(field) ? { kind: 'field', field } : null;
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
