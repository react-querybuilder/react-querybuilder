import type {
  AddOptions,
  GroupOptions,
  InsertOptions,
  MoveOptions,
  Path,
  RuleGroupTypeAny,
  RuleType,
  UpdateOptions,
} from '@react-querybuilder/core';
import {
  add,
  getCommonAncestorPath,
  getParentPath,
  group,
  insert,
  isRuleGroup,
  isRuleType,
  move,
  pathsAreEqual,
  remove,
  update,
} from '@react-querybuilder/core';
import { produce } from 'immer';
import type { RulesEngineAction, RulesEngineAny } from '../types';
import { isRulesEngineAction, isRulesEngineAny } from './isRulesEngine';
import { findConditionPath, getConditionPathOfID } from './pathUtils';

const push = (a: unknown[], ...items: unknown[]) => a.push(...items);
const splice = (a: unknown[], start: number, deleteCount: number, ...items: unknown[]) =>
  a.splice(start, deleteCount, ...items);

const coerceToRulesEngine = (re: unknown): re is RulesEngineAny => {
  if (!re || typeof re !== 'object') return false;
  if (!isRulesEngineAny(re)) (re as RulesEngineAny).conditions = [];
  return isRulesEngineAny(re);
};

/**
 * Options for {@link add}.
 *
 * @group Rules Engine Tools
 */
export interface AddOptionsRE extends AddOptions {}
/**
 * Adds a rule or group to a query.
 * @returns The new query with the rule or group added.
 *
 * @group Rules Engine Tools
 */
export const addRE = <RE extends RulesEngineAny>(
  /** The rules engine to update. */
  rulesEngine: RE,
  /** The rules engine, action, rule, or rule group to add. */
  subject: RE | RulesEngineAction | RuleGroupTypeAny | RuleType,
  /** Path or ID of the rules engine condition to add to. */
  conditionPathOrID: Path | string,
  /** Path or ID of the group to add to (within the rules engine at `conditionPathOrID`), if adding a rule or group. */
  parentGroupPathOrID?: Path | string | null,
  /** Options. */
  addOptions: AddOptionsRE = {}
): RE =>
  produce(rulesEngine, draft => {
    const rePath = Array.isArray(conditionPathOrID)
      ? conditionPathOrID
      : getConditionPathOfID(conditionPathOrID, draft);

    if (!rePath) return;

    const parentRE = findConditionPath(rePath, draft);

    if (!isRulesEngineAny(parentRE) && !isRuleGroup(parentRE)) return;

    if (
      parentGroupPathOrID &&
      isRuleGroup(parentRE) &&
      // Only add rules or groups to a `rules` array.
      (isRuleGroup(subject) || isRuleType(subject))
    ) {
      const newGroup = add(parentRE, subject, parentGroupPathOrID, addOptions);
      const parentREofGroup = findConditionPath(getParentPath(rePath), draft);
      // istanbul ignore next
      if (!coerceToRulesEngine(parentREofGroup)) return;
      splice(parentREofGroup.conditions, rePath.at(-1)!, 1, newGroup);
    } else if (isRulesEngineAny(subject) || isRulesEngineAction(subject) || isRuleGroup(subject)) {
      // Force the parent rules engine to have a `conditions` array.
      // The return will never fire; it's only for type safety and hence ignored for coverage.
      // istanbul ignore next
      if (!coerceToRulesEngine(parentRE)) return;

      // Check if the last condition is an action, i.e. an "else" block
      if (isRulesEngineAction(parentRE.conditions.at(-1))) {
        // Can't have two "else" blocks
        if (isRulesEngineAction(subject)) return;

        splice(parentRE.conditions, parentRE.conditions.length - 1, 0, subject);
      } else {
        push(parentRE.conditions, subject);
      }
    }
  });

/**
 * Options for {@link updateRE}.
 *
 * @group Rules Engine Tools
 */
export interface UpdateOptionsRE extends UpdateOptions {}
/**
 * Updates a property of a rule or group within a query.
 * @returns The new query with the rule or group property updated.
 *
 * @group Query Tools
 */
