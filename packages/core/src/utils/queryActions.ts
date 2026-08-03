import { LogType } from '../defaults';
import type {
  MatchModeOptions,
  OptionList,
  Path,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleType,
  UpdateableProperties,
  ValueSourceFullOptions,
} from '../types';
import { isRuleGroup } from './isRuleGroup';
import { findPath } from './pathUtils';
import { add, getGuardAbortReason, group, move, remove, update } from './queryTools';

/* oxlint-disable typescript/no-explicit-any */

/**
 * Confirmation callbacks invoked before a mutation is applied. Their return values are
 * interpreted differently depending on the operation:
 *
 * - `onAddRule`/`onAddGroup` may return `true` to proceed, a falsy value to cancel, or a
 *   _replacement rule/group_ to add instead of the one provided.
 * - `onMoveRule`/`onMoveGroup`/`onGroupRule`/`onGroupGroup` may return `true` to proceed, a
 *   falsy value to cancel, or a _replacement query_ to apply instead of the computed one.
 * - `onRemove` is boolean only.
 *
 * @group Query Tools
 */
export interface QueryActionCallbacks {
  onAddRule?: (rule: RuleType, parentPath: Path, query: any, context?: any) => RuleType | boolean;
  onAddGroup?: (
    ruleGroup: any,
    parentPath: Path,
    query: any,
    context?: any
  ) => RuleGroupTypeAny | boolean;
  onRemove?: (ruleOrGroup: any, path: Path, query: any, context?: any) => boolean;
  onMoveRule?: (...args: any[]) => RuleGroupTypeAny | boolean;
  onMoveGroup?: (...args: any[]) => RuleGroupTypeAny | boolean;
  onGroupRule?: (...args: any[]) => RuleGroupTypeAny | boolean;
  onGroupGroup?: (...args: any[]) => RuleGroupTypeAny | boolean;
}

/**
 * Configuration for {@link createQueryActions}.
 *
 * @group Query Tools
 */
export interface QueryActionsConfig extends QueryActionCallbacks {
  /** Identifier included in every log payload. */
  qbId?: string;
  combinators?: OptionList;
  idGenerator?: () => string;
  /** The maximum depth at which groups may be added. Defaults to `Infinity`. */
  maxLevels?: number;
  /** Abort every mutation, as though the entire query were disabled. */
  queryDisabled?: boolean;
  /**
   * Honor `disabled` properties within the query. Defaults to `true`, matching the
   * `QueryBuilder` component; a node's own `disabled` property can always be changed.
   */
  respectDisabled?: boolean;
  /**
   * Paths disabled by position rather than by a `disabled` property on the node itself, mirroring
   * the array form of the `QueryBuilder` `disabled` prop. Honored only when `respectDisabled` is
   * `true`; as with the `disabled` property, a node's own `disabled` can always be changed.
   */
  disabledPaths?: Path[];
  resetOnFieldChange?: boolean;
  resetOnOperatorChange?: boolean;
  getRuleDefaultOperator?: (field: string) => string;
  getValueSources?: (field: string, operator: string) => ValueSourceFullOptions;
  getRuleDefaultValue?: (rule: RuleType) => any;
  getMatchModes?: (field: string) => MatchModeOptions;
  /** Receives a structured event for every action, applied or aborted. */
  onLog?: (payload: Record<string, any>) => void;
}

/**
 * The six mutations a query builder performs. Each takes the current query and returns the next
 * one, or `undefined` when the mutation was aborted—because the target is disabled, a
 * confirmation callback declined, or a depth limit was reached.
 *
 * @group Query Tools
 */
