import type {
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleType,
} from '../types/index.noReact';
import { isPojo } from './misc';

/**
 * Determines if an object is a {@link RuleType} (only checks for a `field` property).
 */
export const isRuleType = (s: unknown): s is RuleType =>
  isPojo(s) && 'field' in s && typeof s.field === 'string';

/**
 * Determines if an object is a {@link RuleGroupType} or {@link RuleGroupTypeIC}.
 */
export const isRuleGroup = (rg: unknown): rg is RuleGroupTypeAny =>
  isPojo(rg) && Array.isArray(rg.rules);

/**
 * Determines if an object is a {@link RuleGroupType}.
 */
export const isRuleGroupType = (rg: unknown): rg is RuleGroupType =>
  isRuleGroup(rg) && typeof rg.combinator === 'string';

/**
 * Determines if an object is a {@link RuleGroupTypeIC}.
 */
export const isRuleGroupTypeIC = (rg: unknown): rg is RuleGroupTypeIC =>
  isRuleGroup(rg) && rg.combinator === undefined;
