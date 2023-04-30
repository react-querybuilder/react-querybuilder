import type {
  OptionList,
  RuleGroupTypeAny,
  RuleType,
  UpdateableProperties,
  ValueSources,
} from '@react-querybuilder/ts/dist/index.noReact';
import { produce } from 'immer';
import { defaultCombinators } from '../defaults';
import { generateID } from './generateID';
import { getFirstOption } from './optGroupUtils';
import { findPath, getCommonAncestorPath, getParentPath, pathsAreEqual } from './pathUtils';
import { prepareRuleOrGroup } from './prepareQueryObjects';
import { regenerateID, regenerateIDs } from './regenerateIDs';

// TODO: eventually refactor the RuleGroup/IC types to be either/or in ALL cases.
// Example for `add`:
/*
export function add<RG extends RuleGroupType>(
  query: RG,
  ruleOrGroup: RG | RuleType,
  parentPath: number[],
  options?: Omit<AddOptions, 'combinatorPreceding'>
): RG;
export function add<RGIC extends RuleGroupTypeIC>(
  query: RGIC,
  ruleOrGroup: RGIC | RuleType,
  parentPath: number[],
  options?: AddOptions
): RGIC;
*/

export interface AddOptions {
  /**
   * If the query is of type `RuleGroupTypeIC` (i.e. the query builder used
   * `independentCombinators`), then the first combinator in this list will be
   * inserted before the new rule/group if the parent group is not empty. This
   * option is overridden by `combinatorPreceding`.
   */
  combinators?: OptionList;
  /**
   * If the query is of type `RuleGroupTypeIC` (i.e. the query builder used
   * `independentCombinators`), then this combinator will be inserted before
   * the new rule/group if the parent group is not empty. This option will
   * supersede `combinators`.
   */
  combinatorPreceding?: string;
  /**
   * ID generator.
   */
  idGenerator?: () => string;
}
/**
 * Adds a rule or group to a query.
 * @param query - The query to update
 * @param ruleOrGroup - The rule or group to add
 * @param parentPath - Path of the group to add to
 * @param options -
 * @returns The full query with the new rule or group added
 */
export const add = <RG extends RuleGroupTypeAny>(
  query: RG,
  ruleOrGroup: RG | RuleType,
  parentPath: number[],
  {
    combinators = defaultCombinators,
    combinatorPreceding,
    idGenerator = generateID,
  }: AddOptions = {}
) =>
  produce(query, draft => {
    const parent = findPath(parentPath, draft);

    if (!parent || !('rules' in parent)) return;

    if (!('combinator' in parent) && parent.rules.length > 0) {
      const prevCombinator = parent.rules[parent.rules.length - 2];
      parent.rules.push(
        // @ts-expect-error This is technically a type violation until the next push
        // to the rules array, but that happens immediately and unconditionally so
        // there's no significant risk.
        combinatorPreceding ??
          (typeof prevCombinator === 'string' ? prevCombinator : getFirstOption(combinators))
      );
    }
    // The "as RuleType" here just avoids the ambiguity with RuleGroupTypeAny
    parent.rules.push(prepareRuleOrGroup(ruleOrGroup, { idGenerator }) as RuleType);
  });

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
  getRuleDefaultValue?: (rule: RuleType) => any;
}
/**
 * Updates a property of a rule or group within a query.
 * @param query - The query to update
 * @param prop - The name of the property to update
 * @param value - The new value of the property
 * @param path - The path of the rule or group to update
 * @param options -
 * @returns The updated query
 */
