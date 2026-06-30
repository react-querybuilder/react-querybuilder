import type { RuleProcessor } from '@react-querybuilder/core';
import { getExpressionRuleProcessorJsonLogic } from './processors/getExpressionRuleProcessorJsonLogic';
import { getExpressionRuleProcessorParameterized } from './processors/getExpressionRuleProcessorParameterized';
import { getExpressionRuleProcessorSQL } from './processors/getExpressionRuleProcessorSQL';

export * from './defaultFunctions';
export * from './jsonLogicOperators';
export * from './processors/createExpressionProcessors';
export * from './processors/getExpressionRuleProcessorJsonLogic';
export * from './processors/getExpressionRuleProcessorParameterized';
export * from './processors/getExpressionRuleProcessorSQL';
export * from './registry';
export * from './types';
export * from './utils/createExpressionValidator';
export * from './utils/validateExpression';

/** Ready-to-use "sql" rule processor bound to {@link defaultFunctions}. */
export const expressionRuleProcessorSQL: RuleProcessor = getExpressionRuleProcessorSQL();

/** Ready-to-use "parameterized"/"parameterized_named" rule processor bound to {@link defaultFunctions}. */
export const expressionRuleProcessorParameterized: RuleProcessor =
  getExpressionRuleProcessorParameterized();

/** Ready-to-use "jsonlogic" rule processor bound to {@link defaultFunctions}. */
export const expressionRuleProcessorJsonLogic: RuleProcessor =
  getExpressionRuleProcessorJsonLogic();
