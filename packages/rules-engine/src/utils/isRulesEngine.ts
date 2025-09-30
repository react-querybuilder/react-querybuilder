import { isPojo, isRuleGroup, isRuleGroupType, isRuleGroupTypeIC } from '@react-querybuilder/core';
import type {
  RulesEngine,
  RulesEngineAction,
  RulesEngineAny,
  RulesEngineCondition,
  RulesEngineConditionAny,
  RulesEngineConditionIC,
  RulesEngineIC,
} from '../types';

/**
 * Determines if an object is a {@link RulesEngine} or {@link RulesEngineIC}.
 */
export const isRulesEngineAny = (re: unknown): re is RulesEngineAny =>
  isPojo(re) && 'conditions' in re && Array.isArray(re.conditions);

/**
 * Determines if an object is a {@link RulesEngine}.
 */
export const isRulesEngine = (re: unknown): re is RulesEngine =>
  isRulesEngineAny(re) && isRuleGroupType(re.conditions[0]?.condition);

/**
 * Determines if an object is a {@link RulesEngineIC}.
 */
export const isRulesEngineIC = (re: unknown): re is RulesEngineIC =>
  isRulesEngineAny(re) && isRuleGroupTypeIC(re.conditions[0]?.condition);

/**
 * Determines if an object is a {@link RulesEngine} or {@link RulesEngineIC}.
 */
export const isRulesEngineAction = (obj: unknown): obj is RulesEngineAction =>
  isPojo(obj) && typeof obj.actionType === 'string';

/**
 * Determines if an object is a {@link RulesEngineCondition} or {@link RulesEngineConditionIC}.
 */
export const isRulesEngineConditionAny = (re: unknown): re is RulesEngineConditionAny =>
  isPojo(re) && 'condition' in re && isRuleGroup(re.condition);

/**
 * Determines if an object is a {@link RulesEngineCondition}.
 */
export const isRulesEngineCondition = (re: unknown): re is RulesEngineCondition =>
  isRulesEngineConditionAny(re) && isRuleGroupType(re.condition);

/**
 * Determines if an object is a {@link RulesEngineConditionIC}.
 */
export const isRulesEngineConditionIC = (re: unknown): re is RulesEngineConditionIC =>
  isRulesEngineConditionAny(re) && isRuleGroupTypeIC(re.condition);
