import type {
  RuleGroupArray,
  RuleGroupICArray,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleType,
} from '@react-querybuilder/ts/src/index.noReact';
import { generateID } from '../utils';

interface RegenerateIdOptions {
  idGenerator?: () => string;
}

export const regenerateID = (
  rule: RuleType,
  { idGenerator = generateID }: RegenerateIdOptions = {}
): RuleType => JSON.parse(JSON.stringify({ ...rule, id: idGenerator() }));

export const regenerateIDs = (
  ruleGroup: RuleGroupType | RuleGroupTypeIC,
  { idGenerator = generateID }: RegenerateIdOptions = {}
): RuleGroupType | RuleGroupTypeIC => {
  if ('combinator' in ruleGroup) {
    const { combinator, not } = ruleGroup;
    const rules = ruleGroup.rules.map(r =>
      'rules' in r ? regenerateIDs(r, { idGenerator }) : regenerateID(r, { idGenerator })
    ) as RuleGroupArray;
    return { id: idGenerator(), combinator, rules, not };
  }
  const { not } = ruleGroup;
  const rules = ruleGroup.rules.map(r =>
    typeof r === 'string'
      ? r
      : 'rules' in r
      ? regenerateIDs(r, { idGenerator })
      : regenerateID(r, { idGenerator })
  ) as RuleGroupICArray;
  return { id: idGenerator(), rules, not };
};
