import type { RuleType } from '@react-querybuilder/core';
import { defaultFunctions } from './defaultFunctions';
import type { ExpressionFunctionRegistry, RuleExpressionMeta, RuleExpressions } from './types';

/**
 * Merges one or more function registries (later entries win), defaulting the first
 * source to {@link defaultFunctions} so callers extend the built-ins by default.
 */
export const mergeFunctions = (
  ...registries: (ExpressionFunctionRegistry | undefined)[]
): ExpressionFunctionRegistry => Object.assign({}, defaultFunctions, ...registries);

/**
 * Reads the expression payload stored under `rule.meta.expressions`, if any.
 */
export const getExpressions = (rule: RuleType): RuleExpressions | undefined =>
  (rule.meta as RuleExpressionMeta | undefined)?.expressions;