export interface QueryActionHandlers {
  addRule: (query: any, rule: RuleType, parentPath: Path, context?: any) => any;
  addGroup: (query: any, ruleGroup: any, parentPath: Path, context?: any) => any;
  propChange: (query: any, prop: UpdateableProperties, value: any, path: Path) => any;
  removeRuleOrGroup: (query: any, path: Path, context?: any) => any;
  moveRule: (
    query: any,
    oldPath: Path,
    newPath: Path | 'up' | 'down',
    clone?: boolean,
    context?: any
  ) => any;
  groupRule: (
    query: any,
    sourcePath: Path,
    targetPath: Path,
    clone?: boolean,
    context?: any
  ) => any;
}

/**
 * Builds the query builder's six mutation handlers as pure functions of the current query.
 *
 * This is the framework-agnostic core of the action handlers in `useQueryBuilderSchema`. It owns
 * the policy that surrounds the query tools—disabled gating, the confirmation callback protocol,
 * `maxLevels`, and debug logging—so an implementation only has to supply its own storage: read
 * the current query, call the action, and apply a non-`undefined` result.
 *
 * @group Query Tools
 */
export const createQueryActions = (config: QueryActionsConfig = {}): QueryActionHandlers => {
  const {
    qbId,
    combinators,
    idGenerator,
    maxLevels = Infinity,
    queryDisabled,
    respectDisabled = true,
    disabledPaths,
    resetOnFieldChange,
    resetOnOperatorChange,
    getRuleDefaultOperator,
    getValueSources,
    getRuleDefaultValue,
    getMatchModes,
    onAddRule,
    onAddGroup,
    onRemove,
    onMoveRule,
    onMoveGroup,
    onGroupRule,
    onGroupGroup,
    onLog,
  } = config;

  const log = (payload: Record<string, any>) => onLog?.({ qbId, ...payload });

  const guards = { respectDisabled, queryDisabled, disabledPaths };

  /** Whether the mutation is blocked, using the same rules the query tools apply internally. */
  const blocked = (query: RuleGroupTypeAny, path: Path, asParent = false) =>
    !!getGuardAbortReason(query, path, guards, { asParent });

  return {
    addRule: (query, rule, parentPath, context) => {
      if (blocked(query, parentPath, true)) {
        log({ type: LogType.parentPathDisabled, rule, parentPath, query });
        return undefined;
      }

      const nextRule = onAddRule ? onAddRule(rule, parentPath, query, context) : true;
      if (!nextRule) {
        log({ type: LogType.onAddRuleFalse, rule, parentPath, query });
        return undefined;
      }

      const newRule = nextRule === true ? rule : nextRule;
      const newQuery = add(query, newRule, parentPath, {
        combinators,
        combinatorPreceding: (newRule as unknown as RuleGroupTypeIC).combinatorPreceding,
        idGenerator,
      });
      log({ type: LogType.add, query, newQuery, newRule, parentPath });
      return newQuery;
    },

    addGroup: (query, ruleGroup, parentPath, context) => {
      // Depth is checked before anything else, and is deliberately not logged.
      if (parentPath.length >= maxLevels) return undefined;

      if (blocked(query, parentPath, true)) {
        log({ type: LogType.parentPathDisabled, ruleGroup, parentPath, query });
        return undefined;
      }

      const nextGroup = onAddGroup ? onAddGroup(ruleGroup, parentPath, query, context) : true;
      if (!nextGroup) {
        log({ type: LogType.onAddGroupFalse, ruleGroup, parentPath, query });
        return undefined;
      }

      const newGroup = nextGroup === true ? ruleGroup : nextGroup;
      const newQuery = add(query, newGroup, parentPath, {
        combinators,
        combinatorPreceding: (newGroup as RuleGroupTypeIC).combinatorPreceding ?? undefined,
        idGenerator,
      });
      log({ type: LogType.add, query, newQuery, newGroup, parentPath });
      return newQuery;
    },

    propChange: (query, prop, value, path) => {
      // Changing `disabled` is exempt from the path check—otherwise a disabled node could never
      // be re-enabled—but `queryDisabled` still blocks it.
      const propGuards = prop === 'disabled' ? { queryDisabled } : guards;
      if (getGuardAbortReason(query, path, propGuards)) {
        log({ type: LogType.pathDisabled, path, prop, value, query });
        return undefined;
      }

      const newQuery = update(query, prop, value, path, {
        resetOnFieldChange,
        resetOnOperatorChange,
        getRuleDefaultOperator,
        getValueSources,
        getRuleDefaultValue,
        getMatchModes,
      });
      log({ type: LogType.update, query, newQuery, prop, value, path });
      return newQuery;
    },

    removeRuleOrGroup: (query, path, context) => {
      if (blocked(query, path)) {
        log({ type: LogType.pathDisabled, path, query });
        return undefined;
      }

      const ruleOrGroup = findPath(path, query);
      /* v8 ignore next -- @preserve */
      if (!ruleOrGroup) return undefined;

      if (onRemove && !onRemove(ruleOrGroup, path, query, context)) {
        log({ type: LogType.onRemoveFalse, ruleOrGroup, path, query });
        return undefined;
      }

      const newQuery = remove(query, path);
      log({ type: LogType.remove, query, newQuery, path, ruleOrGroup });
      return newQuery;
    },

    moveRule: (query, oldPath, newPath, clone, context) => {
      if (blocked(query, oldPath)) {
        log({ type: LogType.pathDisabled, oldPath, newPath, query });
        return undefined;
      }

      // A path that no longer resolves isn't caught by the guards, so confirm it before
      // computing anything or handing a null node to the callback.
      const ruleOrGroup = findPath(oldPath, query);
      if (!ruleOrGroup) return undefined;

      // Computed before the callback so it can inspect the prospective result.
      const nextQuery = move(query, oldPath, newPath, { clone, combinators, idGenerator });
      const isGroup = isRuleGroup(ruleOrGroup);
      const callback = isGroup ? onMoveGroup : onMoveRule;
      const callbackResult = callback
        ? callback(ruleOrGroup, oldPath, newPath, query, nextQuery, { clone, combinators }, context)
        : true;

      if (!callbackResult) {
        log({
          type: isGroup ? LogType.onMoveGroupFalse : LogType.onMoveRuleFalse,
          ruleOrGroup,
          oldPath,
          newPath,
          clone,
          query,
          nextQuery,
        });
        return undefined;
      }

      const newQuery = isRuleGroup(callbackResult) ? callbackResult : nextQuery;
      log({ type: LogType.move, query, newQuery, oldPath, newPath, clone });
      return newQuery;
    },

    groupRule: (query, sourcePath, targetPath, clone, context) => {
      if (blocked(query, sourcePath)) {
        log({ type: LogType.pathDisabled, sourcePath, targetPath, query });
        return undefined;
      }

      // A path that no longer resolves isn't caught by the guards, so confirm it before
      // computing anything or handing a null node to the callback.
      const ruleOrGroup = findPath(sourcePath, query);
      if (!ruleOrGroup) return undefined;

      // Computed before the callback so it can inspect the prospective result.
      const nextQuery = group(query, sourcePath, targetPath, { clone, combinators, idGenerator });
      const isGroup = isRuleGroup(ruleOrGroup);
      const callback = isGroup ? onGroupGroup : onGroupRule;
      const callbackResult = callback
        ? callback(
            ruleOrGroup,
            sourcePath,
            targetPath,
            query,
            nextQuery,
            { clone, combinators },
            context
          )
        : true;

      if (!callbackResult) {
        log({
          type: isGroup ? LogType.onGroupGroupFalse : LogType.onGroupRuleFalse,
          ruleOrGroup,
          sourcePath,
          targetPath,
          clone,
          query,
          nextQuery,
        });
        return undefined;
      }

      const newQuery = isRuleGroup(callbackResult) ? callbackResult : nextQuery;
      log({ type: LogType.group, query, newQuery, sourcePath, targetPath, clone });
      return newQuery;
    },
  };
};
