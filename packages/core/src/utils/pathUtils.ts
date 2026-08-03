import type { Path, RuleGroupTypeAny, RuleType } from '../types';
import { isRuleGroup } from './isRuleGroup';
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
  while (level < path.length && target && isRuleGroup(target)) {
    const t: RuleGroupTypeAny | RuleType | string = target.rules[path[level]];
    target = typeof t === 'string' ? null : t;
    level++;
  }

  return level < path.length ? null : target;
};

/**
 * Returns the {@link RuleType} or {@link RuleGroupType}/{@link RuleGroupTypeIC}
 * with the given `id` within a query.
 */
export const findID = (id: string, query: RuleGroupTypeAny): FindPathReturnType => {
  if (query.id === id) {
    return query;
  }

  for (const rule of query.rules) {
    if (typeof rule === 'string') continue;
    if (rule.id === id) {
      return rule;
    } else if (isRuleGroup(rule)) {
      const subRule = findID(id, rule);
      if (subRule) {
        return subRule;
      }
    }
  }

  return null;
};

/**
 * Returns the {@link Path} of the {@link RuleType} or {@link RuleGroupType}/{@link RuleGroupTypeIC}
 * with the given `id` within a query.
 */
export const getPathOfID = (id: string, query: RuleGroupTypeAny): Path | null => {
  if (query.id === id) return [];

  const idx = query.rules.findIndex(r => !(typeof r === 'string') && r.id === id);

  if (idx >= 0) {
    return [idx];
  }

  for (const [i, r] of Object.entries(query.rules)) {
    if (isRuleGroup(r)) {
      const subPath = getPathOfID(id, r);
      if (Array.isArray(subPath)) {
        return [Number.parseInt(i), ...subPath];
      }
    }
  }

  return null;
};

/**
 * Truncates the last element of an array and returns the result as a new array.
 */
export const getParentPath = (path: Path): Path => path.slice(0, -1);

/**
 * Determines if two paths (each `Path`) are equivalent.
 */
export const pathsAreEqual = (path1: Path, path2: Path): boolean => {
  if (path1.length !== path2.length) return false;
  for (let i = 0; i < path1.length; i++) {
    if (path1[i] !== path2[i]) return false;
  }
  return true;
};

/**
 * Determines if the first path is an ancestor of the second path. The first path must
 * be shorter and exactly match the second path up through the length of the first path.
 */
export const isAncestor = (maybeAncestor: Path, path: Path): boolean => {
  if (maybeAncestor.length >= path.length) return false;
  for (let i = 0; i < maybeAncestor.length; i++) {
    if (maybeAncestor[i] !== path[i]) return false;
  }
  return true;
};

/**
 * Finds the deepest/longest path that two paths have in common.
 */
export const getCommonAncestorPath = (path1: Path, path2: Path): Path => {
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
export const pathIsDisabled = (path: Path, query: RuleGroupTypeAny): boolean => {
  let disabled = !!query.disabled;
  let target: RuleType | RuleGroupTypeAny = query;
  let level = 0;
  while (level < path.length && !disabled && isRuleGroup(target)) {
    const t: RuleGroupTypeAny | RuleType | string = target.rules[path[level]];
    if (isPojo(t) && (isRuleGroup(t) || ('field' in t && !!t.field))) {
      disabled = !!t.disabled;
      target = t;
    }
    level++;
  }
  return disabled;
};

/**
 * Determines if the rule or group at the specified path is disabled by `disabledPaths`—the array
 * form of the `QueryBuilder` `disabled` prop, which disables nodes by position rather than by a
 * `disabled` property on the node itself. A path is disabled if it appears in `disabledPaths` or
 * descends from a path that does.
 *
 * @group Paths
 */
export const pathIsDisabledByPaths = (path: Path, disabledPaths: Path[] = []): boolean =>
  disabledPaths.some(p => pathsAreEqual(p, path) || isAncestor(p, path));

/** The path of a child rule or group, and whether it is disabled. */ export interface PathInfo {
  path: Path;
  disabled: boolean;
}

/**
 * Builds the {@link PathInfo} for each child of a group at `path`. A child is disabled if its
 * parent is disabled or if its own path appears in `disabledPaths`.
 *
 * @group Paths
 */
export const derivePathInfo = (
  path: Path,
  childCount: number,
  { disabled = false, disabledPaths = [] }: { disabled?: boolean; disabledPaths?: Path[] } = {}
): PathInfo[] => {
  const paths: PathInfo[] = [];
  for (let i = 0; i < childCount; i++) {
    const thisPath = [...path, i];
    paths[i] = {
      path: thisPath,
      disabled: disabled || disabledPaths.some(p => pathsAreEqual(thisPath, p)),
    };
  }
  return paths;
};
