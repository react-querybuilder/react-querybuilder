import type { JsonLogicLessThan, JsonLogicLessThanOrEqual, RulesLogic } from 'json-logic-js';

export interface JsonLogicBetweenExclusive extends JsonLogicLessThan {
  '<': [RulesLogic, RulesLogic, RulesLogic];
}
export interface JsonLogicBetweenInclusive extends JsonLogicLessThanOrEqual {
  '<=': [RulesLogic, RulesLogic, RulesLogic];
}
