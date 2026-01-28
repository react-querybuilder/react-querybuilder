import type { Path } from '@react-querybuilder/core';
import {
  generateID,
  getCommonAncestorPath,
  getParentPath,
  pathsAreEqual,
} from '@react-querybuilder/core';
import { current, isDraft, produce } from 'immer';
import type { RECondition, REConditionAny, RulesEngineAny } from '../types';
import { isRulesEngineAny, isRulesEngineConditionAny } from './isRulesEngine';
import { findConditionPath, getConditionPathOfID } from './pathUtils';
import { prepareRulesEngineCondition } from './prepareRulesEngine';
import { regenerateREIDs } from './regenerateREIDs';

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

export interface AddMethodRE {
  <RE extends RulesEngineAny>(
    /** The rules engine to update. */
    rulesEngine: RE,
    /** The rules engine condition to add. */
    subject: REConditionAny,
    /** Path or ID of the rules engine condition to add to. */
    parentConditionPathOrID: Path | string,
    /** Options. */
    options?: AddOptionsRE
  ): RE;
}

/**
 * Adds a rule or group to a query without mutating the original rules engine.
 *
 * @returns A new rules engine with the rule or group added.
 *
 * @group Rules Engine Tools
 */
export const addRE: AddMethodRE = (
  rulesEngine,
  subject,
  parentConditionPathOrID,
  options = {}
): typeof rulesEngine =>
  produce(
    rulesEngine,
    re => addREInPlace(re, subject, parentConditionPathOrID, options) as typeof re
  );

/**
 * Adds a rule or group to a query by mutating the rules engine.
 *
 * @returns The rules engine (mutated) with the rule or group added.
 *
 * @group Rules Engine Tools
 */
export const addREInPlace: AddMethodRE = (
  rulesEngine,
  subject,
  parentConditionPathOrID,
  options = {}
): typeof rulesEngine => {
  const { idGenerator = generateID } = options;
  const parentConditionPath = Array.isArray(parentConditionPathOrID)
    ? parentConditionPathOrID
    : getConditionPathOfID(parentConditionPathOrID, rulesEngine);

  if (!parentConditionPath) return rulesEngine;

  const parentRECondition = findConditionPath(parentConditionPath, rulesEngine);

  if (!parentRECondition) return rulesEngine;

  if (isRulesEngineConditionAny(subject)) {
    if (Array.isArray(parentRECondition.conditions)) {
      (parentRECondition.conditions as unknown[]).push(
        prepareRulesEngineCondition(subject, { idGenerator })
      );
    } else {
      parentRECondition.conditions = [prepareRulesEngineCondition(subject, { idGenerator })] as any; // oxlint-disable-line no-explicit-any
    }
  }

  return rulesEngine;
};

/**
 * Options for {@link updateRE}.
 *
 * @group Rules Engine Tools
 */
export interface UpdateOptionsRE {}

export interface UpdateMethodRE {
  <RE extends RulesEngineAny>(
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
    options?: UpdateOptionsRE
  ): RE;
}

/**
 * Updates a property of a rule or group within a query without mutating the original rules engine.
 *
 * @returns A new rules engine with the rule or group property updated.
 *
 * @group Rules Engine Tools
 */
export const updateRE: UpdateMethodRE = (
  rulesEngine,
  property,
  value,
  conditionPathOrID,
  options = {}
): typeof rulesEngine =>
  produce(
    rulesEngine,
    re => updateREInPlace(re, property, value, conditionPathOrID, options) as typeof re
  );

/**
 * Updates a property of a rule or group within a query by mutating the rules engine.
 *
 * @returns The rules engine (mutated) with the rule or group property updated.
 *
 * @group Rules Engine Tools
 */
export const updateREInPlace: UpdateMethodRE = (
  rulesEngine,
  property,
  value,
  conditionPathOrID,
  _options = {}
): typeof rulesEngine => {
  const conditionPath = Array.isArray(conditionPathOrID)
    ? conditionPathOrID
    : getConditionPathOfID(conditionPathOrID, rulesEngine);

  if (!conditionPath) return rulesEngine;

  const condition = findConditionPath(conditionPath, rulesEngine);

  if (!isRulesEngineAny(condition) && !isRulesEngineConditionAny(condition)) return rulesEngine;

  // oxlint-disable-next-line no-explicit-any
  (condition as any)[property] = value;

  return rulesEngine;
};

export interface RemoveMethodRE {
  <RE extends RulesEngineAny>(
    /** The rules engine to update. */
    rulesEngine: RE,
    /** Path or ID of the rules engine condition to remove. */
    conditionPathOrID: Path | string
  ): RE;
}

/**
 * Removes a rule engine condition from a rules engine without mutating the original rules engine.
 *
 * @returns A new rules engine with the condition removed.
 *
 * @group Rules Engine Tools
 */
export const removeRE: RemoveMethodRE = (rulesEngine, conditionPathOrID): typeof rulesEngine =>
  produce(rulesEngine, re => removeREInPlace(re, conditionPathOrID) as typeof re);

/**
 * Removes a rule engine condition from a rules engine by mutating the rules engine.
 *
 * @returns The rules engine (mutated) with the condition removed.
 *
 * @group Rules Engine Tools
 */
