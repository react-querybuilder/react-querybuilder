import type { Path } from '@react-querybuilder/core';
import {
  generateID,
  getCommonAncestorPath,
  getParentPath,
  pathsAreEqual,
} from '@react-querybuilder/core';
import { produce } from 'immer';
import type { RECondition, REConditionAny, RulesEngineAny } from '../types';
import { isRulesEngineAny, isRulesEngineConditionAny } from './isRulesEngine';
import { findConditionPath, getConditionPathOfID } from './pathUtils';
import { prepareRulesEngineCondition } from './prepareRulesEngine';
import { regenerateREIDs } from './regenerateREIDs';

const push = (a: unknown[], ...items: unknown[]) => a.push(...items);
const splice = (a: unknown[], start: number, deleteCount: number, ...items: unknown[]) =>
  a.splice(start, deleteCount, ...items);

/**
 * Options for {@link addRE}.
 *
 * @group Rules Engine Tools
 */
export interface AddOptionsRE {
  /**
   * ID generator.
   *
   * @default generateID
   */
  idGenerator?: () => string;
}
/**
 * Adds a rule or group to a query.
 * @returns The new query with the rule or group added.
 *
 * @group Rules Engine Tools
 */
export const addRE = <RE extends RulesEngineAny>(
  /** The rules engine to update. */
  rulesEngine: RE,
  /** The rules engine condition to add. */
  subject: REConditionAny,
  /** Path or ID of the rules engine condition to add to. */
  parentConditionPathOrID: Path | string,
  /** Options. */
  { idGenerator = generateID }: AddOptionsRE = {}
): RE =>
  produce(rulesEngine, draft => {
    const parentConditionPath = Array.isArray(parentConditionPathOrID)
      ? parentConditionPathOrID
      : getConditionPathOfID(parentConditionPathOrID, draft);

    if (!parentConditionPath) return;

    const parentRECondition = findConditionPath(parentConditionPath, draft);

    if (!parentRECondition) return;

    if (isRulesEngineConditionAny(subject)) {
      if (Array.isArray(parentRECondition.conditions)) {
        push(parentRECondition.conditions, prepareRulesEngineCondition(subject, { idGenerator }));
      } else {
        parentRECondition.conditions = [
          prepareRulesEngineCondition(subject, { idGenerator }),
        ] as any; // oxlint-disable-line no-explicit-any
      }
    }
  });

/**
 * Options for {@link updateRE}.
 *
 * @group Rules Engine Tools
 */
export interface UpdateOptionsRE {}
/**
 * Updates a property of a rule or group within a query.
 * @returns The new query with the rule or group property updated.
 *
 * @group Rules Engine Tools
 */
export const updateRE = <RE extends RulesEngineAny>(
  /** The query to update. */
  rulesEngine: RE,
  /** The name of the property to update. */
  property: string,
  /** The new value of the property. */
  // oxlint-disable-next-line typescript/no-explicit-any
  value: any,
  /** Path or ID of the rules engine condition to update. */
  conditionPathOrID: Path | string,
  /** Options. */
  _updateOptions: UpdateOptionsRE = {}
): RE =>
  produce(rulesEngine, draft => {
    const conditionPath = Array.isArray(conditionPathOrID)
      ? conditionPathOrID
      : getConditionPathOfID(conditionPathOrID, draft);

    if (!conditionPath) return;

    const condition = findConditionPath(conditionPath, draft);

    if (!isRulesEngineAny(condition) && !isRulesEngineConditionAny(condition)) return;

    // oxlint-disable-next-line no-explicit-any
    (condition as any)[property] = value;
  });

/**
 * Removes a rule engine condition from a rules engine.
 * @returns The new rules engine with the condition removed.
 *
 * @group Rules Engine Tools
 */
