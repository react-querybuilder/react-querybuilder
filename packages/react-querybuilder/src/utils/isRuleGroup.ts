import type { RuleType, RuleGroupTypeAny } from '../types';

/**
 * Determines if this is a RuleGroupType or RuleGroupTypeIC.
 *
 * May be removed in a future major version.
 *
 * @deprecated
 */
const isRuleGroup = (ruleOrGroup: RuleType | RuleGroupTypeAny): ruleOrGroup is RuleGroupTypeAny => {
  const rg = ruleOrGroup as RuleGroupTypeAny;
  return rg && Array.isArray(rg.rules);
};

export default isRuleGroup;
