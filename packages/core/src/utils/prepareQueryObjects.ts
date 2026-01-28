import type {
  RuleGroupArray,
  RuleGroupICArray,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleType,
} from '../types';
import { processMatchMode } from './formatQuery/utils';
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
export const prepareRule = (
  rule: RuleType,
  { idGenerator = generateID }: PreparerOptions = {}
): RuleType => {
  const needsId = !rule.id;
  const hasMatchMode = processMatchMode(rule);

  if (!needsId && !hasMatchMode) {
    return rule;
  }

  return {
    ...rule,
    ...(needsId && { id: idGenerator() }),
    ...(hasMatchMode && { value: prepareRuleGroup(rule.value, { idGenerator }) }),
  };
};

/**
 * Ensures that a rule group is valid by recursively adding an `id` property to the group itself
 * and all its rules and subgroups where one does not already exist.
 */
export const prepareRuleGroup = <RG extends RuleGroupTypeAny>(
  queryObject: RG,
  { idGenerator = generateID }: PreparerOptions = {}
): RG => {
  const needsId = !queryObject.id;
  let rulesChanged = false;
  const newRules: (RuleGroupTypeAny | RuleType | string)[] = [];

  for (let i = 0; i < queryObject.rules.length; i++) {
    const r = queryObject.rules[i];
    if (typeof r === 'string') {
      newRules.push(r);
    } else {
      const prepared = isRuleGroup(r)
        ? prepareRuleGroup(r, { idGenerator })
        : prepareRule(r, { idGenerator });
      newRules.push(prepared);
      if (prepared !== r) {
        rulesChanged = true;
      }
    }
  }

  if (!needsId && !rulesChanged) {
    return queryObject;
  }

  return {
    ...queryObject,
    ...(needsId && { id: idGenerator() }),
    rules: newRules as RuleGroupArray | RuleGroupICArray,
  };
};

/**
 * Ensures that a rule or group is valid. See {@link prepareRule} and {@link prepareRuleGroup}.
 */
export const prepareRuleOrGroup = <RG extends RuleGroupTypeAny>(
  rg: RG | RuleType,
  { idGenerator = generateID }: PreparerOptions = {}
): RuleGroupType | RuleGroupTypeIC | RuleType =>
  isRuleGroup(rg) ? prepareRuleGroup(rg, { idGenerator }) : prepareRule(rg, { idGenerator });
