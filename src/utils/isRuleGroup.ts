import { RuleType, RuleGroupType } from '../types';

/**
 * Determines if this is a RuleType or RuleGroupType
 */
const isRuleGroup = (ruleOrGroup: RuleType | RuleGroupType): ruleOrGroup is RuleGroupType => {
  const rg = ruleOrGroup as RuleGroupType;
  return !!(rg.combinator && rg.rules);
};

export default isRuleGroup;