export const removeREInPlace: RemoveMethodRE = (
  rulesEngine,
  conditionPathOrID
): typeof rulesEngine => {
  const rePath = Array.isArray(conditionPathOrID)
    ? conditionPathOrID
    : getConditionPathOfID(conditionPathOrID, rulesEngine);

  // Ignore invalid paths/ids or root removal
  if (!rePath || rePath.length === 0) return rulesEngine;

  const parentRE = findConditionPath(getParentPath(rePath), rulesEngine);
  if (isRulesEngineAny(parentRE)) {
    parentRE.conditions.splice(rePath.at(-1)!, 1);
  }

  return rulesEngine;
};

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

export interface MoveMethodRE {
  <RE extends RulesEngineAny>(
    /** The rules engine to update. */
    rulesEngine: RE,
    /** Path or ID of the condition to move, or the condition itself if moving within a nested group. */
    oldConditionPathOrID: Path | string,
    /** Path to move the condition to, ID of the condition to replace/insert before, or shift direction. */
    newConditionPathOrIdOrShiftDir: Path | 'up' | 'down' | (string & {}),
    /** Options. */
    options?: MoveOptionsRE
  ): RE;
}

/**
 * Moves a rule engine condition from one path to another without mutating the original rules engine.
 * In the options parameter, pass `{ clone: true }` to copy instead of move.
 *
 * @returns A new rules engine with the condition moved or cloned.
 *
 * @group Rules Engine Tools
 */
export const moveRE: MoveMethodRE = (
  rulesEngine,
  oldConditionPathOrID,
  newConditionPathOrIdOrShiftDir,
  options = {}
): typeof rulesEngine =>
  produce(
    rulesEngine,
    re =>
      moveREInPlace(re, oldConditionPathOrID, newConditionPathOrIdOrShiftDir, options) as typeof re
  );

/**
 * Moves a rule engine condition from one path to another by mutating the rules engine.
 * In the options parameter, pass `{ clone: true }` to copy instead of move.
 *
 * @returns The rules engine (mutated) with the condition moved or cloned.
 *
 * @group Rules Engine Tools
 */
export const moveREInPlace: MoveMethodRE = (
  rulesEngine,
  oldConditionPathOrID,
  newConditionPathOrIdOrShiftDir,
  options = {}
): typeof rulesEngine => {
  const { clone = false, idGenerator = generateID } = options;
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
    ? regenerateREIDs(
        isDraft(conditionToMoveOriginal)
          ? current(conditionToMoveOriginal)
          : conditionToMoveOriginal,
        { idGenerator }
      )
    : conditionToMoveOriginal;

  const parentOfConditionToRemove = findConditionPath(
    getParentPath(oldConditionPath),
    rulesEngine
  ) as typeof rulesEngine;
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
  const parentToInsertInto = findConditionPath(newNewParentPath, rulesEngine) as typeof rulesEngine;
  const newIndex = newNewPath.at(-1)!;

  // oxlint-disable-next-line no-explicit-any
  parentToInsertInto.conditions.splice(newIndex, 0, conditionToMove as any);

  return rulesEngine;
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

export interface InsertMethodRE {
  <RE extends RulesEngineAny>(
    /** The rules engine to update. */
    rulesEngine: RE,
    /** The rules engine, consequent, rule, or rule group to insert. */
    subject: REConditionAny,
    /** Path at which to insert the condition. */
    conditionPath: Path,
    /** Options. */
    options?: InsertOptionsRE
  ): RE;
}

/**
 * Inserts a rule engine condition into a rules engine without mutating the original rules engine.
 *
 * @returns A new rules engine with the condition inserted.
 *
 * @group Rules Engine Tools
 */
export const insertRE: InsertMethodRE = (
  rulesEngine,
  subject,
  conditionPath,
  options = {}
): typeof rulesEngine =>
  produce(rulesEngine, re => insertREInPlace(re, subject, conditionPath, options) as typeof re);

/**
 * Inserts a rule engine condition into a rules engine by mutating the rules engine.
 *
 * @returns The rules engine (mutated) with the condition inserted.
 *
 * @group Rules Engine Tools
 */
export const insertREInPlace: InsertMethodRE = (
  rulesEngine,
  subject,
  conditionPath,
  options = {}
): typeof rulesEngine => {
  const { replace, idGenerator = generateID } = options;
  // If only the root path is provided, insert at first position
  if (conditionPath.length === 0) conditionPath = [0];

  const parent = findConditionPath(getParentPath(conditionPath), rulesEngine);

  // Bail on invalid path
  if (!parent) return rulesEngine;

  if (isRulesEngineConditionAny(subject)) {
    const subjectPrepared = prepareRulesEngineCondition(subject, { idGenerator });

    if (!parent.conditions || !Array.isArray(parent.conditions) || parent.conditions.length === 0) {
      parent.conditions = [subjectPrepared as RECondition];
    } else {
      // Normal insertion/replacement
      const newIndex = conditionPath.at(-1)!;
      (parent.conditions as unknown[]).splice(newIndex, replace ? 1 : 0, subjectPrepared);
    }
  }

  return rulesEngine;
};