export const update = <RG extends RuleGroupTypeAny>(
  query: RG,
  prop: UpdateableProperties,
  value: any,
  path: number[],
  {
    resetOnFieldChange = true,
    resetOnOperatorChange = false,
    getRuleDefaultOperator = () => '=',
    getValueSources = () => ['value'],
    getRuleDefaultValue = () => '',
  }: UpdateOptions = {}
) =>
  produce(query, draft => {
    if (prop === 'combinator' && !('combinator' in draft)) {
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

    const isGroup = 'rules' in ruleOrGroup;

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
 * @param query - The query to update
 * @param path - Path of the rule or group to remove
 * @returns The updated query
 */
export const remove = <RG extends RuleGroupTypeAny>(query: RG, path: number[]) => {
  if (
    // Can't remove the root group
    path.length === 0 ||
    // Can't independently remove independent combinators
    (!('combinator' in query) && !findPath(path, query))
  ) {
    return query;
  }

  return produce(query, draft => {
    const index = path[path.length - 1];
    const parent = findPath(getParentPath(path), draft);
    if (parent && 'rules' in parent) {
      if (!('combinator' in parent) && parent.rules.length > 1) {
        const idxStartDelete = index === 0 ? 0 : index - 1;
        parent.rules.splice(idxStartDelete, 2);
      } else {
        parent.rules.splice(index, 1);
      }
    }
  });
};

export interface MoveOptions {
  /**
   * When `true`, the source rule/group will not be removed from its original path.
   */
  clone?: boolean;
  /**
   * If the query is of type `RuleGroupTypeIC` (i.e. the query builder used
   * `independentCombinators`), then the first combinator in this list will be
   * inserted before the rule/group if necessary.
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
 * @param query - The query to update
 * @param oldPath - Original path of the rule or group to move
 * @param newPath - Path to move the rule or group to
 * @param options -
 * @returns The updated query
 */
export const move = <RG extends RuleGroupTypeAny>(
  query: RG,
  oldPath: number[],
  newPath: number[],
  { clone = false, combinators = defaultCombinators, idGenerator = generateID }: MoveOptions = {}
) => {
  // Don't move to the same location or a path that doesn't exist yet
  if (pathsAreEqual(oldPath, newPath) || !findPath(getParentPath(newPath), query)) {
    return query;
  }

  const ruleOrGroupOriginal = findPath(oldPath, query);
  if (!ruleOrGroupOriginal) {
    return query;
  }
  const ruleOrGroup = clone
    ? 'rules' in ruleOrGroupOriginal
      ? regenerateIDs(ruleOrGroupOriginal, { idGenerator })
      : regenerateID(ruleOrGroupOriginal, { idGenerator })
    : ruleOrGroupOriginal;

  return produce(query, draft => {
    const independentCombinators = !('combinator' in draft);
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

    const newNewPath = [...newPath];
    const commonAncestorPath = getCommonAncestorPath(oldPath, newPath);
    if (
      !clone &&
      oldPath.length === commonAncestorPath.length + 1 &&
      newPath[commonAncestorPath.length] > oldPath[commonAncestorPath.length]
    ) {
      // Getting here means there will be a shift of paths upward at the common
      // ancestor level because the object at `oldPath` will be spliced out. The
      // real new path should therefore be one or two higher than `newPath`.
      newNewPath[commonAncestorPath.length] -= independentCombinators ? 2 : 1;
    }
    const parentToInsertInto = findPath(getParentPath(newNewPath), draft) as RG;
    const newIndex = newNewPath[newNewPath.length - 1];

    /**
     * This function 1) glosses over the need for type assertions to splice directly
     * into `parentToInsertInto.rules`, and 2) shortens the actual insertion code.
     */
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
            parentToInsertInto.rules[1] || oldPrevCombinator || getFirstOption(combinators);
          insertRuleOrGroup(ruleOrGroup, newNextCombinator);
        }
      } else {
        if (oldPrevCombinator) {
          insertRuleOrGroup(oldPrevCombinator, ruleOrGroup);
        } else {
          const newPrevCombinator =
            parentToInsertInto.rules[newIndex - 2] ||
            oldNextCombinator ||
            getFirstOption(combinators);
          insertRuleOrGroup(newPrevCombinator, ruleOrGroup);
        }
      }
    }
  });
};
