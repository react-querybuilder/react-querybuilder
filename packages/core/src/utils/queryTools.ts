import { current, isDraft, produce } from 'immer';
import { defaultCombinators } from '../defaults';
import type {
  MatchModeOptions,
  OptionList,
  Path,
  RuleGroupTypeAny,
  RuleType,
  UpdateableProperties,
  UpdateValueMap,
  ValueSourceFlexibleOptions,
  ValueSources,
} from '../types';
import { generateID } from './generateID';
import { getValueSourcesUtil } from './getValueSourcesUtil';
import { isRuleGroup, isRuleGroupType, isRuleGroupTypeIC } from './isRuleGroup';
import { getFirstOption, getOption } from './optGroupUtils';
import {
  findID,
  findPath,
  getCommonAncestorPath,
  getParentPath,
  getPathOfID,
  pathIsDisabled,
  pathIsDisabledByPaths,
  pathsAreEqual,
} from './pathUtils';
import { prepareRuleOrGroup } from './prepareQueryObjects';
import { regenerateIDs } from './regenerateIDs';

/**
 * Why a query tool returned the query unmodified. Query tools never throw; when they cannot
 * carry out an operation they return the original query and report the reason through
 * {@link AbortOptions.onAbort}.
 *
 * `"same-location"` and `"no-change"` describe operations that were valid but had nothing to
 * do, so they are not errors. Every other reason indicates a target that could not be used.
 *
 * @group Query Tools
 */
export type AbortReason =
  /** The rule/group identified by the given path or `id` does not exist. */
  | 'target-not-found'
  /** The parent group identified by the given path or `id` does not exist. */
  | 'parent-not-found'
  /** The given parent path or `id` refers to a rule rather than a group. */
  | 'parent-not-a-group'
  /** The destination's parent group does not exist. */
  | 'destination-not-found'
  /** The root group cannot be removed, moved, or grouped. */
  | 'root-not-allowed'
  /** In a query with independent combinators, the target index holds a rule, not a combinator. */
  | 'not-a-combinator-slot'
  /** The rule/group is already at the destination. Not an error. */
  | 'same-location'
  /** The property already has the given value. Not an error. */
  | 'no-change'
  /** The target rule/group is disabled, or descends from a disabled group. */
  | 'target-disabled'
  /** The parent group is disabled, or descends from a disabled group. */
  | 'parent-disabled'
  /** Adding the group would nest it deeper than `maxLevels` allows. */
  | 'max-levels-exceeded';

/**
 * Details about an aborted query tool operation.
 *
 * @group Query Tools
 */
export interface AbortInfo {
  /** Why the operation was aborted. */
  reason: AbortReason;
  /** The query tool that aborted. */
  operation: 'add' | 'remove' | 'update' | 'move' | 'insert' | 'group';
  /** The path or `id` that could not be used, when the reason relates to a specific target. */
  pathOrID?: Path | string;
}

/**
 * Options that block a mutation before it is attempted.
 *
 * `disabled` is a property of the query itself, so honoring it is a matter of data integrity
 * rather than presentation: a query saved with a locked rule should stay locked when it is
 * loaded again. It is opt-in here only to preserve the existing behavior of the standalone
 * query tools; {@link QueryManager} enables it by default.
 *
 * @group Query Tools
 */
export interface GuardOptions {
  /**
   * Abort when the target (or its parent, for `add`/`insert`) is disabled, either directly or
   * by descending from a disabled group. Defaults to `false`.
   *
   * Updating a rule or group's own `disabled` property is always permitted, since it is the
   * only way to re-enable it.
   */
  respectDisabled?: boolean;
  /**
   * Paths that are disabled without the corresponding rule or group carrying a `disabled`
   * property, mirroring the array form of the `QueryBuilder` `disabled` prop. A path is treated
   * as disabled if it appears here or descends from a path that does.
   *
   * Like the `disabled` property, this is only honored when `respectDisabled` is `true`, and
   * updating a rule or group's own `disabled` property is still permitted.
   */
  disabledPaths?: Path[];
  /** Abort every mutation, as though the entire query were disabled. Defaults to `false`. */
  queryDisabled?: boolean;
  /**
   * The maximum depth at which a group may be added. A group whose parent path is already this
   * deep is rejected by `add` and `insert`. Rules are unaffected. Defaults to `Infinity`.
   */
  maxLevels?: number;
}

