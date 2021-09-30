import cloneDeep from 'lodash/cloneDeep';
import { generateID, isRuleGroup } from '.';
import { RuleType } from '..';
import { RuleGroupType } from '../types';

const regenerateID = (rule: RuleType) => ({ ...cloneDeep(rule), id: `r-${generateID()}` });

const regenerateIDs = (ruleGroup: RuleGroupType): RuleGroupType => {
  const { combinator, not } = ruleGroup;
  const rules = ruleGroup.rules.map((r) => (isRuleGroup(r) ? regenerateIDs(r) : regenerateID(r)));
  return { id: `g-${generateID()}`, combinator, rules, not };
};

export default regenerateIDs;
