import type {
  RuleGroupArray,
  RuleGroupICArray,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleType,
} from '../types';
import { generateID } from './generateID';
import { isRuleGroup, isRuleGroupType } from './isRuleGroup';
import { isPojo } from './misc';

/**
 * Options object for {@link regenerateID}/{@link regenerateIDs}.
 */
export interface RegenerateIdOptions {
  idGenerator?: () => string;
}

/**
 * Generates a new `id` property for a rule.
 */
export const regenerateID = (
  rule: RuleType,
  { idGenerator = generateID }: RegenerateIdOptions = {}
): RuleType => structuredClone({ ...rule, id: idGenerator() });

/**
 * Recursively generates new `id` properties for a group and all its rules and subgroups.
 */
export const regenerateIDs = (
  ruleOrGroup: RuleGroupType | RuleGroupTypeIC,
  { idGenerator = generateID }: RegenerateIdOptions = {}
): RuleGroupType | RuleGroupTypeIC => {
  if (!isPojo(ruleOrGroup)) return ruleOrGroup;

  if (!isRuleGroup(ruleOrGroup)) {
    return structuredClone({
      ...(ruleOrGroup as RuleType),
      id: idGenerator(),
    }) as unknown as RuleGroupType;
    // ^ this is a lie, but it shouldn't matter
  }

  if (isRuleGroupType(ruleOrGroup)) {
    const rules = ruleOrGroup.rules.map(r =>
      isRuleGroup(r) ? regenerateIDs(r, { idGenerator }) : regenerateID(r, { idGenerator })
    ) as RuleGroupArray;
    return { ...ruleOrGroup, id: idGenerator(), rules };
  }

  const rules = ruleOrGroup.rules.map(r =>
    typeof r === 'string'
      ? r
      : isRuleGroup(r)
        ? regenerateIDs(r, { idGenerator })
        : regenerateID(r, { idGenerator })
  ) as RuleGroupICArray;
  return { ...ruleOrGroup, id: idGenerator(), rules };
};
