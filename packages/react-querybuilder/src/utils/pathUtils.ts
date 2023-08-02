import type { Path, RuleGroupTypeAny, RuleType } from '../types/index.noReact';
import { isPojo } from './misc';

/**
 * Return type for {@link findPath}.
 */
export type FindPathReturnType = RuleGroupTypeAny | RuleType | null;

/**
 * Returns the {@link RuleType} or {@link RuleGroupType}/{@link RuleGroupTypeIC}
 * at the given path within a query.
 */
export const findPath = (path: Path, query: RuleGroupTypeAny): FindPathReturnType => {
  let target: FindPathReturnType = query;
  let level = 0;
  while (level < path.length && target && 'rules' in target) {
    const t: RuleGroupTypeAny | RuleType | string = target.rules[path[level]];
    if (typeof t !== 'string') {
      target = t;
    } else {
      target = null;
    }
    level++;
  }

  return target;
};

/**
 * Truncates the last element of an array and returns the result as a new array.
 */
export const getParentPath = (path: Path) => path.slice(0, path.length - 1);

/**
 * Determines if two paths (each `Path`) are equivalent.
 */
export const pathsAreEqual = (path1: Path, path2: Path) =>
  path1.length === path2.length && path1.every((val, idx) => val === path2[idx]);

/**
 * Determines if the first path is an ancestor of the second path. The first path must
 * be shorter and exactly match the second path up through the length of the first path.
 */
export const isAncestor = (maybeAncestor: Path, path: Path) =>
  maybeAncestor.length < path.length && RegExp(`^${maybeAncestor.join('-')}`).test(path.join('-'));

/**
 * Finds the deepest/longest path that two paths have in common.
 */
export const getCommonAncestorPath = (path1: Path, path2: Path) => {
  const commonAncestorPath: Path = [];
  const parentPath1 = getParentPath(path1);
  const parentPath2 = getParentPath(path2);
  let i = 0;

  while (i < parentPath1.length && i < parentPath2.length && parentPath1[i] === parentPath2[i]) {
    commonAncestorPath.push(parentPath2[i]);
    i++;
  }

  return commonAncestorPath;
};

/**
 * Determines if the rule or group at the specified path is either disabled itself
 * or disabled by an ancestor group.
 */
export const pathIsDisabled = (path: Path, query: RuleGroupTypeAny) => {
  let disabled = !!query.disabled;
  let target: RuleType | RuleGroupTypeAny = query;
  let level = 0;
  while (level < path.length && !disabled && 'rules' in target) {
    const t: RuleGroupTypeAny | RuleType | string = target.rules[path[level]];
    if (isPojo(t) && ('rules' in t || 'field' in t)) {
      disabled = !!t.disabled;
      target = t;
    }
    level++;
  }
  return disabled;
};
