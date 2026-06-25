import type { ExpressionFunction, ExpressionFunctionRegistry, ExpressionNode } from '../types';

/** Result of {@link validateExpression}. */
export interface ExpressionValidationResult {
  valid: boolean;
  reasons: string[];
}

const checkArity = (arity: ExpressionFunction['arity'], argc: number): boolean => {
  if (arity === undefined) return argc >= 1;
  if (typeof arity === 'number') return argc === arity;
  return argc >= arity[0] && argc <= arity[1];
};

const describeArity = (arity: ExpressionFunction['arity']): string => {
  if (arity === undefined) return 'at least 1';
  if (typeof arity === 'number') return `${arity}`;
  return `${arity[0]}–${arity[1]}`;
};

/**
 * Recursively validates an expression node against a function registry. Flags unknown
 * functions, arity mismatches, and empty field references. `formatQuery` skips rules
 * whose expressions fail validation (the rule processors return empty/`false`).
 */
export const validateExpression = (
  node: ExpressionNode | undefined,
  registry: ExpressionFunctionRegistry
): ExpressionValidationResult => {
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
      case 'func': {
        const fn = registry[n.fn];
        if (!fn) {
          reasons.push(`Unknown function "${n.fn}"`);
          break;
        }
        const argc = n.args?.length ?? 0;
        if (!checkArity(fn.arity, argc)) {
          reasons.push(
            `Function "${n.fn}" expects ${describeArity(fn.arity)} argument(s), received ${argc}`
          );
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