export const updateRE = <RE extends RulesEngineAny>(
  /** The query to update. */
  rulesEngine: RE,
  /** The name of the property to update. */
  prop: string,
  /** The new value of the property. */
  // oxlint-disable-next-line typescript/no-explicit-any
  value: any,
  /** Path or ID of the rules engine condition to update. */
  conditionPathOrID: Path | string,
  /** Path or ID of the group to update (within the rules engine at `conditionPathOrID`), if updating a rule or group. */
  parentGroupPathOrID?: Path | string | null,
  /** Options. */
  updateOptions: UpdateOptionsRE = {}
): RE =>
  produce(rulesEngine, draft => {
    const rePath = Array.isArray(conditionPathOrID)
      ? conditionPathOrID
      : getConditionPathOfID(conditionPathOrID, draft);

    if (!rePath) return;

    const parentRE = findConditionPath(rePath, draft);

    if (!isRulesEngineAny(parentRE) && !isRuleGroup(parentRE)) return;

    if (parentGroupPathOrID && isRuleGroup(parentRE)) {
      const newGroup = update(parentRE, prop, value, parentGroupPathOrID, updateOptions);
      const parentREofGroup = findConditionPath(getParentPath(rePath), draft);
      // istanbul ignore next
      if (!coerceToRulesEngine(parentREofGroup)) return;
      splice(parentREofGroup.conditions, rePath.at(-1)!, 1, newGroup);
    } else {
      // @ts-expect-error `prop` can be any string
      parentRE[prop] = value;
    }
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
  conditionPathOrID: Path | string,
  /** Path or ID of the rule or group to remove (within the rules engine at `conditionPathOrID`), if removing a rule or group. */
  parentGroupPathOrID?: Path | string | null
): RE =>
  produce(rulesEngine, draft => {
    // Delegate to underlying queryTools remove for rule/group removal within a condition
    const rePath = Array.isArray(conditionPathOrID)
      ? conditionPathOrID
      : getConditionPathOfID(conditionPathOrID, draft);

    // Ignore invalid paths/ids or root removal
    if (!rePath || rePath.length === 0) return;

    const parentRE = findConditionPath(rePath, draft);

    if (parentGroupPathOrID && isRuleGroup(parentRE)) {
      const newGroup = remove(parentRE, parentGroupPathOrID);
      const parentREofGroup = findConditionPath(getParentPath(rePath), draft);
      if (!isRulesEngineAny(parentREofGroup)) return;
      splice(parentREofGroup.conditions, rePath.at(-1)!, 1, newGroup);
    } else {
      const parentREofRemovalTarget = findConditionPath(getParentPath(rePath), draft);
      if (isRulesEngineAny(parentREofRemovalTarget)) {
        parentREofRemovalTarget.conditions.splice(rePath.at(-1)!, 1);
      }
    }
  });

/**
 * Options for {@link moveRE}.
 *
 * @group Rules Engine Tools
 */
export interface MoveOptionsRE extends MoveOptions {}
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
  /** Path to move the condition to, or shift direction, or the condition path if moving within a nested group. */
  newConditionPathOrShiftDirection: Path | 'up' | 'down',
  /** Path or ID of the rule or group within the old condition, if moving a rule or group. */
  oldParentGroupPathOrID?: Path | string | null,
  /** Path or ID of the rule or group within the new condition, if moving a rule or group. */
  newParentGroupPathOrID?: Path | 'up' | 'down' | null,
  /** Options. */
  moveOptions: MoveOptionsRE = {}
): RE => {
  if (oldParentGroupPathOrID && newParentGroupPathOrID) {
    // Delegate to underlying queryTools move for rule/group movement within conditions
    return produce(rulesEngine, draft => {
      const oldRePath = Array.isArray(oldConditionPathOrID)
        ? oldConditionPathOrID
        : getConditionPathOfID(oldConditionPathOrID, draft);
      const newRePath = Array.isArray(newConditionPathOrShiftDirection)
        ? newConditionPathOrShiftDirection
        : typeof newConditionPathOrShiftDirection === 'string' &&
            newConditionPathOrShiftDirection !== 'up' &&
            newConditionPathOrShiftDirection !== 'down'
          ? getConditionPathOfID(newConditionPathOrShiftDirection, draft)
          : oldRePath;

      if (!oldRePath || !newRePath) return;

      const oldParentRE = findConditionPath(oldRePath, draft);
      const newParentRE = findConditionPath(newRePath, draft);

      if (!isRuleGroup(oldParentRE) || !isRuleGroup(newParentRE)) return;

      const updatedOldGroup = move(
        oldParentRE,
        oldParentGroupPathOrID,
        newParentGroupPathOrID,
        moveOptions
      );

      if (pathsAreEqual(oldRePath, newRePath)) {
        // Moving within the same condition
        const parentREofGroup = findConditionPath(getParentPath(oldRePath), draft);
        // istanbul ignore next
        if (!coerceToRulesEngine(parentREofGroup)) return;
        splice(parentREofGroup.conditions, oldRePath.at(-1)!, 1, updatedOldGroup);
      } else {
        // Moving between different conditions - not implemented for now
        return;
      }
    });
  }

  // Handle condition-level movement
  return produce(rulesEngine, draft => {
    const oldConditionPath = Array.isArray(oldConditionPathOrID)
      ? oldConditionPathOrID
      : getConditionPathOfID(oldConditionPathOrID, draft);

    if (!oldConditionPath || oldConditionPath.length === 0) return;

    let newConditionPath: Path;
    if (Array.isArray(newConditionPathOrShiftDirection)) {
      newConditionPath = newConditionPathOrShiftDirection;
    } else if (
      typeof newConditionPathOrShiftDirection === 'string' &&
      newConditionPathOrShiftDirection !== 'up' &&
      newConditionPathOrShiftDirection !== 'down'
    ) {
      const foundPath = getConditionPathOfID(newConditionPathOrShiftDirection, draft);
      if (!foundPath) return;
      newConditionPath = foundPath;
    } else {
      // Handle 'up'/'down' shift direction for conditions
      const direction = newConditionPathOrShiftDirection;
      const currentIndex = oldConditionPath.at(-1)!;
      const parent = findConditionPath(getParentPath(oldConditionPath), draft);
      // istanbul ignore next
      if (!coerceToRulesEngine(parent)) return;

      if (direction === 'up' && currentIndex > 0) {
        newConditionPath = [...getParentPath(oldConditionPath), currentIndex - 1];
      } else if (direction === 'down' && currentIndex < parent.conditions.length - 1) {
        newConditionPath = [...getParentPath(oldConditionPath), currentIndex + 1];
      } else {
        return; // Can't move in requested direction
      }
    }

    // Don't move to the same location or a path that doesn't exist yet
    if (
      pathsAreEqual(oldConditionPath, newConditionPath) ||
      !findConditionPath(getParentPath(newConditionPath), draft)
    ) {
      return;
    }

    const conditionToMoveOriginal = findConditionPath(oldConditionPath, draft);
    if (!conditionToMoveOriginal) return;

    // Validate action movement constraints
    const sourceParent = findConditionPath(getParentPath(oldConditionPath), draft);
    const targetParent = findConditionPath(getParentPath(newConditionPath), draft);
    if (
      coerceToRulesEngine(sourceParent) &&
      coerceToRulesEngine(targetParent) &&
      isRulesEngineAction(conditionToMoveOriginal)
    ) {
      const newIndex = newConditionPath.at(-1)!;
      // Actions can only be at the last position
      if (newIndex < targetParent.conditions.length - 1) return;
    }

    // Can't move rules engine below an action
    if (coerceToRulesEngine(targetParent) && !isRulesEngineAction(conditionToMoveOriginal)) {
      const newIndex = newConditionPath.at(-1)!;
      const hasTrailingAction = isRulesEngineAction(targetParent.conditions.at(-1));
      if (hasTrailingAction && newIndex >= targetParent.conditions.length - 1) return;
    }

    const conditionToMove = moveOptions.clone
      ? conditionToMoveOriginal // TODO: implement ID regeneration for cloning
      : conditionToMoveOriginal;

    const oldIndex = oldConditionPath.at(-1)!;
    const oldParent = findConditionPath(getParentPath(oldConditionPath), draft);
    // istanbul ignore next
    if (!coerceToRulesEngine(oldParent)) return;

    // Remove the source item if not cloning
    if (!moveOptions.clone) {
      oldParent.conditions.splice(oldIndex, 1);
    }

    const newNewConditionPath = [...newConditionPath];

    // Only apply complex path adjustment for explicit path moves, not directional moves
    if (
      !moveOptions.clone &&
      Array.isArray(newConditionPathOrShiftDirection) // Only for explicit paths like [2], not 'up'/'down'
    ) {
      const commonAncestorPath = getCommonAncestorPath(oldConditionPath, newConditionPath);
      if (
        oldConditionPath.length === commonAncestorPath.length + 1 &&
        newConditionPath[commonAncestorPath.length] > oldConditionPath[commonAncestorPath.length]
      ) {
        // Getting here means there will be a shift of paths upward at the common
        // ancestor level because the object at `oldConditionPath` will be spliced out. The
        // real new path should therefore be one higher than `newConditionPath`.
        newNewConditionPath[commonAncestorPath.length] -= 1;
      }
    }
    // For directional moves ('up'/'down'), the path is already correctly calculated
    const newNewParentPath = getParentPath(newNewConditionPath);
    const parentToInsertInto = findConditionPath(newNewParentPath, draft);
    // istanbul ignore next
    if (!coerceToRulesEngine(parentToInsertInto)) return;
    const newIndex = newNewConditionPath.at(-1)!;

    // Insert the source item at the target path
    // oxlint-disable-next-line no-explicit-any
    parentToInsertInto.conditions.splice(newIndex, 0, conditionToMove as any);
  });
};

