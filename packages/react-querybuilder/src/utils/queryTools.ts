import { produce } from 'immer';
import { defaultCombinators } from '../defaults';
import type {
  OptionList,
  Path,
  RuleGroupTypeAny,
  RuleType,
  UpdateableProperties,
  ValueSources,
} from '../types/index.noReact';
import { generateID } from './generateID';
import { isRuleGroup, isRuleGroupType, isRuleGroupTypeIC } from './isRuleGroup';
import { getFirstOption } from './optGroupUtils';
import { findPath, getCommonAncestorPath, getParentPath, pathsAreEqual } from './pathUtils';
import { prepareRuleOrGroup } from './prepareQueryObjects';
import { regenerateID, regenerateIDs } from './regenerateIDs';

/**
 * Options for {@link add}.
 */
export interface AddOptions {
  /**
   * If the query extends `RuleGroupTypeIC` (i.e. the query has independent
   * combinators), then the first combinator in this list will be inserted
   * before the new rule/group if the parent group is not empty. This option
   * is overridden by `combinatorPreceding`.
   */
  combinators?: OptionList;
  /**
   * If the query extends `RuleGroupTypeIC` (i.e. the query has independent
   * combinators), then this combinator will be inserted before the new rule/group
   * if the parent group is not empty. This option will supersede `combinators`.
   */
  combinatorPreceding?: string;
  /**
   * ID generator.
   */
  idGenerator?: () => string;
}
/**
 * Adds a rule or group to a query.
 * @returns The new query with the rule or group added.
 */
export const add = <RG extends RuleGroupTypeAny>(
  /** The query to update. */
  query: RG,
  /** The rule or group to add. */
  ruleOrGroup: RG | RuleType,
  /** Path of the group to add to. */
  parentPath: Path,
  /** Options. */
  {
    combinators = defaultCombinators,
    combinatorPreceding,
    idGenerator = generateID,
  }: AddOptions = {}
) =>
  produce(query, draft => {
    const parent = findPath(parentPath, draft);

    if (!parent || !isRuleGroup(parent)) return;

    if (isRuleGroupTypeIC(parent) && parent.rules.length > 0) {
      const prevCombinator = parent.rules[parent.rules.length - 2];
      parent.rules.push(
        // @ts-expect-error This is technically a type violation until the next push
        // to the rules array, but that happens immediately and unconditionally so
        // there's no significant risk.
        combinatorPreceding ??
          (typeof prevCombinator === 'string' ? prevCombinator : getFirstOption(combinators))
      );
    }
    // `as RuleType` in only here to avoid the ambiguity with `RuleGroupTypeAny`
    parent.rules.push(prepareRuleOrGroup(ruleOrGroup, { idGenerator }) as RuleType);
  });

/**
 * Options for {@link update}.
 */
