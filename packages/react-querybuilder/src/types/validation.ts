import type { RuleType } from './ruleGroups';
import type { RuleGroupTypeAny } from './ruleGroupsIC';

/**
 * Object with a `valid` boolean value and optional `reasons`.
 */
export interface ValidationResult {
  valid: boolean;
  reasons?: any[];
}

/**
 * Map of rule/group `id` to its respective {@link ValidationResult}.
 */
export type ValidationMap = Record<string, boolean | ValidationResult>;

/**
 * Function that validates a query.
 */
export type QueryValidator = (query: RuleGroupTypeAny) => boolean | ValidationMap;

/**
 * Function that validates a rule.
 */
export type RuleValidator = (rule: RuleType) => boolean | ValidationResult;
