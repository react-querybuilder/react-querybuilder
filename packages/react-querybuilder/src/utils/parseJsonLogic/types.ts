import type {
  JsonLogicLessThan,
  JsonLogicLessThanOrEqual,
  JsonLogicRulesLogic,
} from '@react-querybuilder/ts/dist/index.noReact';

export interface JsonLogicBetweenExclusive extends JsonLogicLessThan {
  '<': [JsonLogicRulesLogic, JsonLogicRulesLogic, JsonLogicRulesLogic];
}
export interface JsonLogicBetweenInclusive extends JsonLogicLessThanOrEqual {
  '<=': [JsonLogicRulesLogic, JsonLogicRulesLogic, JsonLogicRulesLogic];
}
