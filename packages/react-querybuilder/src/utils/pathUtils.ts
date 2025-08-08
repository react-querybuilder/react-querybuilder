import type {
  Path,
  RuleGroupTypeAny,
  RulesEngineAction,
  RulesEngineAny,
  RuleType,
} from '../types/index.noReact';
import { isRuleGroup } from './isRuleGroup';
import { isRulesEngineAny } from './isRulesEngine';
import { isPojo } from './misc';

/**
 * Return type for {@link findPath}.
 */
export type FindPathReturnType = RuleGroupTypeAny | RuleType | null;

/**
 * Return type for {@link findConditionPath}.
 */
export type FindConditionPathReturnType =
  | RulesEngineAny
  | RuleGroupTypeAny
  | RulesEngineAction
  | null;

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
 * Returns the {@link RuleGroupType}/{@link RuleGroupTypeIC}
 * at the given path within a rules engine.
 */
export const findConditionPath = (
  path: Path,
  rulesEngine: RulesEngineAny
): FindConditionPathReturnType => {
  let target: FindConditionPathReturnType = rulesEngine;
  let level = 0;
  while (level < path.length && isRulesEngineAny(target)) {
    target = target.conditions[path[level]];
    level++;
  }

  return level < path.length ? null : (target ?? null);
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
 * Returns the {@link RuleGroupType}/{@link RuleGroupTypeIC}
 * with the given `id` within a rules engine.
 */
export const findConditionID = (
  id: string,
  rulesEngine: RulesEngineAny
): RuleGroupTypeAny | RulesEngineAny | RulesEngineAction | null => {
  if (rulesEngine.id === id) {
    return rulesEngine;
  }

  for (const condition of rulesEngine.conditions) {
    if (condition.id === id) {
      return condition;
    } else if (isRulesEngineAny(condition)) {
      return findConditionID(id, condition);
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
 * Returns the {@link Path} of the {@link RuleGroupType}/{@link RuleGroupTypeIC}
 * with the given `id` within a rules engine.
 */
export const getConditionPathOfID = (id: string, re: RulesEngineAny): Path | null => {
  if (re.id === id) return [];

  const idx = re.conditions.findIndex(c => !(typeof c === 'string') && c.id === id);

  if (idx >= 0) {
    return [idx];
  }

  for (const [i, c] of Object.entries(re.conditions)) {
    if (isRulesEngineAny(c)) {
      const subPath = getConditionPathOfID(id, c);
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
export const pathsAreEqual = (path1: Path, path2: Path): boolean =>
  path1.length === path2.length && path1.every((val, idx) => val === path2[idx]);

/**
 * Determines if the first path is an ancestor of the second path. The first path must
 * be shorter and exactly match the second path up through the length of the first path.
 */
export const isAncestor = (maybeAncestor: Path, path: Path): boolean =>
  maybeAncestor.length < path.length &&
  new RegExp(`^${maybeAncestor.join('-')}`).test(path.join('-'));

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