export interface UpdateOptions {
  /**
   * When updating the `field` of a rule, the rule's `operator`, `value`, and `valueSource`
   * will be reset to their respective defaults. Defaults to `true`.
   */
  resetOnFieldChange?: boolean;
  /**
   * When updating the `operator` of a rule, the rule's `value` and `valueSource`
   * will be reset to their respective defaults. Defaults to `false`.
   */
  resetOnOperatorChange?: boolean;
  /**
   * Determines the default operator name for a given field.
   */
  getRuleDefaultOperator?: (field: string) => string;
  /**
   * Determines the valid value sources for a given field and operator.
   */
  getValueSources?: (field: string, operator: string) => ValueSources;
  /**
   * Gets the default value for a given rule, in case the value needs to be reset.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRuleDefaultValue?: (rule: RuleType) => any;
}
/**
 * Updates a property of a rule or group within a query.
 * @returns The new query with the rule or group property updated.
 */
export const update = <RG extends RuleGroupTypeAny>(
  /** The query to update. */
  query: RG,
  /** The name of the property to update. */
  prop: UpdateableProperties,
  /** The new value of the property. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  /** The path of the rule or group to update. */
  path: Path,
  /** Options. */
  {
    resetOnFieldChange = true,
    resetOnOperatorChange = false,
    getRuleDefaultOperator = () => '=',
    getValueSources = () => ['value'],
    getRuleDefaultValue = () => '',
  }: UpdateOptions = {}
) =>
  produce(query, draft => {
    if (prop === 'combinator' && !isRuleGroupType(draft)) {
      // Independent combinators
      const parentRules = (findPath(getParentPath(path), draft) as RG).rules;
      // Only update an independent combinator if it occupies an odd index
      if (path[path.length - 1] % 2 === 1) {
        parentRules[path[path.length - 1]] = value;
      }
      return;
    }

    const ruleOrGroup = findPath(path, draft);

    // Ignore invalid paths
    if (!ruleOrGroup) return;

    const isGroup = isRuleGroup(ruleOrGroup);

    // Only update if there is actually a change
    // @ts-expect-error prop can refer to rule or group properties
    if (ruleOrGroup[prop] === value) return;

    // Handle valueSource updates later
    if (prop !== 'valueSource') {
      // @ts-expect-error prop can refer to rule or group properties
      ruleOrGroup[prop] = value;
    }

    // If this is a group, there's no more to do
    if (isGroup) return;

    let resetValueSource = false;
    let resetValue = false;

    // Set default operator, valueSource, and value for field change
    if (resetOnFieldChange && prop === 'field') {
      ruleOrGroup.operator = getRuleDefaultOperator(value);
      resetValueSource = true;
      resetValue = true;
    }

    // Set default valueSource and value for operator change
    if (resetOnOperatorChange && prop === 'operator') {
      resetValueSource = true;
      resetValue = true;
    }

    const defaultValueSource = getValueSources(ruleOrGroup.field, ruleOrGroup.operator)[0];
    if (
      (resetValueSource &&
        ruleOrGroup.valueSource &&
        defaultValueSource !== ruleOrGroup.valueSource) ||
      (prop === 'valueSource' && value !== ruleOrGroup.valueSource)
    ) {
      // Only reset the value if we're changing the valueSource either
      // 1) from `undefined` to something that is _not_ the default, or
      // 2) from the current (defined) value to something else
      resetValue =
        !!ruleOrGroup.valueSource || (!ruleOrGroup.valueSource && value !== defaultValueSource);
      ruleOrGroup.valueSource = resetValueSource ? defaultValueSource : value;
    }

    if (resetValue) {
      // The default value should be a valid field name if defaultValueSource is 'field'
      ruleOrGroup.value = getRuleDefaultValue(ruleOrGroup);
    }
  });

/**
 * Removes a rule or group from a query.
 * @returns The new query with the rule or group removed.
 */
export const remove = <RG extends RuleGroupTypeAny>(
  /** The query to update. */
  query: RG,
  /** Path of the rule or group to remove. */
  path: Path
) => {
  if (
    // Can't remove the root group
    path.length === 0 ||
    // Can't independently remove independent combinators
    (!isRuleGroupType(query) && !findPath(path, query))
  ) {
    return query;
  }

  return produce(query, draft => {
    const index = path[path.length - 1];
    const parent = findPath(getParentPath(path), draft);
    if (parent && isRuleGroup(parent)) {
      if (!isRuleGroupType(parent) && parent.rules.length > 1) {
        const idxStartDelete = index === 0 ? 0 : index - 1;
        parent.rules.splice(idxStartDelete, 2);
      } else {
        parent.rules.splice(index, 1);
      }
    }
  });
};

const getNextPath = (
  query: RuleGroupTypeAny,
  currentPath: Path,
  newPathOrShiftDirection: Path | 'up' | 'down'
): Path => {
  if (Array.isArray(newPathOrShiftDirection)) {
    return newPathOrShiftDirection;
  }

  const ic = isRuleGroupTypeIC(query);

  if (newPathOrShiftDirection === 'up') {
    if (pathsAreEqual(currentPath, [0])) {
      return currentPath;
    } else if (currentPath.at(-1) === 0) {
      const parentPath = getParentPath(currentPath);
      return [...getParentPath(parentPath), Math.max(0, parentPath.at(-1)! - (ic ? 1 : 0))];
    } else {
      const evaluationPath = [
        ...getParentPath(currentPath),
        Math.max(0, currentPath.at(-1)! - (ic ? 2 : 1)),
      ];
      const entityAtTarget = findPath(evaluationPath, query);
      if (isRuleGroup(entityAtTarget)) {
        return [...evaluationPath, entityAtTarget.rules.length];
      } else {
        const targetPath = [
          ...getParentPath(currentPath),
          Math.max(0, currentPath.at(-1)! - (ic ? 3 : 1)),
        ];
        return targetPath;
      }
    }
  } else if (newPathOrShiftDirection === 'down') {
    if (pathsAreEqual([query.rules.length - 1], currentPath)) {
      return currentPath;
    } else if (
      currentPath.at(-1) ===
      (findPath(getParentPath(currentPath), query) as RuleGroupTypeAny).rules.length - 1
    ) {
      const parentPath = getParentPath(currentPath);
      return [...getParentPath(parentPath), parentPath.at(-1)! + 1];
    } else {
      const evaluationPath = [...getParentPath(currentPath), currentPath.at(-1)! + (ic ? 2 : 1)];
      const entityToEvaluate = findPath(evaluationPath, query);
      if (isRuleGroup(entityToEvaluate)) {
        return [...evaluationPath, 0];
      } else {
        const targetPath = [...getParentPath(currentPath), currentPath.at(-1)! + (ic ? 3 : 2)];
        return targetPath;
      }
    }
  }

  return currentPath;
};

/**
 * Options for {@link move}.
 */
export interface MoveOptions {
  /**
   * When `true`, the source rule/group will not be removed from its original path.
   */
  clone?: boolean;
  /**
   * If the query extends `RuleGroupTypeIC` (i.e. the query is using independent
   * combinators), then the first combinator in this list will be inserted before
   * the rule/group if necessary.
   */
  combinators?: OptionList;
  /**
   * ID generator.
   */
  idGenerator?: () => string;
}
/**
 * Moves a rule or group from one path to another. In the options parameter, pass
 * `{ clone: true }` to copy instead of move.
 * @returns The new query with the rule or group moved or cloned.
 */
export const move = <RG extends RuleGroupTypeAny>(
  /** The query to update. */
  query: RG,
  /** Original path of the rule or group to move. */
  oldPath: Path,
  /** Path to move the rule or group to, or a shift direction. */
  newPath: Path | 'up' | 'down',
  /** Options. */
  { clone = false, combinators = defaultCombinators, idGenerator = generateID }: MoveOptions = {}
) => {
  const nextPath = getNextPath(query, oldPath, newPath);

  // Don't move to the same location or a path that doesn't exist yet
  if (
    oldPath.length === 0 ||
    pathsAreEqual(oldPath, nextPath) ||
    !findPath(getParentPath(nextPath), query)
  ) {
    return query;
  }

  const ruleOrGroupOriginal = findPath(oldPath, query);
  if (!ruleOrGroupOriginal) {
    return query;
  }
  const ruleOrGroup = clone
    ? isRuleGroup(ruleOrGroupOriginal)
      ? regenerateIDs(ruleOrGroupOriginal, { idGenerator })
      : regenerateID(ruleOrGroupOriginal, { idGenerator })
    : ruleOrGroupOriginal;

  return produce(query, draft => {
    const independentCombinators = isRuleGroupTypeIC(draft);
    const parentOfRuleToRemove = findPath(getParentPath(oldPath), draft) as RG;
    const ruleToRemoveIndex = oldPath[oldPath.length - 1];
    const oldPrevCombinator =
      independentCombinators && ruleToRemoveIndex > 0
        ? (parentOfRuleToRemove.rules[ruleToRemoveIndex - 1] as string)
        : null;
    const oldNextCombinator =
      independentCombinators && ruleToRemoveIndex < parentOfRuleToRemove.rules.length - 1
        ? (parentOfRuleToRemove.rules[ruleToRemoveIndex + 1] as string)
        : null;

    // Remove the source item if not cloning
    if (!clone) {
      const idxStartDelete = independentCombinators
        ? Math.max(0, ruleToRemoveIndex - 1)
        : ruleToRemoveIndex;
      const deleteLength = independentCombinators ? 2 : 1;
      parentOfRuleToRemove.rules.splice(idxStartDelete, deleteLength);
    }

    const newNewPath = [...nextPath];
    const commonAncestorPath = getCommonAncestorPath(oldPath, nextPath);
    if (
      !clone &&
      oldPath.length === commonAncestorPath.length + 1 &&
      nextPath[commonAncestorPath.length] > oldPath[commonAncestorPath.length]
    ) {
      // Getting here means there will be a shift of paths upward at the common
      // ancestor level because the object at `oldPath` will be spliced out. The
      // real new path should therefore be one or two higher than `newPathCalc`.
      newNewPath[commonAncestorPath.length] -= independentCombinators ? 2 : 1;
    }
    const newNewParentPath = getParentPath(newNewPath);
    const parentToInsertInto = findPath(newNewParentPath, draft) as RG;
    const newIndex = newNewPath[newNewPath.length - 1];

    /**
     * This function 1) glosses over the need for type assertions to splice directly
     * into `parentToInsertInto.rules`, and 2) shortens the actual insertion code.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertRuleOrGroup = (...args: any[]) =>
      parentToInsertInto.rules.splice(newIndex, 0, ...args);

    // Insert the source item at the target path
    if (parentToInsertInto.rules.length === 0 || !independentCombinators) {
      insertRuleOrGroup(ruleOrGroup);
    } else {
      if (newIndex === 0) {
        if (ruleToRemoveIndex === 0 && oldNextCombinator) {
          insertRuleOrGroup(ruleOrGroup, oldNextCombinator);
        } else {
          const newNextCombinator =
            parentToInsertInto.rules[1] ?? oldPrevCombinator ?? getFirstOption(combinators);
          insertRuleOrGroup(ruleOrGroup, newNextCombinator);
        }
      } else {
        if (oldPrevCombinator) {
          insertRuleOrGroup(oldPrevCombinator, ruleOrGroup);
        } else {
          const newPrevCombinator =
            parentToInsertInto.rules[newIndex - 2] ??
            oldNextCombinator ??
            getFirstOption(combinators);
          insertRuleOrGroup(newPrevCombinator, ruleOrGroup);
        }
      }
    }
  });
};

/**
 * Options for {@link insert}.
 */
export interface InsertOptions {
  /**
   * If the query extends `RuleGroupTypeIC` (i.e. the query has independent
   * combinators), then the first combinator in this list will be inserted
   * before the new rule/group if the parent group is not empty. This option
   * is overridden by `combinatorPreceding`.
   */
  combinators?: OptionList;
  /**
   * If the query extends `RuleGroupTypeIC` (i.e. the query has independent
   * combinators), then this combinator will be inserted before the new rule/group
   * if the parent group is not empty and the new rule/group is not the first in the
   * group (`path.at(-1) > 0`). This option will supersede `combinators`.
   */
  combinatorPreceding?: string;
  /**
   * If the query extends `RuleGroupTypeIC` (i.e. the query has independent
   * combinators), then this combinator will be inserted after the new rule/group
   * if the parent group is not empty and the new rule/group is the first in the
   * group (`path.at(-1) === 0`). This option will supersede `combinators`.
   */
  combinatorSucceeding?: string;
  /**
   * ID generator.
   *
   * @default generateID
   */
  idGenerator?: () => string;
  /**
   * When `true`, the new rule/group will replace the rule/group at `path`.
   */
  replace?: boolean;
}
/**
 * Inserts a rule or group into a query.
 * @returns The new query with the rule or group inserted.
 */
export const insert = <RG extends RuleGroupTypeAny>(
  /** The query to update. */
  query: RG,
  /** The rule or group to insert. */
  ruleOrGroup: RG | RuleType,
  /** Path at which to insert the rule or group. */
  path: number[],
  /** Options. */
  {
    combinators = defaultCombinators,
    combinatorPreceding,
    combinatorSucceeding,
    idGenerator = generateID,
    replace = false,
  }: InsertOptions = {}
) =>
  produce(query, draft => {
    const parentToInsertInto = findPath(getParentPath(path), draft) as RG;
    if (!parentToInsertInto || !isRuleGroup(parentToInsertInto)) return;

    const rorg = isRuleGroup(ruleOrGroup)
      ? regenerateIDs(ruleOrGroup, { idGenerator })
      : regenerateID(ruleOrGroup, { idGenerator });
    const independentCombinators = isRuleGroupTypeIC(draft);
    const newIndex = path[path.length - 1];

    /**
     * This function 1) glosses over the need for type assertions to splice directly
     * into `parentToInsertInto.rules`, and 2) shortens the actual insertion code.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertRuleOrGroup = (idx: number, ...args: any[]) =>
      parentToInsertInto.rules.splice(idx, replace ? args.length : 0, ...args);

    // Insert the source item at the target path
    if (parentToInsertInto.rules.length === 0 || !independentCombinators) {
      insertRuleOrGroup(newIndex, rorg);
    } else if (replace && independentCombinators) {
      insertRuleOrGroup(newIndex + (newIndex % 2), rorg);
    } else {
      if (newIndex === 0) {
        if (rorg.path?.at(-1) === 0 && combinatorSucceeding) {
          insertRuleOrGroup(newIndex, rorg, combinatorSucceeding);
        } else {
          const newNextCombinator =
            parentToInsertInto.rules[1] ?? combinatorPreceding ?? getFirstOption(combinators);
          insertRuleOrGroup(newIndex, rorg, newNextCombinator);
        }
      } else {
        const normalizedNewIndex = newIndex % 2 === 0 ? newIndex - 1 : newIndex;
        if (combinatorPreceding) {
          insertRuleOrGroup(normalizedNewIndex, combinatorPreceding, rorg);
        } else {
          const newPrevCombinator =
            parentToInsertInto.rules[normalizedNewIndex - 2] ??
            combinatorSucceeding ??
            getFirstOption(combinators);
          insertRuleOrGroup(normalizedNewIndex, newPrevCombinator, rorg);
        }
      }
    }
  });
