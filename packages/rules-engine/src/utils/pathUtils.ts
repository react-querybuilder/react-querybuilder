import type { Path, RuleGroupTypeAny, RuleGroupTypeIC } from '@react-querybuilder/core';
import { isPojo } from '@react-querybuilder/core';
import type { Antecedent, AntecedentAny, AntecedentIC, RulesEngineAny } from '../types';
import { isRulesEngineAny } from './isRulesEngine';

/**
 * Return type for {@link findConditionPath}.
 */
export type FindConditionPath<RG extends RuleGroupTypeAny = RuleGroupTypeAny> =
  | RulesEngineAny
  | (RG extends RuleGroupTypeIC ? AntecedentIC : Antecedent)
  | null;

/**
 * Returns the {@link RuleGroupType}/{@link RuleGroupTypeIC}
 * at the given path within a rules engine.
 */
// export function findConditionPath(
//   path: Path,
//   rulesEngine: RulesEngine
// ): FindConditionPath<RuleGroupType>;
// export function findConditionPath(
//   path: Path,
//   rulesEngine: RulesEngineIC
// ): FindConditionPath<RuleGroupTypeIC>;
export function findConditionPath(path: Path, rulesEngine: RulesEngineAny): FindConditionPath {
  let target = rulesEngine as unknown as FindConditionPath;
  let level = 0;
  while (level < path.length && isRulesEngineAny(target)) {
    target = target.conditions[path[level]];
    level++;
  }

  return level < path.length ? null : (target ?? null);
}

/**
 * Returns the {@link RuleGroupType}/{@link RuleGroupTypeIC}
 * with the given `id` within a rules engine.
 */
export const findConditionID = (
  id: string,
  rulesEngine: RulesEngineAny
): AntecedentAny | RulesEngineAny | null => {
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
