import type {
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleType,
} from '../types/index.noReact';

/**
 * Determines if this is either a RuleGroupType or RuleGroupTypeIC.
 * `'rules' in query` can be used as an alternative.
 */
export const isRuleGroup = (rg: any): rg is RuleGroupTypeAny =>
  !!rg && typeof rg === 'object' && 'rules' in rg && Array.isArray(rg.rules);

export const isRuleGroupType = (rg: RuleType | RuleGroupTypeAny): rg is RuleGroupType =>
  isRuleGroup(rg) && 'combinator' in rg;

export const isRuleGroupTypeIC = (rg: RuleType | RuleGroupTypeAny): rg is RuleGroupTypeIC =>
  isRuleGroup(rg) && !('combinator' in rg);
