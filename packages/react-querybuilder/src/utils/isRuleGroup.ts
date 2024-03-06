import type { RuleGroupType, RuleGroupTypeAny, RuleGroupTypeIC } from '../types/index.noReact';
import { isPojo } from './misc';

/**
 * Determines if an object is a {@link RuleGroupType} or {@link RuleGroupTypeIC}.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isRuleGroup = (rg: any): rg is RuleGroupTypeAny =>
  isPojo(rg) && 'rules' in rg && Array.isArray(rg.rules);

/**
 * Determines if an object is a {@link RuleGroupType}.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isRuleGroupType = (rg: any): rg is RuleGroupType =>
  isRuleGroup(rg) && typeof rg.combinator === 'string';

/**
 * Determines if an object is a {@link RuleGroupTypeIC}.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isRuleGroupTypeIC = (rg: any): rg is RuleGroupTypeIC =>
  isRuleGroup(rg) && typeof rg.combinator === 'undefined';