/**
 * Options for reporting aborted query tool operations.
 *
 * @group Query Tools
 */
export interface AbortOptions extends GuardOptions {
  /**
   * Called when the operation returns the query unmodified, with the reason why. Query tools
   * never throw, so this is the only way to distinguish "the target was invalid" from
   * "the operation had nothing to do".
   */
  onAbort?: (info: AbortInfo) => void;
}

/**
 * Whether a mutation targeting `pathOrID` is blocked by the given guards, and why.
 * Returns `null` when the mutation may proceed.
 *
 * Exported so that callers which run their own logic before mutating—such as a UI layer that
 * invokes a confirmation callback—can apply the same rules without duplicating them.
 *
 * @group Query Tools
 */
export const getGuardAbortReason = (
  query: RuleGroupTypeAny,
  pathOrID: Path | string | undefined,
  guards: GuardOptions = {},
  { asParent = false }: { asParent?: boolean } = {}
): AbortReason | null => {
  if (guards.queryDisabled) return asParent ? 'parent-disabled' : 'target-disabled';

  if (!guards.respectDisabled || pathOrID === undefined) return null;

  const path = Array.isArray(pathOrID) ? pathOrID : getPathOfID(pathOrID, query);
  if (path && (pathIsDisabled(path, query) || pathIsDisabledByPaths(path, guards.disabledPaths))) {
    return asParent ? 'parent-disabled' : 'target-disabled';
  }

  return null;
};

/**
 * Whether adding a group beneath `parentPath` would exceed `maxLevels`.
 *
 * @group Query Tools
 */
export const exceedsMaxLevels = (
  parentPath: Path | undefined,
  { maxLevels = Infinity }: GuardOptions = {}
): boolean => !!parentPath && parentPath.length >= maxLevels;

/**
 * Options for {@link add}.
 *
 * @group Query Tools
 */
