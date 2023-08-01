import type {
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleType,
} from '../types/index.noReact';

/**
 * Determines if an object is either a {@link RuleGroupType} or {@link RuleGroupTypeIC}.
 * `'rules' in rg` can be used as an alternative.
 */
export const isRuleGroup = (rg: RuleType | RuleGroupTypeAny): rg is RuleGroupTypeAny =>
  typeof rg === 'object' && 'rules' in rg && Array.isArray(rg.rules);

/**
 * Determines if an object is a {@link RuleGroupType}. `'rules' in rg && 'combinator' in rg`
 * can be used as an alternative.
 */
export const isRuleGroupType = (rg: RuleType | RuleGroupTypeAny): rg is RuleGroupType =>
  isRuleGroup(rg) && 'combinator' in rg;

/**
 * Determines if an object is a {@link RuleGroupTypeIC}. `'rules' in rg && !('combinator' in rg)`
 * can be used as an alternative.
 */
export const isRuleGroupTypeIC = (rg: RuleType | RuleGroupTypeAny): rg is RuleGroupTypeIC =>
  isRuleGroup(rg) && !('combinator' in rg);