export const removeRE = <RE extends RulesEngineAny>(
  /** The rules engine to update. */
  rulesEngine: RE,
  /** Path or ID of the rules engine condition to remove. */
  conditionPathOrID: Path | string
): RE =>
  produce(rulesEngine, draft => {
    const rePath = Array.isArray(conditionPathOrID)
      ? conditionPathOrID
      : getConditionPathOfID(conditionPathOrID, draft);

    // Ignore invalid paths/ids or root removal
    if (!rePath || rePath.length === 0) return;

    const parentRE = findConditionPath(getParentPath(rePath), draft);
    if (isRulesEngineAny(parentRE)) {
      parentRE.conditions.splice(rePath.at(-1)!, 1);
    }
  });

const getNextPathRE = (
  rulesEngine: RulesEngineAny,
  currentPath: Path,
  newPathOrShiftDirection: Path | 'up' | 'down' | (string & {})
): Path => {
  if (Array.isArray(newPathOrShiftDirection)) {
    return newPathOrShiftDirection;
  }

  // TODO?: Allow moves to parent level?
  // Up/down moves in RE don't allow moves outside the current condition, e.g. 'up' from
  // [0,0] won't move to [0], and 'down' from [0,2] (if 2 is last) won't move to [1]
  if (newPathOrShiftDirection === 'up') {
    if (currentPath.at(-1) === 0) {
      return currentPath;
    }
    // Otherwise, just move up one position
    return [...getParentPath(currentPath), currentPath.at(-1)! - 1];
  } else {
    // istanbul ignore else
    if (newPathOrShiftDirection === 'down') {
      const parent = findConditionPath(getParentPath(currentPath), rulesEngine);
      if (!parent || !Array.isArray(parent.conditions)) {
        return currentPath;
      }
      // Can't move down if already at the end
      if (currentPath.at(-1) === parent.conditions.length - 1) {
        return currentPath;
      }
      // Otherwise, just move down one position
      return [...getParentPath(currentPath), currentPath.at(-1)! + 1];
    }
  }

  // istanbul ignore next
  return currentPath;
};

/**
 * Options for {@link moveRE}.
 *
 * @group Rules Engine Tools
 */
export interface MoveOptionsRE extends AddOptionsRE {
  /**
   * When `true`, the source rule/group will not be removed from its original path.
   */
  clone?: boolean;
}
/**
 * Moves a rule engine condition from one path to another. In the options parameter, pass
 * `{ clone: true }` to copy instead of move.
 * @returns The new rules engine with the condition moved or cloned.
 *
 * @group Rules Engine Tools
 */
