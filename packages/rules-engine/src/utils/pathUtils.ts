import type { Path, RuleGroupTypeAny } from 'react-querybuilder';
import { isPojo } from 'react-querybuilder';
import type { RulesEngineAction, RulesEngineAny } from '../types';
import { isRulesEngineAny } from './isRulesEngine';

/**
 * Return type for {@link findConditionPath}.
 */
export type FindConditionPathReturnType =
  | RulesEngineAny
  | RuleGroupTypeAny
  | RulesEngineAction
  | null;

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
 * Returns the {@link Path} of the {@link RuleGroupType}/{@link RuleGroupTypeIC}
 * with the given `id` within a rules engine.
 */
export const getConditionPathOfID = (id: string, re: RulesEngineAny): Path | null => {
  if (re.id === id) return [];

  const idx = re.conditions.findIndex(c => isPojo(c) && c.id === id);

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
 * Returns the parent path of a given path.
 */
export const getParentPath = (path: Path): Path => path.slice(0, -1);

/**
 * Determines if two paths are equal.
 */
export const pathsAreEqual = (path1: Path, path2: Path): boolean => {
  if (path1.length !== path2.length) return false;
  return path1.every((segment, i) => segment === path2[i]);
};
