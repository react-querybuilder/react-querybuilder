import type {
  RuleGroupArray,
  RuleGroupICArray,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleType,
} from '@react-querybuilder/ts/src/index.noReact';
import { generateID } from '../utils';

export const regenerateID = (rule: RuleType): RuleType =>
  JSON.parse(JSON.stringify({ ...rule, id: `r-${generateID()}` }));

export const regenerateIDs = (
  ruleGroup: RuleGroupType | RuleGroupTypeIC
): RuleGroupType | RuleGroupTypeIC => {
  if ('combinator' in ruleGroup) {
    const { combinator, not } = ruleGroup;
    const rules = ruleGroup.rules.map(r =>
      'rules' in r ? regenerateIDs(r) : regenerateID(r)
    ) as RuleGroupArray;
    return { id: `g-${generateID()}`, combinator, rules, not };
  }
  const { not } = ruleGroup;
  const rules = ruleGroup.rules.map(r =>
    typeof r === 'string' ? r : 'rules' in r ? regenerateIDs(r) : regenerateID(r)
  ) as RuleGroupICArray;
  return { id: `g-${generateID()}`, rules, not };
};
