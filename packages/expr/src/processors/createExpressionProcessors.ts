import type { RuleProcessor } from '@react-querybuilder/core';
import { mergeFunctions } from '../registry';
import type { ExpressionFunctionRegistry } from '../types';
import { getExpressionRuleProcessorJsonLogic } from './getExpressionRuleProcessorJsonLogic';
import { getExpressionRuleProcessorParameterized } from './getExpressionRuleProcessorParameterized';
import { getExpressionRuleProcessorSQL } from './getExpressionRuleProcessorSQL';

/** Format-specific rule processors, all bound to one function registry. */
export interface ExpressionProcessors {
  /** `ruleProcessor` for `formatQuery(q, { format: 'sql' })`. */
  sql: RuleProcessor;
  /** `ruleProcessor` for the `'parameterized'` / `'parameterized_named'` formats. */
  parameterized: RuleProcessor;
  /** `ruleProcessor` for `formatQuery(q, { format: 'jsonlogic' })`. */
  jsonLogic: RuleProcessor;
}

/**
 * Configure-once factory returning the SQL, parameterized, and JSONLogic rule processors
 * all bound to a single registry of `functions` merged over the built-in
 * {@link defaultFunctions} (the same merge `QueryBuilderExpressions` applies).
 *
 * Pass the *same* `functions` object here and to `<QueryBuilderExpressions functions>` so
 * custom functions both render in the UI and survive export — avoiding the footgun where
 * a function registered only for the UI silently drops out of the exported query. Call
 * with no arguments to bind just the built-ins.
 */
export const createExpressionProcessors = (
  functions?: ExpressionFunctionRegistry
): ExpressionProcessors => {
  const registry = mergeFunctions(functions);
  return {
    sql: getExpressionRuleProcessorSQL(registry),
    parameterized: getExpressionRuleProcessorParameterized(registry),
    jsonLogic: getExpressionRuleProcessorJsonLogic(registry),
  };
};
