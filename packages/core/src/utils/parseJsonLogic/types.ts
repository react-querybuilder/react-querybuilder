import type {
  JsonLogicLessThan,
  JsonLogicLessThanOrEqual,
  JsonLogicRulesLogic,
  RQBJsonLogic,
} from '../../types';

export interface JsonLogicBetweenExclusive extends JsonLogicLessThan {
  '<': [JsonLogicRulesLogic, JsonLogicRulesLogic, JsonLogicRulesLogic];
}
export interface JsonLogicBetweenInclusive extends JsonLogicLessThanOrEqual {
  '<=': [JsonLogicRulesLogic, JsonLogicRulesLogic, JsonLogicRulesLogic];
}

/**
 * A JsonLogic operand subtree that {@link ParseJsonLogicOptions.getExpression} may receive —
 * an arithmetic/function operation object, a variable reference, or a literal.
 */
export type JsonLogicExpressionOperand = RQBJsonLogic;

/** Context passed to {@link ParseJsonLogicOptions.getExpression}. */
export interface ParseJsonLogicExpressionContext {
  /** Returns `true` if the field is configured (or if no `fields` were supplied). */
  fieldExists: (fieldName: string) => boolean;
}
