import type { RuleGroupType, RuleGroupTypeAny, RuleGroupTypeIC } from '../types';
import { isPojo } from './misc';

/**
 * Determines if an object is a {@link RuleGroupType} or {@link RuleGroupTypeIC}.
 */
// oxlint-disable-next-line typescript/no-explicit-any
export const isRuleGroup = (rg: any): rg is RuleGroupTypeAny =>
  isPojo(rg) && Array.isArray(rg.rules);

/**
 * Determines if an object is a {@link RuleGroupType}.
 */
// oxlint-disable-next-line typescript/no-explicit-any
export const isRuleGroupType = (rg: any): rg is RuleGroupType =>
  isRuleGroup(rg) && typeof rg.combinator === 'string';

/**
 * Determines if an object is a {@link RuleGroupTypeIC}.
 */
// oxlint-disable-next-line typescript/no-explicit-any
export const isRuleGroupTypeIC = (rg: any): rg is RuleGroupTypeIC =>
  isRuleGroup(rg) && rg.combinator === undefined;
