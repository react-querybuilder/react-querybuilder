import { RuleType, RuleGroupTypeAny } from '../types';

/**
 * Determines if this is a RuleType or RuleGroupType
 * @deprecated
 */
const isRuleGroup = (ruleOrGroup: RuleType | RuleGroupTypeAny): ruleOrGroup is RuleGroupTypeAny => {
  const rg = ruleOrGroup as RuleGroupTypeAny;
  return rg && Array.isArray(rg.rules);
};

export default isRuleGroup;