export interface AddOptions extends AbortOptions {
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

export interface AddMethod {
  <RG extends RuleGroupTypeAny>(
    /** The query to update. */
    query: RG,
    /** The rule or group to add. */
    ruleOrGroup: RG | RuleType,
    /** Path or ID of the group to add to. */
    parentPathOrID: Path | string,
    /** Options. */
    options?: AddOptions
  ): RG;
}

/**
 * Adds a rule or group to a query without mutating the original query.
 *
 * @returns A new query with the rule or group added.
 *
 * @group Query Tools
 */
export const add: AddMethod = (query, ruleOrGroup, parentPathOrID, options = {}): typeof query =>
  produce(query, q => addInPlace(q, ruleOrGroup as RuleType, parentPathOrID, options));

/**
 * Adds a rule or group to a query in place.
 *
 * @returns The query (mutated in place) with the rule or group added.
 *
 * @group Query Tools
 */
export const addInPlace: AddMethod = (
  query,
  ruleOrGroup,
  parentPathOrID,
  options = {}
): typeof query => {
  const {
    combinators = defaultCombinators,
    combinatorPreceding,
    idGenerator = generateID,
    onAbort,
  } = options;
  const parent = Array.isArray(parentPathOrID)
    ? findPath(parentPathOrID, query)
    : findID(parentPathOrID, query);

  if (!parent) {
    onAbort?.({ reason: 'parent-not-found', operation: 'add', pathOrID: parentPathOrID });
    return query;
  }

  if (!isRuleGroup(parent)) {
    onAbort?.({ reason: 'parent-not-a-group', operation: 'add', pathOrID: parentPathOrID });
    return query;
  }

  // The parent is known to exist by this point, so the path always resolves.
  const parentPath = (
    Array.isArray(parentPathOrID) ? parentPathOrID : getPathOfID(parentPathOrID, query)
  ) as Path;

  const addGuardReason = getGuardAbortReason(query, parentPath, options, { asParent: true });
  if (addGuardReason) {
    onAbort?.({ reason: addGuardReason, operation: 'add', pathOrID: parentPathOrID });
    return query;
  }

  if (isRuleGroup(ruleOrGroup) && exceedsMaxLevels(parentPath, options)) {
    onAbort?.({ reason: 'max-levels-exceeded', operation: 'add', pathOrID: parentPathOrID });
    return query;
  }

  if (isRuleGroupTypeIC(parent) && parent.rules.length > 0) {
    const prevCombinator = parent.rules.at(-2);
    parent.rules.push(
      // @ts-expect-error This is technically a type violation until the next push
      // to the rules array, but that happens immediately and unconditionally so
      // there's no significant risk.
      combinatorPreceding ??
        (typeof prevCombinator === 'string' ? prevCombinator : getFirstOption(combinators))
    );
  }
  // `as RuleType` is only here to avoid the ambiguity with `RuleGroupTypeAny`
  parent.rules.push(prepareRuleOrGroup(ruleOrGroup, { idGenerator }) as RuleType);

  return query;
};

/**
 * Options for {@link update}.
 *
 * @group Query Tools
 */
export interface UpdateOptions extends AbortOptions {
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
  getValueSources?: (field: string, operator: string) => ValueSources | ValueSourceFlexibleOptions;
  /**
   * Gets the default value for a given rule, in case the value needs to be reset.
   */
  // oxlint-disable-next-line typescript/no-explicit-any
  getRuleDefaultValue?: (rule: RuleType) => any;
  /**
   * Determines the valid match modes for a given field.
   */
  getMatchModes?: (field: string) => MatchModeOptions;
}

export interface UpdateMethod {
  /**
   * Updates a single property of a rule or group.
   */
  <RG extends RuleGroupTypeAny>(
    /** The query to update. */
    query: RG,
    /** The name of the property to update. */
    prop: UpdateableProperties,
    /** The new value of the property. */
    // oxlint-disable-next-line typescript/no-explicit-any
    value: any,
    /** The path or ID of the rule or group to update. */
    pathOrID: Path | string,
    /** Options. */
    options?: UpdateOptions
  ): RG;
  /**
   * Updates multiple properties of a rule or group using parallel arrays of
   * property names and corresponding values.
   */
  <RG extends RuleGroupTypeAny>(
    /** The query to update. */
    query: RG,
    /** The names of the properties to update. */
    props: UpdateableProperties[],
    /** The new values, in the same order as `props`. */
    // oxlint-disable-next-line typescript/no-explicit-any
    values: any[],
    /** The path or ID of the rule or group to update. */
    pathOrID: Path | string,
    /** Options. */
    options?: UpdateOptions
  ): RG;
  /**
   * Updates multiple properties of a rule or group using a map of property
   * names to their new values.
   */
  <RG extends RuleGroupTypeAny>(
    /** The query to update. */
    query: RG,
    /** A map of property names to their new values. */
    props: UpdateValueMap,
    /** The path or ID of the rule or group to update. */
    pathOrID: Path | string,
    /** Options. */
    options?: UpdateOptions
  ): RG;
}

/**
 * Relative order in which properties are applied during a multi-property update.
 * Lower ranks apply first; `value` applies last so an explicitly-provided value
 * is never clobbered by a reset triggered by a `field`/`operator`/`valueSource`
 * change. Unranked properties default to `3` (between `valueSource` and `value`).
 */
const updatePropRank: Record<string, number> = { field: 0, operator: 1, valueSource: 2, value: 4 };

/** Stable-sorts `[prop, value]` entries by {@link updatePropRank}. */
const orderUpdateEntries = (entries: [string, unknown][]): [string, unknown][] =>
  entries.sort((x, y) => (updatePropRank[x[0]] ?? 3) - (updatePropRank[y[0]] ?? 3));

/**
 * Normalizes the variadic {@link update}/{@link updateInPlace} arguments (single
 * prop+value, parallel arrays, or property map) into a canonically-ordered list
 * of `[prop, value]` entries plus the target path/ID and options.
 */
const normalizeUpdateArgs = (
  a: unknown,
  b: unknown,
  c: unknown,
  d: unknown
): { entries: [string, unknown][]; pathOrID: Path | string; options: UpdateOptions } => {
  // Single property: (prop, value, pathOrID, options)
  if (typeof a === 'string') {
    return { entries: [[a, b]], pathOrID: c as Path | string, options: (d as UpdateOptions) ?? {} };
  }
  // Parallel arrays: (props, values, pathOrID, options)
  if (Array.isArray(a)) {
    const values = b as unknown[];
    return {
      entries: orderUpdateEntries(a.map((prop, i): [string, unknown] => [prop, values[i]])),
      pathOrID: c as Path | string,
      options: (d as UpdateOptions) ?? {},
    };
  }
  // Property map: (props, pathOrID, options)
  return {
    entries: orderUpdateEntries(Object.entries(a as Record<string, unknown>)),
    pathOrID: b as Path | string,
    options: (c as UpdateOptions) ?? {},
  };
};

/**
 * Applies one or more property updates to a query in place. Shared by
 * {@link update} and {@link updateInPlace}.
 */
const applyUpdatesInPlace = <RG extends RuleGroupTypeAny>(
  query: RG,
  a: unknown,
  b: unknown,
  c: unknown,
  d: unknown
): RG => {
  const { entries, pathOrID, options } = normalizeUpdateArgs(a, b, c, d);
  for (const [prop, value] of entries) {
    updateInPlaceSingle(query, prop, value, pathOrID, options);
  }
  return query;
};

/**
 * Updates one or more properties of a rule or group within a query without
 * mutating the original query. Properties may be supplied individually
 * (`prop`, `value`), as parallel arrays (`props`, `values`), or as a
 * property-to-value map. For multi-property updates, `field`, `operator`, and
 * `valueSource` are applied before `value`, so an explicit `value` is never
 * reset by a change to one of those properties.
 *
 * @returns A new query with the rule or group properties updated.
 *
 * @group Query Tools
 */
export const update = (<RG extends RuleGroupTypeAny>(
  query: RG,
  a: unknown,
  b?: unknown,
  c?: unknown,
  d?: unknown
): RG =>
  produce(query, q => {
    applyUpdatesInPlace(q, a, b, c, d);
  })) as UpdateMethod;

/**
 * Updates one or more properties of a rule or group within a query in place.
 * See {@link update} for the supported argument forms and ordering semantics.
 *
 * @returns The query (mutated in place) with the rule or group properties updated.
 *
 * @group Query Tools
 */
export const updateInPlace = (<RG extends RuleGroupTypeAny>(
  query: RG,
  a: unknown,
  b?: unknown,
  c?: unknown,
  d?: unknown
): RG => applyUpdatesInPlace(query, a, b, c, d)) as UpdateMethod;

/**
 * Updates a single property of a rule or group within a query in place.
 */
const updateInPlaceSingle = <RG extends RuleGroupTypeAny>(
  query: RG,
  prop: UpdateableProperties,
  // oxlint-disable-next-line typescript/no-explicit-any
  value: any,
  pathOrID: Path | string,
  options: UpdateOptions = {}
): RG => {
  const {
    resetOnFieldChange: _resetOnFieldChange = true,
    resetOnOperatorChange = false,
    getRuleDefaultOperator = () => '=',
    getValueSources = () => ['value'],
    getRuleDefaultValue = () => '',
    getMatchModes = () => [],
    onAbort,
  } = options;

  let resetOnFieldChange = _resetOnFieldChange;

  const path = Array.isArray(pathOrID) ? pathOrID : getPathOfID(pathOrID, query);

  // Ignore invalid paths/ids
  if (!path) {
    onAbort?.({ reason: 'target-not-found', operation: 'update', pathOrID });
    return query;
  }

  // A node's own `disabled` property is exempt from `respectDisabled`—otherwise a disabled node
  // could never be re-enabled. `queryDisabled` still blocks it, since that disables everything.
  const updateGuards =
    prop === 'disabled' ? { queryDisabled: options.queryDisabled } : (options as GuardOptions);
  const updateGuardReason = getGuardAbortReason(query, path, updateGuards);
  if (updateGuardReason) {
    onAbort?.({ reason: updateGuardReason, operation: 'update', pathOrID });
    return query;
  }

  // Independent combinators
  if (prop === 'combinator' && !isRuleGroupType(query)) {
    const parentRules = (findPath(getParentPath(path), query) as typeof query).rules;
    // Only update an independent combinator if it occupies an odd index
    if (path.at(-1)! % 2 === 1) {
      if (parentRules[path.at(-1)!] === value) {
        onAbort?.({ reason: 'no-change', operation: 'update', pathOrID });
      } else {
        parentRules[path.at(-1)!] = value;
      }
    } else {
      onAbort?.({ reason: 'not-a-combinator-slot', operation: 'update', pathOrID });
    }
    return query;
  }

  const ruleOrGroup = findPath(path, query);

  // Ignore invalid paths
  if (!ruleOrGroup) {
    onAbort?.({ reason: 'target-not-found', operation: 'update', pathOrID });
    return query;
  }

  const isGroup = isRuleGroup(ruleOrGroup);

  // Only update if there is actually a change
  // @ts-expect-error prop can refer to rule or group properties
  if (ruleOrGroup[prop] === value) {
    onAbort?.({ reason: 'no-change', operation: 'update', pathOrID });
    return query;
  }

  // Handle valueSource updates later
  if (prop !== 'valueSource') {
    // @ts-expect-error prop can refer to rule or group properties
    ruleOrGroup[prop] = value;
  }

  // If this is a group, there's no more to do
  if (isGroup) return query;

  let resetValueSource = false;
  let resetValue = false;

  if (prop === 'field') {
    const fromFieldMatchModes = getMatchModes(ruleOrGroup.field);
    const toFieldMatchModes = getMatchModes(value);

    if (toFieldMatchModes.length === 0) {
      delete ruleOrGroup.match;
    } else {
      const nextMatchMode =
        ruleOrGroup.match?.mode && getOption(toFieldMatchModes, ruleOrGroup.match.mode)
          ? null
          : getFirstOption(toFieldMatchModes);
      if (nextMatchMode) {
        ruleOrGroup.match = { mode: nextMatchMode, threshold: 1 };
      }
    }

    if (fromFieldMatchModes.length > 0 || toFieldMatchModes.length > 0) {
      // Force `resetOnFieldChange` when field is updated FROM or TO one that has match modes
      resetOnFieldChange = true;
    }
  }

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

  const valueSources = getValueSourcesUtil(
    { name: ruleOrGroup.field, value: ruleOrGroup.field, label: '' },
    ruleOrGroup.operator,
    getValueSources
  );
  const defaultValueSource = getFirstOption(valueSources);
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

  return query;
};

/**
 * Options for {@link remove}.
 *
 * @group Query Tools
 */
export interface RemoveOptions extends AbortOptions {}

export interface RemoveMethod {
  <RG extends RuleGroupTypeAny>(
    /** The query to update. */
    query: RG,
    /** The path or ID of the rule or group to remove. */
    pathOrID: Path | string,
    /** Options. */
    options?: RemoveOptions
  ): RG;
}

/**
 * Removes a rule or group from a query without mutating the original query.
 *
 * @returns A new query with the rule or group removed.
 *
 * @group Query Tools
 */
export const remove: RemoveMethod = (query, pathOrID, options = {}): typeof query =>
  produce(query, q => removeInPlace(q, pathOrID, options));

/**
 * Removes a rule or group from a query in place.
 *
 * @returns The query (mutated in place) with the rule or group removed.
 *
 * @group Query Tools
 */
export const removeInPlace: RemoveMethod = (query, pathOrID, options = {}): typeof query => {
  const { onAbort } = options;
  const path = Array.isArray(pathOrID) ? pathOrID : getPathOfID(pathOrID, query);

  // Ignore invalid paths/ids
  if (!path) {
    onAbort?.({ reason: 'target-not-found', operation: 'remove', pathOrID });
    return query;
  }

  // Can't remove the root group
  if (path.length === 0) {
    onAbort?.({ reason: 'root-not-allowed', operation: 'remove', pathOrID });
    return query;
  }

  const removeGuardReason = getGuardAbortReason(query, path, options);
  if (removeGuardReason) {
    onAbort?.({ reason: removeGuardReason, operation: 'remove', pathOrID });
    return query;
  }

  // The target must actually exist. This also covers independent combinators, which `findPath`
  // reports as missing because they are bare strings rather than rules—they can only be removed
  // alongside the rule they precede or follow.
  if (!findPath(path, query)) {
    onAbort?.({ reason: 'target-not-found', operation: 'remove', pathOrID });
    return query;
  }

  // The target resolved, so at a non-root path its parent is necessarily an existing group.
  const index = path.at(-1)!;
  const parent = findPath(getParentPath(path), query) as RuleGroupTypeAny;
  if (!isRuleGroupType(parent) && parent.rules.length > 1) {
    const idxStartDelete = index === 0 ? 0 : index - 1;
    parent.rules.splice(idxStartDelete, 2);
  } else {
    parent.rules.splice(index, 1);
  }

  return query;
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
 *
 * @group Query Tools
 */
export interface MoveOptions extends AbortOptions {
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

export interface MoveMethod {
  <RG extends RuleGroupTypeAny>(
    /** The query to update. */
    query: RG,
    /** ID or original path of the rule or group to move. */
    oldPathOrID: Path | string,
    /** Path to move the rule or group to, or a shift direction. */
    newPath: Path | 'up' | 'down',
    /** Options. */
    options?: MoveOptions
  ): RG;
}

/**
 * Moves a rule or group from one path to another without mutating the original query.
 * In the options parameter, pass `{ clone: true }` to copy instead of move.
 *
 * @returns A new query with the rule or group moved or cloned.
 *
 * @group Query Tools
 */
export const move: MoveMethod = (query, oldPathOrID, newPath, options = {}): typeof query =>
  produce(query, q => moveInPlace(q, oldPathOrID, newPath, options));

/**
 * Moves a rule or group from one path to another in place.
 * In the options parameter, pass `{ clone: true }` to copy instead of move.
 *
 * @returns The query (mutated in place) with the rule or group moved or cloned.
 *
 * @group Query Tools
 */
export const moveInPlace: MoveMethod = (
  query,
  oldPathOrID,
  newPath,
  options = {}
): typeof query => {
  const {
    clone = false,
    combinators = defaultCombinators,
    idGenerator = generateID,
    onAbort,
  } = options;
  const oldPath = Array.isArray(oldPathOrID) ? oldPathOrID : getPathOfID(oldPathOrID, query);

  // Ignore invalid paths/ids
  if (!oldPath) {
    onAbort?.({ reason: 'target-not-found', operation: 'move', pathOrID: oldPathOrID });
    return query;
  }

  const nextPath = getNextPath(query, oldPath, newPath);

  // Can't move the root group
  if (oldPath.length === 0) {
    onAbort?.({ reason: 'root-not-allowed', operation: 'move', pathOrID: oldPathOrID });
    return query;
  }

  const moveGuardReason = getGuardAbortReason(query, oldPath, options);
  if (moveGuardReason) {
    onAbort?.({ reason: moveGuardReason, operation: 'move', pathOrID: oldPathOrID });
    return query;
  }

  // Don't move to the same location
  if (pathsAreEqual(oldPath, nextPath)) {
    onAbort?.({ reason: 'same-location', operation: 'move', pathOrID: oldPathOrID });
    return query;
  }

  // Don't move to a path that doesn't exist yet
  if (!findPath(getParentPath(nextPath), query)) {
    onAbort?.({ reason: 'destination-not-found', operation: 'move', pathOrID: newPath });
    return query;
  }

  const ruleOrGroupOriginal = findPath(oldPath, query);
  if (!ruleOrGroupOriginal) {
    onAbort?.({ reason: 'target-not-found', operation: 'move', pathOrID: oldPathOrID });
    return query;
  }
  const ruleOrGroup = clone
    ? regenerateIDs(
        isDraft(ruleOrGroupOriginal) ? current(ruleOrGroupOriginal) : ruleOrGroupOriginal,
        { idGenerator }
      )
    : ruleOrGroupOriginal;

  const independentCombinators = isRuleGroupTypeIC(query);
  const parentOfRuleToRemove = findPath(getParentPath(oldPath), query) as typeof query;
  const ruleToRemoveIndex = oldPath.at(-1)!;
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
    // real new path should therefore be one or two higher than `nextPath`.
    newNewPath[commonAncestorPath.length] -= independentCombinators ? 2 : 1;
  }
  const newNewParentPath = getParentPath(newNewPath);
  const parentToInsertInto = findPath(newNewParentPath, query) as typeof query;
  const newIndex = newNewPath.at(-1)!;

  /**
   * This function 1) glosses over the need for type assertions to splice directly
   * into `parentToInsertInto.rules`, and 2) shortens the actual insertion code.
   */
  // oxlint-disable-next-line typescript/no-explicit-any
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

  return query;
};

/**
 * Options for {@link insert}.
 *
 * @group Query Tools
 */
export interface InsertOptions extends AbortOptions {
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

export interface InsertMethod {
  <RG extends RuleGroupTypeAny>(
    /** The query to update. */
    query: RG,
    /** The rule or group to insert. */
    ruleOrGroup: RG | RuleType,
    /** Path at which to insert the rule or group. */
    path: number[],
    /** Options. */
    options?: InsertOptions
  ): RG;
}

/**
 * Inserts a rule or group into a query without mutating the original query.
 *
 * @returns A new query with the rule or group inserted.
 *
 * @group Query Tools
 */
export const insert: InsertMethod = (query, ruleOrGroup, path, options = {}): typeof query =>
  produce(query, q => insertInPlace(q, ruleOrGroup as RuleType, path, options));

/**
 * Inserts a rule or group into a query in place.
 *
 * @returns The query (mutated in place) with the rule or group inserted.
 *
 * @group Query Tools
 */
export const insertInPlace: InsertMethod = (
  query,
  ruleOrGroup,
  path,
  options = {}
): typeof query => {
  const {
    combinators = defaultCombinators,
    combinatorPreceding,
    combinatorSucceeding,
    idGenerator = generateID,
    replace = false,
    onAbort,
  } = options;

  const parentToInsertInto = findPath(getParentPath(path), query) as typeof query;
  if (!parentToInsertInto) {
    onAbort?.({ reason: 'parent-not-found', operation: 'insert', pathOrID: path });
    return query;
  }

  if (!isRuleGroup(parentToInsertInto)) {
    onAbort?.({ reason: 'parent-not-a-group', operation: 'insert', pathOrID: path });
    return query;
  }

  const parentPath = getParentPath(path);
  const insertGuardReason = getGuardAbortReason(query, parentPath, options, { asParent: true });
  if (insertGuardReason) {
    onAbort?.({ reason: insertGuardReason, operation: 'insert', pathOrID: path });
    return query;
  }

  if (isRuleGroup(ruleOrGroup) && exceedsMaxLevels(parentPath, options)) {
    onAbort?.({ reason: 'max-levels-exceeded', operation: 'insert', pathOrID: path });
    return query;
  }

  const rorg = regenerateIDs(ruleOrGroup, { idGenerator });
  const independentCombinators = isRuleGroupTypeIC(query);
  const newIndex = path.at(-1)!;

  /**
   * This function 1) glosses over the need for type assertions to splice directly
   * into `parentToInsertInto.rules`, and 2) shortens the actual insertion code.
   */
  // oxlint-disable-next-line typescript/no-explicit-any
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

  return query;
};

/**
 * Options for {@link group}.
 *
 * @group Query Tools
 */
export interface GroupOptions extends AbortOptions {
  /**
   * When `true`, the source rule/group will not be removed from its original path.
   */
  clone?: boolean;
  /**
   * If the query extends `RuleGroupTypeIC` (i.e. the query is using independent
   * combinators), then the first combinator in this list will be inserted between
   * the two rules/groups.
   */
  combinators?: OptionList;
  /**
   * ID generator.
   */
  idGenerator?: () => string;
}

export interface GroupMethod {
  <RG extends RuleGroupTypeAny>(
    /** The query to update. */
    query: RG,
    /** Path of the rule/group to move or clone. */
    sourcePathOrID: Path | string,
    /** Path of the target rule/group, which will become the path of the new group. */
    targetPathOrID: Path | string,
    /** Options. */
    options?: GroupOptions
  ): RG;
}

/**
 * Creates a new group at a target path with its `rules` array containing the current
 * objects at the target path and the source path without mutating the original query.
 * In the options parameter, pass `{ clone: true }` to copy the source rule/group instead of move.
 *
 * @returns A new query with the rules or groups grouped.
 *
 * @group Query Tools
 */
export const group: GroupMethod = (
  query,
  sourcePathOrID,
  targetPathOrID,
  options = {}
): typeof query => produce(query, q => groupInPlace(q, sourcePathOrID, targetPathOrID, options));

/**
 * Creates a new group at a target path with its `rules` array containing the current
 * objects at the target path and the source path in place.
 * In the options parameter, pass `{ clone: true }` to copy the source rule/group instead of move.
 *
 * @returns The query (mutated in place) with the rules or groups grouped.
 *
 * @group Query Tools
 */
export const groupInPlace: GroupMethod = (
  query,
  sourcePathOrID,
  targetPathOrID,
  options = {}
): typeof query => {
  const {
    clone = false,
    combinators = defaultCombinators,
    idGenerator = generateID,
    onAbort,
  } = options;
  const sourcePath = Array.isArray(sourcePathOrID)
    ? sourcePathOrID
    : getPathOfID(sourcePathOrID, query);
  const targetPath = Array.isArray(targetPathOrID)
    ? targetPathOrID
    : getPathOfID(targetPathOrID, query);

  // Ignore invalid paths/ids
  if (!sourcePath) {
    onAbort?.({ reason: 'target-not-found', operation: 'group', pathOrID: sourcePathOrID });
    return query;
  }

  if (!targetPath) {
    onAbort?.({ reason: 'target-not-found', operation: 'group', pathOrID: targetPathOrID });
    return query;
  }

  const nextPath = getNextPath(query, sourcePath, targetPath);

  // Can't group the root group
  if (sourcePath.length === 0) {
    onAbort?.({ reason: 'root-not-allowed', operation: 'group', pathOrID: sourcePathOrID });
    return query;
  }

  const groupGuardReason = getGuardAbortReason(query, sourcePath, options);
  if (groupGuardReason) {
    onAbort?.({ reason: groupGuardReason, operation: 'group', pathOrID: sourcePathOrID });
    return query;
  }

  // Don't move to the same location
  if (pathsAreEqual(sourcePath, nextPath)) {
    onAbort?.({ reason: 'same-location', operation: 'group', pathOrID: sourcePathOrID });
    return query;
  }

  // Don't move to a path that doesn't exist yet
  if (!findPath(getParentPath(nextPath), query)) {
    onAbort?.({ reason: 'destination-not-found', operation: 'group', pathOrID: targetPathOrID });
    return query;
  }

  const sourceRuleOrGroupOriginal = findPath(sourcePath, query);
  const targetRuleOrGroup = findPath(targetPath, query);
  if (!sourceRuleOrGroupOriginal) {
    onAbort?.({ reason: 'target-not-found', operation: 'group', pathOrID: sourcePathOrID });
    return query;
  }

  if (!targetRuleOrGroup) {
    onAbort?.({ reason: 'target-not-found', operation: 'group', pathOrID: targetPathOrID });
    return query;
  }
  const sourceRuleOrGroup = clone
    ? regenerateIDs(
        isDraft(sourceRuleOrGroupOriginal)
          ? current(sourceRuleOrGroupOriginal)
          : sourceRuleOrGroupOriginal,
        { idGenerator }
      )
    : sourceRuleOrGroupOriginal;

  const independentCombinators = isRuleGroupTypeIC(query);
  const parentOfRuleToRemove = findPath(getParentPath(sourcePath), query) as typeof query;
  const ruleToRemoveIndex = sourcePath.at(-1)!;

  // Remove the source item if not cloning
  if (!clone) {
    const idxStartDelete = independentCombinators
      ? Math.max(0, ruleToRemoveIndex - 1)
      : ruleToRemoveIndex;
    const deleteLength = independentCombinators ? 2 : 1;
    parentOfRuleToRemove.rules.splice(idxStartDelete, deleteLength);
  }

  const newNewPath = [...nextPath];
  const commonAncestorPath = getCommonAncestorPath(sourcePath, nextPath);
  if (
    !clone &&
    sourcePath.length === commonAncestorPath.length + 1 &&
    nextPath[commonAncestorPath.length] > sourcePath[commonAncestorPath.length]
  ) {
    // Getting here means there will be a shift of paths upward at the common
    // ancestor level because the object at `oldPath` will be spliced out. The
    // real new path should therefore be one or two higher than `newPathCalc`.
    newNewPath[commonAncestorPath.length] -= independentCombinators ? 2 : 1;
  }
  const newNewParentPath = getParentPath(newNewPath);
  const parentOfTargetPath = findPath(newNewParentPath, query) as typeof query;
  const targetPathIndex = newNewPath.at(-1)!;

  // Convert the target path to a group and insert the source and target items as children
  parentOfTargetPath.rules.splice(
    targetPathIndex,
    1,
    prepareRuleOrGroup(
      (independentCombinators
        ? { rules: [targetRuleOrGroup, getFirstOption(combinators), sourceRuleOrGroup] }
        : {
            combinator: getFirstOption(combinators),
            rules: [targetRuleOrGroup, sourceRuleOrGroup],
            // oxlint-disable-next-line typescript/no-explicit-any
          }) as any,
      { idGenerator }
      // oxlint-disable-next-line typescript/no-explicit-any
    ) as any
  );

  return query;
};
