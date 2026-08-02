import type {
  FullCombinator,
  FullField,
  FullOperator,
  FullOptionMap,
  GetOptionIdentifierType,
  GetRuleTypeFromGroupWithFieldAndOperator,
  MatchModeOptions,
  Path,
  QueryActions,
  QueryValidator,
  RuleGroupTypeAny,
  UpdateableProperties,
  ValidationMap,
  ValueSourceFullOptions,
} from '@react-querybuilder/core';
import {
  clsx,
  createQueryActions,
  generateAccessibleDescription,
  isRuleGroupTypeIC,
  resolveCandidateQuery,
  standardClassnames,
} from '@react-querybuilder/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useControlledOrUncontrolled, useDeprecatedProps, useUndoRedoWarning } from '../hooks/';
import { getQuerySelectorById, useQueryBuilderSelector } from '../redux';
import {
  _RQB_INTERNAL_dispatchThunk,
  registerDispatchQuery,
  registerQbId,
  unregisterDispatchQuery,
  unregisterQbId,
  useRQB_INTERNAL_QueryBuilderDispatch,
  useRQB_INTERNAL_QueryBuilderStore,
} from '../redux/_internal';
import type { SetQueryStateOptions } from '../redux/queriesSlice';
import { queriesSlice } from '../redux/queriesSlice';
import type { QueryBuilderProps, RuleGroupProps, Schema, TranslationsFull } from '../types';
import type { UseQueryBuilderSetup } from './QueryBuilder.useQueryBuilderSetup';

const defaultValidationResult: ReturnType<QueryValidator> = {};
const defaultValidationMap: ValidationMap = {};
const defaultDisabledPaths: Path[] = [];
const icCombinatorPropObject = {} as const;
const defaultGetValueEditorSeparator = () => null;
const defaultGetRuleOrGroupClassname = () => '';
const defaultOnAddMoveRemove = () => true;
const noopCleanup = () => {};
// v8 ignore next
const defaultOnLog = (...params: unknown[]) => {
  console.log(...params);
};

export type UseQueryBuilderSchema<
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
> = Pick<UseQueryBuilderSetup<RG, F, O, C>, 'rqbContext'> & {
  actions: QueryActions;
  rootGroup: RuleGroupTypeAny<GetRuleTypeFromGroupWithFieldAndOperator<RG, F, O>>;
  rootGroupDisabled: boolean;
  queryDisabled: boolean;
  schema: Schema<F, GetOptionIdentifierType<O>>;
  translations: TranslationsFull;
  wrapperClassName: string;
  dndEnabledAttr: string;
  inlineCombinatorsAttr: string;
  combinatorPropObject: Pick<RuleGroupProps, 'combinator'>;
};

/**
 * For given {@link QueryBuilderProps} and setup values from {@link useQueryBuilderSetup},
 * prepares and returns all values required to render a query builder.
 *
 * @group Hooks
 */
