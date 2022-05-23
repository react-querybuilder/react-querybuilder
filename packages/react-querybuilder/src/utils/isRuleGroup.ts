import type { RuleGroupType, RuleGroupTypeAny, RuleGroupTypeIC, RuleType } from '../types';

const isRuleGroup = (rg: RuleType | RuleGroupTypeAny): rg is RuleGroupTypeAny =>
  typeof rg === 'object' && 'rules' in rg && Array.isArray(rg.rules);

export const isRuleGroupType = (rg: RuleType | RuleGroupTypeAny): rg is RuleGroupType =>
  isRuleGroup(rg) && 'combinator' in rg;

export const isRuleGroupTypeIC = (rg: RuleType | RuleGroupTypeAny): rg is RuleGroupTypeIC =>
  isRuleGroup(rg) && !('combinator' in rg);
