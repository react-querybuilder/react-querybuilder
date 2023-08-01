import type {
  RuleGroupArray,
  RuleGroupICArray,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleType,
} from '../types/index.noReact';
import { generateID } from './generateID';
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
): RuleType => JSON.parse(JSON.stringify({ ...rule, id: idGenerator() }));

/**
 * Recursively generates new `id` properties for a group and all its rules and subgroups.
 */
export const regenerateIDs = (
  ruleOrGroup: RuleGroupType | RuleGroupTypeIC,
  { idGenerator = generateID }: RegenerateIdOptions = {}
): RuleGroupType | RuleGroupTypeIC => {
  if (!isPojo(ruleOrGroup)) return ruleOrGroup;

  if (!('rules' in ruleOrGroup)) {
    return JSON.parse(JSON.stringify({ ...(ruleOrGroup as any), id: idGenerator() }));
  }

  if ('combinator' in ruleOrGroup) {
    const rules = ruleOrGroup.rules.map(r =>
      isPojo(r) && 'rules' in r
        ? regenerateIDs(r, { idGenerator })
        : regenerateID(r, { idGenerator })
    ) as RuleGroupArray;
    return { ...ruleOrGroup, id: idGenerator(), rules };
  }

  const rules = ruleOrGroup.rules.map(r =>
    typeof r === 'string'
      ? r
      : isPojo(r) && 'rules' in r
      ? regenerateIDs(r, { idGenerator })
      : regenerateID(r, { idGenerator })
  ) as RuleGroupICArray;
  return { ...ruleOrGroup, id: idGenerator(), rules };
};
