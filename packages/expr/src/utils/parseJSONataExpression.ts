import type {
  JSONataExpressionOperand,
  ParseJSONataExpressionContext,
} from '@react-querybuilder/core/parseJSONata';
import {
  getFieldFromPath,
  isJSONataBoolean,
  isJSONataIdentifier,
  isJSONataList,
  isJSONataNull,
  isJSONataNumber,
  isJSONataString,
} from '@react-querybuilder/core/parseJSONata';
import type { JSONataInverse } from '../functions/jsonata';
import type { ExpressionNode } from '../types';
import type { ValidateExpressionOptions } from './validateExpression';
import { validateExpression } from './validateExpression';

/**
 * Builds a converter (the inverse of {@link serializeInfix}/{@link defaultJSONataSerializers})
 * that turns a JSONata operand subtree into an {@link ExpressionNode}, using `inverse` to map
 * arithmetic operators and function names to `fn` keys. Identifier leaves become `field` nodes
 * (dropped — whole expression → `null` — when the field does not exist per
 * {@link ParseJSONataExpressionContext.fieldExists}); scalars become `value` nodes. `$min`/`$max`
 * list arguments are flattened. Unknown operators/functions produce a `func` node with an
 * unmapped `fn`, which then fails `validate` (per the auto-validate-and-drop contract). Returns
 * `null` for anything it cannot represent.
 */
export const parseJSONataExpression =
  (inverse: JSONataInverse, validate: ValidateExpressionOptions) =>
  (node: JSONataExpressionOperand, ctx: ParseJSONataExpressionContext): ExpressionNode | null => {
    // oxlint-disable-next-line typescript/no-explicit-any
    const build = (n: any): ExpressionNode | null => {
      // Unwrap parenthesized single-expression blocks (e.g. `(cost * 2)`)
      if (n?.type === 'block' && Array.isArray(n.expressions) && n.expressions.length === 1) {
        return build(n.expressions[0]);
      }
      if (isJSONataIdentifier(n)) {
        const field = getFieldFromPath(n);
        return ctx.fieldExists(field) ? { kind: 'field', field } : null;
      }
      if (isJSONataString(n) || isJSONataNumber(n) || isJSONataBoolean(n) || isJSONataNull(n)) {
        return { kind: 'value', value: n.value };
      }
      if (n?.type === 'binary') {
        const fn = inverse.operators[n.value];
        const left = build(n.lhs);
        const right = build(n.rhs);
        if (!left || !right) return null;
        return { kind: 'func', fn: fn ?? n.value, args: [left, right] };
      }
      if (n?.type === 'function' && n.procedure?.type === 'variable') {
        const name: string = n.procedure.value;
        const fn = inverse.functions[name];
        const args: ExpressionNode[] = [];
        // Flatten list arguments (e.g. `$min([a, b])`)
        const rawArgs = (n.arguments ?? []).flatMap((a: unknown) =>
          isJSONataList(a) ? a.expressions : [a]
        );
        for (const a of rawArgs) {
          const arg = build(a);
          if (!arg) return null;
          args.push(arg);
        }
        return { kind: 'func', fn: fn ?? name, args };
      }
      return null;
    };

    const root = build(node);
    if (!root) return null;
    return validateExpression(root, validate).valid ? root : null;
  };
