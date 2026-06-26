import type { ExpressionNode, RuleType } from '@react-querybuilder/core';
import { defaultFunctions } from './defaultFunctions';
import type { ExpressionFunctionRegistry, ResolvedExpressions } from './types';

/**
 * Merges one or more function registries (later entries win), defaulting the first
 * source to {@link defaultFunctions} so callers extend the built-ins by default.
 */
export const mergeFunctions = (
  ...registries: (ExpressionFunctionRegistry | undefined)[]
): ExpressionFunctionRegistry => Object.assign({}, defaultFunctions, ...registries);

/**
 * Resolves a rule's expression operands: `lhs` from `rule.lhs`, and `rhs` from `rule.value`
 * when `valueSource` is `"expression"`. Returns `undefined` when the rule carries no
 * expression on either side.
 */
export const getRuleExpressions = (rule: RuleType): ResolvedExpressions | undefined => {
  const lhs = rule.lhs;
  const rhs = rule.valueSource === 'expression' ? (rule.value as ExpressionNode) : undefined;
  return lhs || rhs ? { lhs, rhs } : undefined;
};
