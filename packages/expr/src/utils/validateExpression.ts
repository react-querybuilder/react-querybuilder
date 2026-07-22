import type {
  ExpressionFunctionMeta,
  ExpressionFunctionMetaRegistry,
  ExpressionNode,
} from '../types';

/** Result of {@link validateExpression}. */
export interface ExpressionValidationResult {
  valid: boolean;
  reasons: string[];
}

/** Inputs {@link validateExpression} checks a node against. */
export interface ValidateExpressionOptions {
  /**
   * Map whose keys define the *known* functions (a `func` node referencing a key absent
   * here is flagged "Unknown function"). Rule processors pass their per-format serializer
   * map, so a function lacking that format's serializer is treated as unknown (and its rule
   * omitted from export). When absent, `meta` supplies the known set.
   */
  functions?: Record<string, unknown>;
  /**
   * Function metadata supplying arity for the arity check. When `functions` is omitted,
   * this map's keys also define the known set (the format-agnostic validator path).
   */
  meta?: ExpressionFunctionMetaRegistry;
}

// Expected-arity description when `argc` violates `arity`, else `null`. Undefined arity is
// unconstrained (any count, incl. 0) — declare a `number`/`[min, max]` to enforce a count.
const arityError = (arity: ExpressionFunctionMeta['arity'], argc: number): string | null => {
  if (arity === undefined) return null;
  if (typeof arity === 'number') return argc === arity ? null : `${arity}`;
  return argc >= arity[0] && argc <= arity[1] ? null : `${arity[0]}–${arity[1]}`;
};

/**
 * Recursively validates an expression node. Flags unknown functions (not present in the
 * known set — see {@link ValidateExpressionOptions.functions}), arity mismatches (against
 * {@link ValidateExpressionOptions.meta}), and empty field/parameter references. `formatQuery`
 * skips rules whose expressions fail validation (the rule processors return empty/`false`).
 */
export const validateExpression = (
  node: ExpressionNode | undefined,
  { functions, meta }: ValidateExpressionOptions = {}
): ExpressionValidationResult => {
  const known = functions ?? meta ?? {};
  const reasons: string[] = [];

  const walk = (n: ExpressionNode | undefined): void => {
    if (!n) {
      reasons.push('Missing expression node');
      return;
    }
    switch (n.kind) {
      case 'field': {
        if (typeof n.field !== 'string' || n.field.length === 0) {
          reasons.push('Field reference is empty');
        }
        break;
      }
      case 'value': {
        break;
      }
      case 'parameter': {
        if (typeof n.parameter !== 'string' || n.parameter.length === 0) {
          reasons.push('Parameter reference is empty');
        }
        break;
      }
      case 'func': {
        if (!(n.fn in known)) {
          reasons.push(`Unknown function "${n.fn}"`);
          break;
        }
        const argc = n.args?.length ?? 0;
        const expected = arityError(meta?.[n.fn]?.arity, argc);
        if (expected !== null) {
          reasons.push(`Function "${n.fn}" expects ${expected} argument(s), received ${argc}`);
        }
        for (const arg of n.args ?? []) walk(arg);
        break;
      }
      default: {
        reasons.push(`Unknown expression node kind "${(n as { kind: string }).kind}"`);
      }
    }
  };

  walk(node);
  return { valid: reasons.length === 0, reasons };
};
