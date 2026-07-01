import type { ExpressionNode, RuleType } from '@react-querybuilder/core';
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
 * Resolves a rule's expression operands: `lhs` from `rule.lhs`, and `rhs` from `rule.value`
 * when `valueSource` is `"expression"`. Returns `undefined` when the rule carries no
 * expression on either side.
 */
export const getRuleExpressions = (rule: RuleType): ResolvedExpressions | undefined => {
  const lhs = rule.lhs;
  const rhs = rule.valueSource === 'expression' ? (rule.value as ExpressionNode) : undefined;
  return lhs || rhs ? { lhs, rhs } : undefined;
};
