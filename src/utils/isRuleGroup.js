/**
 * Determines if this is a Rule or RuleGroup
 * @param {RuleType|RuleGroupType} ruleOrGroup
 * @returns {boolean}
 */
const isRuleGroup = (ruleOrGroup) => {
  return !!(ruleOrGroup.combinator && ruleOrGroup.rules);
};

export default isRuleGroup;
