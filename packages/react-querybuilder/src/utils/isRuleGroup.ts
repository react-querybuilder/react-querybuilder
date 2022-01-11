import type { RuleType, RuleGroupTypeAny, RuleGroupTypeIC, RuleGroupType } from '../types';

/**
 * Determines if this is a RuleGroupType or RuleGroupTypeIC.
 *
 * May be removed in a future major version.
 *
 * (Use `'rules' in query` instead.)
 *
 * @deprecated
 */
export const isRuleGroup = (rg: RuleType | RuleGroupTypeAny): rg is RuleGroupTypeAny =>
  typeof rg === 'object' && 'rules' in rg && Array.isArray(rg.rules);

export const isRuleGroupType = (rg: RuleGroupTypeAny): rg is RuleGroupType =>
  isRuleGroup(rg) && 'combinator' in rg;

export const isRuleGroupTypeIC = (rg: RuleGroupTypeAny): rg is RuleGroupTypeIC =>
  isRuleGroup(rg) && !('combinator' in rg);
