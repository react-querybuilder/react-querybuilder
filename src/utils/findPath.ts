import { isRuleGroup } from '.';
import { RuleGroupType, RuleType } from '../types';

const findPath = (path: number[], query: RuleGroupType): RuleGroupType | RuleType => {
  if (path.length === 0) {
    return query;
  }

  let target: RuleGroupType | RuleType = query;
  for (let level = 0; level < path.length && isRuleGroup(target); level++) {
    target = target.rules[path[level]];
  }

  return target;
};

export default findPath;
