import type { RuleGroupType, RuleGroupTypeAny, RuleGroupTypeIC } from '../types/index.noReact';

/**
 * Determines if an object is a {@link RuleGroupType} or {@link RuleGroupTypeIC}.
 */
export const isRuleGroup = (rg: any): rg is RuleGroupTypeAny =>
  !!rg && typeof rg === 'object' && 'rules' in rg && Array.isArray(rg.rules);

/**
 * Determines if an object is a {@link RuleGroupType}.
 */
export const isRuleGroupType = (rg: any): rg is RuleGroupType =>
  isRuleGroup(rg) && typeof rg.combinator === 'string';

/**
 * Determines if an object is a {@link RuleGroupTypeIC}.
 */
export const isRuleGroupTypeIC = (rg: any): rg is RuleGroupTypeIC =>
  isRuleGroup(rg) && !Object.hasOwn(rg, 'combinator');
