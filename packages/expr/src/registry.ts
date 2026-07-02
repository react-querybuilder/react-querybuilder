import type { ExpressionNode, RuleType } from '@react-querybuilder/core';
import { lc } from '@react-querybuilder/core';
import { defaultFunctionMeta } from './functions/meta';
import type { ExpressionFunctionMetaRegistry, ResolvedExpressions } from './types';

/**
 * Merges one or more function-metadata registries (later entries win), defaulting the first
 * source to {@link defaultFunctionMeta} so callers extend the built-ins by default.
 */
export const mergeFunctionMeta = (
  ...registries: (ExpressionFunctionMetaRegistry | undefined)[]
): ExpressionFunctionMetaRegistry => Object.assign({}, defaultFunctionMeta, ...registries);

/**
 * Resolves a rule's expression operands: `lhs` from `rule.lhs`, and the right-hand side
 * from `rule.value` when `valueSource` is `"expression"`. For `between`/`notBetween`
 * operators the value is a 2-tuple `[lower, upper]` split into `rhs`/`rhs2`; all other
 * operators carry a single `rhs`. Returns `undefined` when the rule carries no expression
 * on either side.
 */
export const getRuleExpressions = (rule: RuleType): ResolvedExpressions | undefined => {
  const lhs = rule.lhs;
  if (rule.valueSource !== 'expression') return lhs ? { lhs } : undefined;

  const operator = lc(rule.operator);
  if (operator === 'between' || operator === 'notbetween') {
    // Objects can't be comma-joined, so an expression between always stores a 2-tuple.
    const bounds = (Array.isArray(rule.value) ? rule.value : [rule.value]) as ExpressionNode[];
    const [rhs, rhs2] = bounds;
    return lhs || rhs || rhs2 ? { lhs, rhs, rhs2 } : undefined;
  }

  const rhs = rule.value as ExpressionNode;
  return lhs || rhs ? { lhs, rhs } : undefined;
};
