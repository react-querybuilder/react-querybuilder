import type { RuleGroupTypeAny, RuleType } from '../types/ruleGroups';

type FindPathReturnType = RuleGroupTypeAny | RuleType | null;

const findPath = (path: number[], query: RuleGroupTypeAny): FindPathReturnType => {
  if (path.length === 0) {
    return query;
  }

  let target: FindPathReturnType = query;
  for (let level = 0; level < path.length && target && 'rules' in target; level++) {
    const t: RuleGroupTypeAny | RuleType | string = target.rules[path[level]];
    if (typeof t !== 'string') {
      target = t;
    } else {
      target = null;
    }
  }

  return target;
};

export default findPath;