export function useQueryBuilderSchema<
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
>(
  props: QueryBuilderProps<RG, F, O, C>,
  setup: UseQueryBuilderSetup<RG, F, O, C>
): UseQueryBuilderSchema<RG, F, O, C> {
  type R = GetRuleTypeFromGroupWithFieldAndOperator<RG, F, O>;

  const {
    query: queryProp,
    defaultQuery: defaultQueryProp,
    getValueEditorSeparator = defaultGetValueEditorSeparator,
    getRuleClassname = defaultGetRuleOrGroupClassname,
    getRuleGroupClassname = defaultGetRuleOrGroupClassname,
    onAddRule = defaultOnAddMoveRemove,
    onAddGroup = defaultOnAddMoveRemove,
    onMoveRule = defaultOnAddMoveRemove,
    onMoveGroup = defaultOnAddMoveRemove,
    onGroupRule = defaultOnAddMoveRemove,
    onGroupGroup = defaultOnAddMoveRemove,
    onRemove = defaultOnAddMoveRemove,
    onQueryChange,
    showCombinatorsBetweenRules: showCombinatorsBetweenRulesProp = false,
    showNotToggle: showNotToggleProp = false,
    showShiftActions: showShiftActionsProp = false,
    showCloneButtons: showCloneButtonsProp = false,
    showLockButtons: showLockButtonsProp = false,
    showMuteButtons: showMuteButtonsProp = false,
    suppressStandardClassnames: suppressStandardClassnamesProp = false,
    preserveQueryStateOnUnmount: preserveQueryStateOnUnmountProp = false,
    resetOnFieldChange: resetOnFieldChangeProp = true,
    resetOnOperatorChange: resetOnOperatorChangeProp = false,
    autoSelectField: autoSelectFieldProp = true,
    autoSelectOperator: autoSelectOperatorProp = true,
    autoSelectValue: autoSelectValueProp = true,
    addRuleToNewGroups: addRuleToNewGroupsProp = false,
    listsAsArrays: listsAsArraysProp = false,
    parseNumbers = false,
    disabled = false,
    validator,
    onLog = defaultOnLog,
    idGenerator,
    accessibleDescriptionGenerator = generateAccessibleDescription,
  } = props;

  const {
    qbId,
    resolveQbIdCollision,
    rqbContext: incomingRqbContext,
    fields,
    fieldMap,
    combinators,
    getParameters,
    getOperatorsMain,
    getMatchModesMain,
    getRuleDefaultOperator,
    getSubQueryBuilderPropsMain,
    getValueEditorTypeMain,
    getValueSourcesMain,
    getValuesMain,
    getRuleDefaultValue,
    getInputTypeMain,
    createRule,
    createRuleGroup,
  } = setup;

  const {
    controlClassnames,
    controlElements: controls,
    debugMode,
    enableDragAndDrop,
    enableMountQueryChange,
    showUndoRedo: showUndoRedoContext,
    translations,
  } = incomingRqbContext;

  // #region Type coercions
  // oxlint-disable typescript/no-unnecessary-type-conversion
  const showCombinatorsBetweenRules = !!showCombinatorsBetweenRulesProp;
  const showNotToggle = !!showNotToggleProp;
  const showShiftActions = !!showShiftActionsProp;
  const showUndoRedo = !!showUndoRedoContext;
  const showCloneButtons = !!showCloneButtonsProp;
  const showLockButtons = !!showLockButtonsProp;
  const showMuteButtons = !!showMuteButtonsProp;
  const resetOnFieldChange = !!resetOnFieldChangeProp;
  const resetOnOperatorChange = !!resetOnOperatorChangeProp;
  const autoSelectField = !!autoSelectFieldProp;
  const autoSelectOperator = !!autoSelectOperatorProp;
  const autoSelectValue = !!autoSelectValueProp;
  const addRuleToNewGroups = !!addRuleToNewGroupsProp;
  const listsAsArrays = !!listsAsArraysProp;
  const suppressStandardClassnames = !!suppressStandardClassnamesProp;
  const preserveQueryStateOnUnmount = !!preserveQueryStateOnUnmountProp;
  const maxLevels = (props.maxLevels ?? 0) > 0 ? Number(props.maxLevels) : Infinity;
  // oxlint-enable typescript/no-unnecessary-type-conversion
  // #endregion

  const log = useCallback(
    (...params: unknown[]) => {
      if (debugMode) {
        onLog(...params);
      }
    },
    [debugMode, onLog]
  );

  useUndoRedoWarning(showUndoRedo, !!controls.undoRedoActions);

  // #region Controlled vs uncontrolled mode
  useControlledOrUncontrolled({
    defaultQuery: defaultQueryProp,
    queryProp,
  });

  const queryBuilderStore = useRQB_INTERNAL_QueryBuilderStore();
  const queryBuilderDispatch = useRQB_INTERNAL_QueryBuilderDispatch();

  const querySelector = useMemo(() => getQuerySelectorById(qbId), [qbId]);
  const storeQuery = useQueryBuilderSelector(querySelector);
  const getQuery = useCallback(
    () => querySelector(queryBuilderStore.getState()),
    [queryBuilderStore, querySelector]
  );

  const fallbackQuery = useMemo(() => createRuleGroup(), [createRuleGroup]);

  const rootGroup = resolveCandidateQuery(
    {
      query: queryProp,
      storeQuery,
      defaultQuery: defaultQueryProp,
      fallbackQuery,
    },
    { idGenerator }
  ) as RuleGroupTypeAny<R>;

  const [initialQuery] = useState(rootGroup);
  const rqbContext = useMemo(
    () => ({ ...incomingRqbContext, initialQuery }),
    [incomingRqbContext, initialQuery]
  );

  // If a new `query` prop is passed in that doesn't match the query in the store,
  // update the store to match the prop _without_ calling `onQueryChange`.
  useEffect(() => {
    if (!!queryProp && !Object.is(queryProp, storeQuery)) {
      queryBuilderDispatch(
        _RQB_INTERNAL_dispatchThunk({
          payload: { qbId, query: queryProp },
          onQueryChange: undefined,
        })
      );
    }
  }, [queryProp, qbId, storeQuery, queryBuilderDispatch]);

  const independentCombinators = useMemo(() => isRuleGroupTypeIC(rootGroup), [rootGroup]);
  const invalidIC = !!props.independentCombinators && !independentCombinators;
  useDeprecatedProps(
    'independentCombinators',
    invalidIC || (!invalidIC && (props.independentCombinators ?? 'not present') !== 'not present'),
    invalidIC ? 'invalid' : 'unnecessary'
  );

  const hasRunMountQueryChange = useRef(false);
  useEffect(() => {
    if (hasRunMountQueryChange.current) return;
    hasRunMountQueryChange.current = true;
    queryBuilderDispatch(
      _RQB_INTERNAL_dispatchThunk({
        payload: { qbId, query: rootGroup },
        onQueryChange:
          // Leave `onQueryChange` undefined if `enableMountQueryChange` is disabled
          enableMountQueryChange && typeof onQueryChange === 'function' ? onQueryChange : undefined,
      })
    );
  }, [enableMountQueryChange, onQueryChange, qbId, queryBuilderDispatch, rootGroup]);

  // Keep the latest query available to the registration effect below without adding it to that
  // effect's dependency array (which would cause register/unregister churn on every change).
  // Assigned in an effect rather than during render so that the ref is never written to while
  // rendering.
  const rootGroupRef = useRef(rootGroup);
  useEffect(() => {
    rootGroupRef.current = rootGroup;
  }, [rootGroup]);

  // Also read through a ref instead of a dependency. As a dependency, toggling this prop would
  // tear down and re-run the registration effect even though nothing unmounted: the cleanup
  // would run with the stale value, dispatch `unsetQueryState`, and destroy any recorded
  // undo/redo history for this query builder.
  const preserveQueryStateOnUnmountRef = useRef(preserveQueryStateOnUnmount);
  useEffect(() => {
    preserveQueryStateOnUnmountRef.current = preserveQueryStateOnUnmount;
  }, [preserveQueryStateOnUnmount]);

  // Track this instance in the `qbId` registry, and tear down the query state when the last
  // instance using this `qbId` unmounts (unless `preserveQueryStateOnUnmount` is `true`).
  useEffect(() => {
    if (registerQbId(qbId) > 1) {
      // Another mounted query builder is already using this `qbId`. Give up the identifier
      // immediately and switch to a generated one; the effect will run again with the new
      // `qbId`. No cleanup is returned because this instance never took ownership.
      //
      // TODO: Decide whether the fallback instance should re-seed from its own `query`/
      // `defaultQuery` prop instead of the query it inherited from the `qbId` it collided with.
      // Because `candidateQuery` prefers `storeQuery` over `defaultQuery`, this instance
      // adopted the _other_ query builder's query during render, so `rootGroupRef.current`
      // (used by the re-seed below) holds that query rather than this instance's own initial
      // query. The net effect is that a query builder that loses a `qbId` collision silently
      // ignores its own `defaultQuery`. That only happens on an error path that already logs
      // `messages.errorDuplicateQbId`, but it is arguably surprising. Pinned by the
      // "does not clobber the existing query when a duplicate qbId is used" test.
      unregisterQbId(qbId);
      resolveQbIdCollision();
      return noopCleanup;
    }

    // Re-seed the store if a previous teardown removed this query. This happens in React's
    // StrictMode, where effects are mounted, cleaned up, and mounted again: the cleanup below
    // removes the query, but the mount-query-change effect above will not re-dispatch it
    // because its `hasRunMountQueryChange` ref persists across the double-invocation.
    if (!querySelector(queryBuilderStore.getState())) {
      queryBuilderDispatch(
        _RQB_INTERNAL_dispatchThunk({
          payload: { qbId, query: rootGroupRef.current },
          onQueryChange: undefined,
        })
      );
    }

    return () => {
      if (unregisterQbId(qbId) === 0 && !preserveQueryStateOnUnmountRef.current) {
        queryBuilderDispatch(queriesSlice.actions.unsetQueryState({ qbId }));
      }
    };
  }, [qbId, queryBuilderDispatch, queryBuilderStore, querySelector, resolveQbIdCollision]);

  /**
   * Updates the redux-based query, then calls `onQueryChange` with the updated
   * query object. NOTE: `useCallback` is only effective here when the user's
   * `onQueryChange` handler is undefined or has a stable reference, which usually
   * means that it's wrapped in its own `useCallback`.
   */
  const dispatchQuery = useCallback(
    (newQuery: RuleGroupTypeAny, options?: SetQueryStateOptions) => {
      queryBuilderDispatch(
        _RQB_INTERNAL_dispatchThunk({ payload: { qbId, query: newQuery }, onQueryChange, options })
      );
    },
    [onQueryChange, qbId, queryBuilderDispatch]
  );

  // Publish `dispatchQuery` so that code outside this component tree (e.g. an external toolbar
  // or the undo/redo hook from `react-querybuilder/history`) can apply a query to this query
  // builder addressed only by its `qbId`. A stable wrapper is registered so that the identity
  // of `dispatchQuery`—which changes whenever `onQueryChange` does—never causes churn.
  const dispatchQueryRef = useRef(dispatchQuery);
  useEffect(() => {
    dispatchQueryRef.current = dispatchQuery;
  }, [dispatchQuery]);
  useEffect(() => {
    registerDispatchQuery(qbId, (query, options) => dispatchQueryRef.current(query, options));
    return () => unregisterDispatchQuery(qbId);
  }, [qbId]);
  // #endregion

  // #region Query update methods
  const disabledPaths = (Array.isArray(disabled) && disabled) || defaultDisabledPaths;
  const queryDisabled = disabled === true;
  const rootGroupDisabled = rootGroup.disabled || disabledPaths.some(p => p.length === 0);

  const actionsCore = useMemo(
    () =>
      createQueryActions({
        qbId,
        combinators,
        idGenerator,
        maxLevels,
        queryDisabled,
        resetOnFieldChange,
        resetOnOperatorChange,
        getRuleDefaultOperator: getRuleDefaultOperator as (field: string) => string,
        getValueSources: getValueSourcesMain as (
          field: string,
          operator: string
        ) => ValueSourceFullOptions,
        getRuleDefaultValue,
        getMatchModes: getMatchModesMain as (field: string) => MatchModeOptions,
        onAddRule,
        onAddGroup,
        onRemove,
        onMoveRule,
        onMoveGroup,
        onGroupRule,
        onGroupGroup,
        onLog: log,
      }),
    [
      combinators,
      getMatchModesMain,
      getRuleDefaultOperator,
      getRuleDefaultValue,
      getValueSourcesMain,
      idGenerator,
      log,
      maxLevels,
      onAddGroup,
      onAddRule,
      onGroupGroup,
      onGroupRule,
      onMoveGroup,
      onMoveRule,
      onRemove,
      qbId,
      queryDisabled,
      resetOnFieldChange,
      resetOnOperatorChange,
    ]
  );

  /**
   * Reads the current query from the store, runs `action`, and dispatches the result. The store
   * read keeps the handlers stable across query changes and free of stale closures.
   */
  const runAction = useCallback(
    (action: (query: RG) => RuleGroupTypeAny | undefined) => {
      const queryLocal = getQuerySelectorById(qbId)(queryBuilderStore.getState()) as RG;
      // v8 ignore if
      if (!queryLocal) return;
      const newQuery = action(queryLocal);
      if (newQuery) dispatchQuery(newQuery as RG);
    },
    [dispatchQuery, qbId, queryBuilderStore]
  );

  const onRuleAdd = useCallback(
    // oxlint-disable-next-line typescript/no-explicit-any
    (rule: R, parentPath: Path, context?: any) => {
      runAction(query => actionsCore.addRule(query, rule, parentPath, context));
    },
    [actionsCore, runAction]
  );

  const onGroupAdd = useCallback(
    // oxlint-disable-next-line typescript/no-explicit-any
    (ruleGroup: RG, parentPath: Path, context?: any) => {
      runAction(query => actionsCore.addGroup(query, ruleGroup, parentPath, context));
    },
    [actionsCore, runAction]
  );

  const onPropChange = useCallback(
    // oxlint-disable-next-line typescript/no-explicit-any
    (prop: UpdateableProperties, value: any, path: Path) => {
      runAction(query => actionsCore.propChange(query, prop, value, path));
    },
    [actionsCore, runAction]
  );

  const onRuleOrGroupRemove = useCallback(
    // oxlint-disable-next-line typescript/no-explicit-any
    (path: Path, context?: any) => {
      runAction(query => actionsCore.removeRuleOrGroup(query, path, context));
    },
    [actionsCore, runAction]
  );

  const moveRule = useCallback(
    // oxlint-disable-next-line typescript/no-explicit-any
    (oldPath: Path, newPath: Path | 'up' | 'down', clone?: boolean, context?: any) => {
      runAction(query => actionsCore.moveRule(query, oldPath, newPath, clone, context));
    },
    [actionsCore, runAction]
  );

  const groupRule = useCallback(
    // oxlint-disable-next-line typescript/no-explicit-any
    (sourcePath: Path, targetPath: Path, clone?: boolean, context?: any) => {
      runAction(query => actionsCore.groupRule(query, sourcePath, targetPath, clone, context));
    },
    [actionsCore, runAction]
  );

  // #endregion

  // #region Validation
  const { validationResult, validationMap } = useMemo(() => {
    const vr =
      typeof validator === 'function' && rootGroup ? validator(rootGroup) : defaultValidationResult;
    const valMap = typeof vr === 'boolean' ? defaultValidationMap : vr;
    return { validationResult: vr, validationMap: valMap };
  }, [rootGroup, validator]);
  // #endregion

  // #region Miscellaneous
  const dndEnabledAttr = enableDragAndDrop ? 'enabled' : 'disabled';
  const inlineCombinatorsAttr =
    independentCombinators || showCombinatorsBetweenRules ? 'enabled' : 'disabled';
  const combinatorPropObject: Pick<RuleGroupProps, 'combinator'> = useMemo(
    () =>
      typeof rootGroup.combinator === 'string'
        ? { combinator: rootGroup.combinator }
        : icCombinatorPropObject,
    [rootGroup.combinator]
  );
  const wrapperClassName = useMemo(
    () =>
      clsx(
        suppressStandardClassnames || standardClassnames.queryBuilder,
        clsx(controlClassnames.queryBuilder),
        // custom conditional classes
        queryDisabled && controlClassnames.disabled,
        typeof validationResult === 'boolean' && validationResult && controlClassnames.valid,
        typeof validationResult === 'boolean' && !validationResult && controlClassnames.invalid,
        // standard conditional classes
        suppressStandardClassnames || {
          [standardClassnames.disabled]: queryDisabled,
          [standardClassnames.valid]: typeof validationResult === 'boolean' && validationResult,
          [standardClassnames.invalid]: typeof validationResult === 'boolean' && !validationResult,
        }
      ),
    [
      controlClassnames.disabled,
      controlClassnames.invalid,
      controlClassnames.queryBuilder,
      controlClassnames.valid,
      queryDisabled,
      suppressStandardClassnames,
      validationResult,
    ]
  );
  // #endregion

  // #region Setup overrides
  /**
   * This function overrides `createRuleGroup` from `useQueryBuilderSetup`, removing the
   * requirement to pass a `boolean` parameter. If `independentCombinators` is `true`, it will
   * always create a `RuleGroupTypeIC` even if called with no parameters. (We have to override
   * it here because `independentCombinators` is not evaluated in `useQueryBuilderSetup`.)
   */
  const createRuleGroupOverride = useCallback(
    (ic?: boolean) => createRuleGroup(ic ?? independentCombinators),
    [createRuleGroup, independentCombinators]
  );
  // #endregion

  // #region Schema/actions
  const schema = useMemo(
    (): Schema<F, GetOptionIdentifierType<O>> => ({
      addRuleToNewGroups,
      accessibleDescriptionGenerator,
      autoSelectField,
      autoSelectOperator,
      autoSelectValue,
      classNames: controlClassnames,
      combinators,
      getParameters,
      controls,
      createRule,
      createRuleGroup: createRuleGroupOverride,
      disabledPaths,
      enableDragAndDrop,
      fieldMap: fieldMap as FullOptionMap<F>,
      fields,
      dispatchQuery,
      getQuery,
      getInputType: getInputTypeMain,
      getOperators: getOperatorsMain,
      getMatchModes: getMatchModesMain,
      getRuleClassname,
      getRuleDefaultOperator: getRuleDefaultOperator as (field: string) => string,
      getRuleDefaultValue,
      getRuleGroupClassname,
      getSubQueryBuilderProps: getSubQueryBuilderPropsMain,
      getValueEditorSeparator,
      getValueEditorType: getValueEditorTypeMain,
      getValues: getValuesMain,
      getValueSources: getValueSourcesMain,
      independentCombinators,
      listsAsArrays,
      maxLevels,
      parseNumbers,
      qbId,
      resetOnFieldChange,
      resetOnOperatorChange,
      showCloneButtons,
      showCombinatorsBetweenRules,
      showLockButtons,
      showMuteButtons,
      showNotToggle,
      showShiftActions,
      showUndoRedo,
      suppressStandardClassnames,
      validationMap,
    }),
    [
      accessibleDescriptionGenerator,
      addRuleToNewGroups,
      autoSelectField,
      autoSelectOperator,
      autoSelectValue,
      combinators,
      controlClassnames,
      controls,
      createRule,
      createRuleGroupOverride,
      disabledPaths,
      dispatchQuery,
      enableDragAndDrop,
      fieldMap,
      fields,
      getInputTypeMain,
      getOperatorsMain,
      getMatchModesMain,
      getQuery,
      getRuleClassname,
      getRuleDefaultOperator,
      getRuleDefaultValue,
      getRuleGroupClassname,
      getSubQueryBuilderPropsMain,
      getValueEditorSeparator,
      getValueEditorTypeMain,
      getValuesMain,
      getValueSourcesMain,
      getParameters,
      independentCombinators,
      listsAsArrays,
      maxLevels,
      parseNumbers,
      qbId,
      resetOnFieldChange,
      resetOnOperatorChange,
      showCloneButtons,
      showCombinatorsBetweenRules,
      showLockButtons,
      showMuteButtons,
      showNotToggle,
      showShiftActions,
      showUndoRedo,
      suppressStandardClassnames,
      validationMap,
    ]
  );

  const actions = useMemo(
    (): QueryActions => ({
      moveRule,
      onGroupAdd,
      onGroupRemove: onRuleOrGroupRemove,
      onPropChange,
      onRuleAdd,
      onRuleRemove: onRuleOrGroupRemove,
      groupRule,
    }),
    [groupRule, moveRule, onGroupAdd, onPropChange, onRuleAdd, onRuleOrGroupRemove]
  );
  // #endregion

  return {
    actions,
    rootGroup,
    rootGroupDisabled,
    queryDisabled,
    rqbContext,
    schema,
    translations,
    wrapperClassName,
    dndEnabledAttr,
    inlineCombinatorsAttr,
    combinatorPropObject,
  };
}
