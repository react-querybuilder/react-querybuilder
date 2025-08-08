import { produce } from 'immer';
import type {
  Path,
  RuleGroupTypeAny,
  RulesEngineAction,
  RulesEngineAny,
  RuleType,
} from '../types/index.noReact';
import { isRuleGroup, isRuleType } from './isRuleGroup';
import { isRulesEngineAction, isRulesEngineAny } from './isRulesEngine';
import { findConditionPath, getConditionPathOfID, getParentPath } from './pathUtils';
import type { AddOptions, UpdateOptions } from './queryTools';
import { add, update } from './queryTools';

const push = (a: unknown[], ...items: unknown[]) => a.push(...items);
const splice = (a: unknown[], start: number, deleteCount: number, ...items: unknown[]) =>
  a.splice(start, deleteCount, ...items);

const coerceToRulesEngine = (re: unknown): re is RulesEngineAny => {
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
  parentGroupPathOrID?: Path | string | null | undefined,
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
 * @group Query Tools
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
  parentGroupPathOrID?: Path | string | null | undefined,
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
