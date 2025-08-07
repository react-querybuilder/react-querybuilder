import type {
  RulesEngine,
  RulesEngineAction,
  RulesEngineAny,
  RulesEngineIC,
} from '../types/index.noReact';
import { isRuleGroupType, isRuleGroupTypeIC } from './isRuleGroup';
import { isPojo } from './misc';

/**
 * Determines if an object is a {@link RulesEngine} or {@link RulesEngineIC}.
 */
export const isRulesEngineAny = (re: unknown): re is RulesEngineAny =>
  isPojo(re) && 'conditions' in re && Array.isArray(re.conditions);

/**
 * Determines if an object is a {@link RulesEngine}.
 */
export const isRulesEngine = (re: unknown): re is RulesEngine =>
  isRulesEngineAny(re) && isRuleGroupType(re.conditions[0]);

/**
 * Determines if an object is a {@link RulesEngineIC}.
 */
export const isRulesEngineIC = (re: unknown): re is RulesEngineIC =>
  isRulesEngineAny(re) && isRuleGroupTypeIC(re.conditions[0]);

/**
 * Determines if an object is a {@link RulesEngine} or {@link RulesEngineIC}.
 */
export const isRulesEngineAction = (obj: unknown): obj is RulesEngineAction =>
  isPojo(obj) && typeof obj.actionType === 'string';
