import { isPojo, isRuleGroup, isRuleGroupType, isRuleGroupTypeIC } from '@react-querybuilder/core';
import type {
  Consequent,
  RECondition,
  REConditionAny,
  REConditionIC,
  RulesEngine,
  RulesEngineAny,
  RulesEngineIC,
} from '../types';

/**
 * Determines if an object is a {@link RulesEngine} or {@link RulesEngineIC}.
 */
export const isRulesEngineAny = (re: unknown): re is RulesEngineAny =>
  isPojo(re) && Array.isArray(re.conditions);

/**
 * Determines if an object is a {@link RulesEngine}.
 */
export const isRulesEngine = (re: unknown): re is RulesEngine =>
  isRulesEngineAny(re) && isRuleGroupType(re.conditions[0]?.antecedent);

/**
 * Determines if an object is a {@link RulesEngineIC}.
 */
export const isRulesEngineIC = (re: unknown): re is RulesEngineIC =>
  isRulesEngineAny(re) && isRuleGroupTypeIC(re.conditions[0]?.antecedent);

/**
 * Determines if an object is a {@link RulesEngine} or {@link RulesEngineIC}.
 */
export const isRulesEngineConsequent = (obj: unknown): obj is Consequent =>
  isPojo(obj) && typeof obj.type === 'string';

/**
 * Determines if an object is a {@link RulesEngineAntecedent} or {@link REConditionIC}.
 */
export const isRulesEngineConditionAny = (re: unknown): re is REConditionAny =>
  isPojo(re) && 'antecedent' in re && isRuleGroup(re.antecedent);

/**
 * Determines if an object is a {@link RulesEngineAntecedent}.
 */
export const isRulesEngineCondition = (re: unknown): re is RECondition =>
  isRulesEngineConditionAny(re) && isRuleGroupType(re.antecedent);

/**
 * Determines if an object is a {@link REConditionIC}.
 */
export const isRulesEngineConditionIC = (re: unknown): re is REConditionIC =>
  isRulesEngineConditionAny(re) && isRuleGroupTypeIC(re.antecedent);