export const moveRE = <RE extends RulesEngineAny>(
  /** The rules engine to update. */
  rulesEngine: RE,
  /** Path or ID of the condition to move, or the condition itself if moving within a nested group. */
  oldConditionPathOrID: Path | string,
  /** Path to move the condition to, ID of the condition to replace/insert before, or shift direction. */
  newConditionPathOrIdOrShiftDir: Path | 'up' | 'down' | (string & {}),
  /** Options. */
  { clone = false, idGenerator = generateID }: MoveOptionsRE = {}
): RE => {
  const oldConditionPath = Array.isArray(oldConditionPathOrID)
    ? oldConditionPathOrID
    : getConditionPathOfID(oldConditionPathOrID, rulesEngine);

  if (!oldConditionPath) return rulesEngine;

  const nextConditionPath =
    Array.isArray(newConditionPathOrIdOrShiftDir) ||
    newConditionPathOrIdOrShiftDir === 'up' ||
    newConditionPathOrIdOrShiftDir === 'down'
      ? getNextPathRE(rulesEngine, oldConditionPath, newConditionPathOrIdOrShiftDir)
      : getConditionPathOfID(newConditionPathOrIdOrShiftDir, rulesEngine);

  // Don't move to the same location or a path that doesn't exist yet
  if (
    !nextConditionPath ||
    oldConditionPath.length === 0 ||
    pathsAreEqual(oldConditionPath, nextConditionPath) ||
    !findConditionPath(getParentPath(nextConditionPath), rulesEngine)
  ) {
    return rulesEngine;
  }

  const conditionToMoveOriginal = findConditionPath(oldConditionPath, rulesEngine);
  if (!conditionToMoveOriginal) {
    return rulesEngine;
  }
  const conditionToMove = clone
    ? regenerateREIDs(conditionToMoveOriginal, { idGenerator })
    : conditionToMoveOriginal;

  return produce(rulesEngine, draft => {
    const parentOfConditionToRemove = findConditionPath(
      getParentPath(oldConditionPath),
      draft
    ) as RE;
    const conditionToRemoveIndex = oldConditionPath.at(-1)!;

    // Remove the source item if not cloning
    if (!clone) {
      parentOfConditionToRemove.conditions.splice(conditionToRemoveIndex, 1);
    }

    const newNewPath = [...nextConditionPath];
    const commonAncestorPath = getCommonAncestorPath(oldConditionPath, nextConditionPath);
    const isDirectionalMove =
      newConditionPathOrIdOrShiftDir === 'up' || newConditionPathOrIdOrShiftDir === 'down';
    // Only adjust paths for explicit path moves, not directional moves
    // Also, don't adjust for simple adjacent swaps (would cause wrong behavior)
    const isAdjacentSwap =
      Math.abs(
        nextConditionPath[commonAncestorPath.length] - oldConditionPath[commonAncestorPath.length]
      ) === 1;

    if (
      !clone &&
      !isDirectionalMove &&
      !isAdjacentSwap &&
      oldConditionPath.length === commonAncestorPath.length + 1 &&
      nextConditionPath[commonAncestorPath.length] > oldConditionPath[commonAncestorPath.length]
    ) {
      // Getting here means there will be a shift of paths upward at the common
      // ancestor level because the object at `oldConditionPath` will be spliced out. The
      // real new path should therefore be one higher than `nextConditionPath`.
      newNewPath[commonAncestorPath.length] -= 1;
    }

    const newNewParentPath = getParentPath(newNewPath);
    const parentToInsertInto = findConditionPath(newNewParentPath, draft) as RE;
    const newIndex = newNewPath.at(-1)!;

    // oxlint-disable-next-line no-explicit-any
    parentToInsertInto.conditions.splice(newIndex, 0, conditionToMove as any);
  });
};

/**
 * Options for {@link insertRE}.
 *
 * @group Rules Engine Tools
 */
export interface InsertOptionsRE extends AddOptionsRE {
  /**
   * When `true`, the new rule/group will replace the rule/group at `path`.
   */
  replace?: boolean;
}
/**
 * Inserts a rule engine condition into a rules engine.
 * @returns The new rules engine with the condition inserted.
 *
 * @group Rules Engine Tools
 */
export const insertRE = <RE extends RulesEngineAny>(
  /** The rules engine to update. */
  rulesEngine: RE,
  /** The rules engine, consequent, rule, or rule group to insert. */
  subject: REConditionAny,
  /** Path at which to insert the condition. */
  conditionPath: Path,
  /** Options. */
  { replace, idGenerator = generateID }: InsertOptionsRE = {}
): RE =>
  produce(rulesEngine, draft => {
    // If only the root path is provided, insert at first position
    if (conditionPath.length === 0) conditionPath = [0];

    const parent = findConditionPath(getParentPath(conditionPath), draft);

    // Bail on invalid path
    if (!parent) return;

    if (isRulesEngineConditionAny(subject)) {
      const subjectPrepared = prepareRulesEngineCondition(subject, { idGenerator });

      if (
        !parent.conditions ||
        !Array.isArray(parent.conditions) ||
        parent.conditions.length === 0
      ) {
        parent.conditions = [subjectPrepared as RECondition];
      } else {
        // Normal insertion/replacement
        const newIndex = conditionPath.at(-1)!;
        splice(parent.conditions, newIndex, replace ? 1 : 0, subjectPrepared);
      }
    }
  });
