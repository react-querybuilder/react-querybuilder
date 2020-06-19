import { isRuleGroup } from '.';
import { RuleGroupType, RuleType } from '../types';

const findRule = (id: string, parent: RuleGroupType): RuleGroupType | RuleType | undefined => {
  if (parent.id === id) {
    return parent;
  }

  for (const rule of parent.rules) {
    if (rule.id === id) {
      return rule;
    } else if (isRuleGroup(rule)) {
      const subRule = findRule(id, rule);
      if (subRule) {
        return subRule;
      }
    }
  }

  return undefined;
};

export default findRule;
