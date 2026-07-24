import type {
  ParseSQLExpressionContext,
  SQLExpressionOperand,
} from '@react-querybuilder/core/parseSQL';
import {
  evalSQLLiteralValue,
  getFieldName,
  isSQLBitExpression,
  isSQLFunctionCall,
  isSQLIdentifier,
  isSQLLiteralOrSignedNumberValue,
  isSQLPlaceHolder,
} from '@react-querybuilder/core/parseSQL';
import type { SQLInverse } from '../functions/sql';
import type { ExpressionNode } from '../types';
import type { ValidateExpressionOptions } from './validateExpression';
import { validateExpression } from './validateExpression';

/**
 * Builds a converter (the inverse of {@link serializeSQL}) that turns a SQL operand subtree
 * into an {@link ExpressionNode}, using `inverse` to map arithmetic operators and function
 * names to `fn` keys. Identifier leaves are dropped (whole expression → `null`) when the
 * field does not exist per {@link ParseSQLExpressionContext.fieldExists}; unknown operators/
 * functions produce a `func` node with an unmapped `fn`, which then fails `validate` (per the
 * auto-validate-and-drop contract). Returns `null` for any node it cannot represent.
 */
export const parseSQLExpression =
  (inverse: SQLInverse, validate: ValidateExpressionOptions) =>
  (node: SQLExpressionOperand, ctx: ParseSQLExpressionContext): ExpressionNode | null => {
    const build = (n: SQLExpressionOperand): ExpressionNode | null => {
      // Unwrap parenthesized grouping.
      if (n?.type === 'SimpleExprParentheses') {
        return build(n.value.value[0] as SQLExpressionOperand);
      }
      if (isSQLIdentifier(n)) {
        const field = getFieldName(n);
        return ctx.fieldExists(field) ? { kind: 'field', field } : null;
      }
      if (isSQLPlaceHolder(n)) {
        return { kind: 'parameter', parameter: n.param };
      }
      if (isSQLLiteralOrSignedNumberValue(n)) {
        return {
          kind: 'value',
          value: evalSQLLiteralValue(n, { bigIntOnOverflow: ctx.bigIntOnOverflow }),
        };
      }
      if (isSQLBitExpression(n)) {
        const fn = inverse.operators[n.operator] ?? inverse.operators[n.operator.toUpperCase()];
        const left = build(n.left);
        const right = build(n.right);
        if (!left || !right) return null;
        return { kind: 'func', fn: fn ?? n.operator, args: [left, right] };
      }
      if (isSQLFunctionCall(n)) {
        const fn = inverse.functions[n.name.toUpperCase()];
        const args: ExpressionNode[] = [];
        for (const p of n.params) {
          const arg = build(p);
          if (!arg) return null;
          args.push(arg);
        }
        return { kind: 'func', fn: fn ?? n.name, args };
      }
      return null;
    };

    const root = build(node);
    if (!root) return null;
    return validateExpression(root, validate).valid ? root : null;
  };
