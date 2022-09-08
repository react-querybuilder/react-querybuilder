import type { RuleGroupTypeAny } from 'ruleGroupsIC';
import type { RuleType } from './ruleGroups';

export interface ValidationResult {
  valid: boolean;
  reasons?: any[];
}

export type ValidationMap = Record<string, boolean | ValidationResult>;

export type QueryValidator = (query: RuleGroupTypeAny) => boolean | ValidationMap;

export type RuleValidator = (rule: RuleType) => boolean | ValidationResult;
