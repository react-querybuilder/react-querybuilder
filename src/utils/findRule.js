import { isRuleGroup } from '.';

const findRule = (id, parent) => {
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
};

export default findRule;
