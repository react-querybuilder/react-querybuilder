import type { RuleGroupTypeAny, RuleType } from '../types';

type FindPathReturnType = RuleGroupTypeAny | RuleType | null;

export const findPath = (path: number[], query: RuleGroupTypeAny): FindPathReturnType => {
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

export const getParentPath = (path: number[]) => path.slice(0, path.length - 1);

export const pathsAreEqual = (path1: number[], path2: number[]) =>
  path1.length === path2.length && path1.every((val, idx) => val === path2[idx]);

export const isAncestor = (maybeAncestor: number[], path: number[]) =>
  maybeAncestor.length < path.length && RegExp(`^${maybeAncestor.join('-')}`).test(path.join('-'));

export const getCommonAncestorPath = (path1: number[], path2: number[]) => {
  const commonAncestorPath: number[] = [];
  const parentPath1 = getParentPath(path1);
  const parentPath2 = getParentPath(path2);

  for (
    let i = 0;
    i < parentPath1.length && i < parentPath2.length && parentPath1[i] === parentPath2[i];
    i++
  ) {
    commonAncestorPath.push(parentPath2[i]);
  }

  return commonAncestorPath;
};

export const pathIsDisabled = (path: number[], query: RuleGroupTypeAny) => {
  if (query.disabled) return true;
  let disabled = false;
  let target: RuleType | RuleGroupTypeAny = query;
  for (let level = 0; level < path.length && !disabled && 'rules' in target; level++) {
    const t: RuleGroupTypeAny | RuleType | string = target.rules[path[level]];
    if (typeof t === 'object' && ('rules' in t || 'field' in t)) {
      disabled = !!t.disabled;
      target = t;
    }
  }
  return disabled;
};