/**
 * Options for {@link insertRE}.
 *
 * @group Rules Engine Tools
 */
export interface InsertOptionsRE extends InsertOptions {}
/**
 * Inserts a rule engine condition into a rules engine.
 * @returns The new rules engine with the condition inserted.
 *
 * @group Rules Engine Tools
 */
export const insertRE = <RE extends RulesEngineAny>(
  /** The rules engine to update. */
  rulesEngine: RE,
  /** The rules engine, action, rule, or rule group to insert. */
  subject: RE | RulesEngineAction | RuleGroupTypeAny | RuleType,
  /** Path at which to insert the condition. */
  conditionPath: Path,
  /** Path at which to insert the rule or group (within the condition at `conditionPath`), if inserting a rule or group. */
  parentGroupPath?: Path | null,
  /** Options. */
  insertOptions: InsertOptionsRE = {}
): RE => {
  if (parentGroupPath && (isRuleGroup(subject) || isRuleType(subject))) {
    // Delegate to underlying queryTools insert for rule/group insertion within a condition
    return produce(rulesEngine, draft => {
      const rePath = conditionPath;
      const parentRE = findConditionPath(rePath, draft);

      if (!isRuleGroup(parentRE)) return;

      const newGroup = insert(parentRE, subject, parentGroupPath, insertOptions);
      const parentREofGroup = findConditionPath(getParentPath(rePath), draft);
      // istanbul ignore next
      if (!coerceToRulesEngine(parentREofGroup)) return;
      splice(parentREofGroup.conditions, rePath.at(-1)!, 1, newGroup);
    });
  }

  return produce(rulesEngine, draft => {
    const parent = findConditionPath(getParentPath(conditionPath), draft);
    if (!parent) return;
    if (!coerceToRulesEngine(parent)) return;

    const newIndex = conditionPath.at(-1)!;

    if (isRulesEngineAny(subject) || isRulesEngineAction(subject) || isRuleGroup(subject)) {
      // Check if trying to insert an action when there's already a trailing action
      if (isRulesEngineAction(subject) && isRulesEngineAction(parent.conditions.at(-1))) {
        return; // Can't have two "else" blocks
      }

      if (
        !insertOptions.replace &&
        isRulesEngineAction(parent.conditions.at(-1)) &&
        !isRulesEngineAction(subject)
      ) {
        // Inserting a rules engine and there's a trailing action that isn't being replaced. Insert before the action.
        splice(parent.conditions, Math.min(newIndex, parent.conditions.length - 1), 0, subject);
      } else if (
        insertOptions.replace &&
        isRulesEngineAction(subject) &&
        newIndex >= parent.conditions.length - 1
      ) {
        // Replacing an action at the last index (doesn't matter what we replace it with)
        splice(parent.conditions, parent.conditions.length - 1, 1, subject);
      } else {
        // Normal insertion/replacement
        splice(parent.conditions, newIndex, insertOptions.replace ? 1 : 0, subject);
      }
    }
  });
};

