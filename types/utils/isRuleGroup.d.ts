import { RuleType, RuleGroupType } from '../types';
/**
 * Determines if this is a RuleType or RuleGroupType
 */
declare const isRuleGroup: (ruleOrGroup: RuleType | RuleGroupType) => ruleOrGroup is RuleGroupType;
export default isRuleGroup;
