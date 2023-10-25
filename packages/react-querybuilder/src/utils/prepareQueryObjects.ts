import { produce } from 'immer';
import type {
  RuleGroupArray,
  RuleGroupICArray,
  RuleGroupTypeAny,
  RuleType,
} from '../types/index.noReact';
import { generateID } from './generateID';
import { isRuleGroup } from './isRuleGroup';

/**
 * Options for {@link prepareRule}/{@link prepareRuleGroup}.
 */
export interface PreparerOptions {
  idGenerator?: () => string;
}

/**
 * Ensures that a rule is valid by adding an `id` property if it does not already exist.
 */
export const prepareRule = (rule: RuleType, { idGenerator = generateID }: PreparerOptions = {}) =>
  produce(rule, draft => {
    if (!draft.id) {
      draft.id = idGenerator();
    }
  });

/**
 * Ensures that a rule group is valid by recursively adding an `id` property to the group itself
 * and all its rules and subgroups where one does not already exist.
 */
export const prepareRuleGroup = <RG extends RuleGroupTypeAny>(
  queryObject: RG,
  { idGenerator = generateID }: PreparerOptions = {}
): RG =>
  produce(queryObject, draft => {
    if (!draft.id) {
      draft.id = idGenerator();
    }
    draft.rules = draft.rules.map(r =>
      typeof r === 'string'
        ? r
        : isRuleGroup(r)
        ? prepareRuleGroup(r, { idGenerator })
        : prepareRule(r, { idGenerator })
    ) as RuleGroupArray | RuleGroupICArray;
  });

/**
 * Ensures that a rule or group is valid. See {@link prepareRule} and {@link prepareRuleGroup}.
 */
export const prepareRuleOrGroup = <RG extends RuleGroupTypeAny>(
  rg: RG | RuleType,
  { idGenerator = generateID }: PreparerOptions = {}
) => (isRuleGroup(rg) ? prepareRuleGroup(rg, { idGenerator }) : prepareRule(rg, { idGenerator }));
