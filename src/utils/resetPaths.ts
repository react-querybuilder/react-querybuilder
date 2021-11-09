import type { RuleGroupTypeAny, RuleType } from '../types';

const resetPaths = <RG extends RuleGroupTypeAny>(rg: RG, parentPath?: number[], index = 0): RG => {
  const thisRG = { ...rg, path: parentPath ? [...parentPath, index] : [] };

  return {
    ...thisRG,
    rules: rg.rules.map((r: RuleType | RuleGroupTypeAny | string, idx: number) => {
      if (typeof r === 'string') {
        return r;
      } else if ('rules' in r) {
        return resetPaths(r, thisRG.path, idx);
      }
      return { ...r, path: [...thisRG.path, idx] };
    })
  };
};

export default resetPaths;