/**
 * Options for {@link groupRE}.
 *
 * @group Rules Engine Tools
 */
export interface GroupOptionsRE extends GroupOptions {}
/**
 * Creates a new group at a target condition with its `rules` array containing the current
 * objects at the target path and the source path. In the options parameter, pass
 * `{ clone: true }` to copy the source rule/group instead of move.
 *
 * @returns The new rules engine with the rules or groups grouped.
 *
 * @group Rules Engine Tools
 */
export const groupRE = <RE extends RulesEngineAny>(
  /** The rules engine to update. */
  rulesEngine: RE,
  /** Path of the condition containing the rule/group to move or clone. */
  sourceConditionPathOrID: Path | string,
  /** Path of the rule/group within the source condition. */
  sourceParentGroupPathOrID: Path | string,
  /** Path of the condition containing the target rule/group. */
  targetConditionPathOrID: Path | string,
  /** Path of the target rule/group within the target condition. */
  targetParentGroupPathOrID: Path | string,
  /** Options. */
  groupOptions: GroupOptionsRE = {}
): RE => {
  return produce(rulesEngine, draft => {
    const sourceConditionPath = Array.isArray(sourceConditionPathOrID)
      ? sourceConditionPathOrID
      : getConditionPathOfID(sourceConditionPathOrID, draft);
    const targetConditionPath = Array.isArray(targetConditionPathOrID)
      ? targetConditionPathOrID
      : getConditionPathOfID(targetConditionPathOrID, draft);

    if (!sourceConditionPath || !targetConditionPath) return;

    // TODO: allow cross-condition grouping
    // Must be in the same condition for grouping
    if (!pathsAreEqual(sourceConditionPath, targetConditionPath)) return;

    const conditionRE = findConditionPath(sourceConditionPath, draft);

    if (!isRuleGroup(conditionRE)) return;

    const newGroup = group(
      conditionRE,
      sourceParentGroupPathOrID,
      targetParentGroupPathOrID,
      groupOptions
    );

    const parentREofCondition = findConditionPath(getParentPath(sourceConditionPath), draft);
    // istanbul ignore next
    if (!coerceToRulesEngine(parentREofCondition)) return;
    splice(parentREofCondition.conditions, sourceConditionPath.at(-1)!, 1, newGroup);
  });
};
