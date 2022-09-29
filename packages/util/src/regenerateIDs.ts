import type {
  RuleGroupArray,
  RuleGroupICArray,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleType,
} from '@react-querybuilder/ts/dist/types/src/index.noReact';
import { generateID } from './generateID';

export const regenerateID = (rule: RuleType): RuleType =>
  JSON.parse(JSON.stringify({ ...rule, id: `r-${generateID()}` }));

export const regenerateIDs = (
  ruleGroup: RuleGroupType | RuleGroupTypeIC
): RuleGroupType | RuleGroupTypeIC => {
  if ('combinator' in ruleGroup) {
    const rules = ruleGroup.rules.map(r =>
      'rules' in r ? regenerateIDs(r) : regenerateID(r)
    ) as RuleGroupArray;
    return { ...ruleGroup, id: `g-${generateID()}`, rules };
  }
  const rules = ruleGroup.rules.map(r =>
    typeof r === 'string' ? r : 'rules' in r ? regenerateIDs(r) : regenerateID(r)
  ) as RuleGroupICArray;
  return { ...ruleGroup, id: `g-${generateID()}`, rules };
};
