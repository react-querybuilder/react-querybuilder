import { clsx } from 'clsx';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { LogType, defaultCombinators, standardClassnames } from '../defaults';
import type { RootState } from '../redux';
import {
  getReduxQuery,
  setReduxQuery,
  useAppDispatch,
  useAppSelector,
  useAppStore,
} from '../redux';
import type {
  QueryActions,
  QueryBuilderProps,
  QueryValidator,
  RuleGroupProps,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleType,
  Schema,
  UpdateableProperties,
  ValidationMap,
} from '../types';
import { add, findPath, move, pathIsDisabled, prepareRuleGroup, remove, update } from '../utils';
import type { useQueryBuilderSetup } from './useQueryBuilderSetup';

const defaultValidationResult: ReturnType<QueryValidator> = {};
const defaultValidationMap: ValidationMap = {};

export const useQueryBuilder = <RG extends RuleGroupType | RuleGroupTypeIC>(
  props: QueryBuilderProps<RG>,
  setup: ReturnType<typeof useQueryBuilderSetup<RG>>
) => {
  const {
    query: queryProp,
    defaultQuery: defaultQueryProp,
    combinators = defaultCombinators,
    getValueEditorSeparator = () => null,
    getRuleClassname = () => '',
    getRuleGroupClassname = () => '',
    onAddRule = r => r,
    onAddGroup = rg => rg,
    onRemove = () => true,
    onQueryChange,
    independentCombinators: icProp,
    showCombinatorsBetweenRules: showCombinatorsBetweenRulesProp = false,
    showNotToggle: showNotToggleProp = false,
    showCloneButtons: showCloneButtonsProp = false,
    showLockButtons: showLockButtonsProp = false,
    resetOnFieldChange: resetOnFieldChangeProp = true,
    resetOnOperatorChange: resetOnOperatorChangeProp = false,
    autoSelectField: autoSelectFieldProp = true,
    autoSelectOperator: autoSelectOperatorProp = true,
    addRuleToNewGroups: addRuleToNewGroupsProp = false,
    listsAsArrays: listsAsArraysProp = false,
    parseNumbers = false,
    disabled = false,
    validator,
    onLog = console.log,
    idGenerator,
  } = props as QueryBuilderProps<RG>;

  const {
    qbId,
    rqbContext,
    initialQuery,
    fields,
    fieldMap,
    getOperatorsMain,
    getRuleDefaultOperator,
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
    controlElements,
    debugMode,
    enableDragAndDrop,
    enableMountQueryChange,
    translations,
  } = rqbContext;

  const isFirstRender = useRef(true);

  // #region Boolean coercion
  const independentCombinators = !!icProp;
  const showCombinatorsBetweenRules = !!showCombinatorsBetweenRulesProp;
  const showNotToggle = !!showNotToggleProp;
  const showCloneButtons = !!showCloneButtonsProp;
  const showLockButtons = !!showLockButtonsProp;
  const resetOnFieldChange = !!resetOnFieldChangeProp;
  const resetOnOperatorChange = !!resetOnOperatorChangeProp;
  const autoSelectField = !!autoSelectFieldProp;
  const autoSelectOperator = !!autoSelectOperatorProp;
  const addRuleToNewGroups = !!addRuleToNewGroupsProp;
  const listsAsArrays = !!listsAsArraysProp;
  // #endregion

  // #region Handle controlled mode vs uncontrolled mode
  const reduxStore = useAppStore();
  const reduxDispatch = useAppDispatch();

  const querySelector = useCallback(
    (state: RootState) => getReduxQuery(state, setup.qbId),
    [setup.qbId]
  );
  const reduxQuery = useAppSelector(querySelector);

  // We assume here that if this is not the first render, the query has already
  // been prepared. If `preliminaryQuery === query`, the user is probably
  // passing back the parameter from the `onQueryChange` callback.
  const preliminaryQuery = queryProp ?? reduxQuery ?? defaultQueryProp ?? initialQuery;
  const rootQuery = isFirstRender.current
    ? prepareRuleGroup(preliminaryQuery, { idGenerator })
    : preliminaryQuery;

  // Run `onQueryChange` on mount, if enabled
  useEffect(() => {
    if (enableMountQueryChange && typeof onQueryChange === 'function') {
      onQueryChange(rootQuery as RG);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Updates the redux-based query if the component is uncontrolled, then calls
   * `onQueryChange` with the updated query object. (`useCallback` is only effective
   * here when the user's `onQueryChange` handler is undefined or has a stable reference,
   * which usually means that it's wrapped in its own `useCallback`).
   */
  const dispatch = useCallback(
    (newQuery: RG) => {
      reduxDispatch(setReduxQuery({ qbId, query: newQuery }));
      if (typeof onQueryChange === 'function') {
        onQueryChange(newQuery);
      }
    },
    [onQueryChange, qbId, reduxDispatch]
  );
  // #endregion

  // #region Query update methods
  const queryDotDisabled = !!rootQuery.disabled;
  const queryDisabled = useMemo(
    () =>
      disabled === true ||
      queryDotDisabled ||
      (Array.isArray(disabled) && disabled.some(p => p.length === 0)),
    [disabled, queryDotDisabled]
  );
  const disabledPaths = useMemo(() => (Array.isArray(disabled) && disabled) || [], [disabled]);

  const onRuleAdd = useCallback(
    (rule: RuleType, parentPath: number[], context?: any) => {
      const queryLocal = getReduxQuery(reduxStore.getState(), qbId) as RG;
      if (pathIsDisabled(parentPath, queryLocal) || queryDisabled) {
        // istanbul ignore else
        if (debugMode) {
          onLog({ type: LogType.parentPathDisabled, rule, parentPath, query: queryLocal });
        }
        return;
      }
      const newRule = onAddRule(rule, parentPath, queryLocal, context);
      if (!newRule) {
        // istanbul ignore else
        if (debugMode) {
          onLog({ type: LogType.onAddRuleFalse, rule, parentPath, query: queryLocal });
        }
        return;
      }
      const newQuery = add(queryLocal, newRule, parentPath, {
        combinators,
        combinatorPreceding: newRule.combinatorPreceding ?? undefined,
      });
      if (debugMode) {
        onLog({ type: LogType.add, query: queryLocal, newQuery, newRule, parentPath });
      }
      dispatch(newQuery);
    },
    [combinators, debugMode, dispatch, onAddRule, onLog, qbId, queryDisabled, reduxStore]
  );

  const onGroupAdd = useCallback(
    (ruleGroup: RG, parentPath: number[], context?: any) => {
      const queryLocal = getReduxQuery(reduxStore.getState(), qbId) as RG;
      if (pathIsDisabled(parentPath, queryLocal) || queryDisabled) {
        // istanbul ignore else
        if (debugMode) {
          onLog({
            type: LogType.parentPathDisabled,
            ruleGroup,
            parentPath,
            query: queryLocal,
          });
        }
        return;
      }
      const newGroup = onAddGroup(ruleGroup, parentPath, queryLocal, context);
      if (!newGroup) {
        // istanbul ignore else
        if (debugMode) {
          onLog({ type: LogType.onAddGroupFalse, ruleGroup, parentPath, query: queryLocal });
        }
        return;
      }
      const newQuery = add(queryLocal, newGroup, parentPath, {
        combinators,
        combinatorPreceding: (newGroup as RuleGroupTypeIC).combinatorPreceding ?? undefined,
      });
      if (debugMode) {
        onLog({ type: LogType.add, query: queryLocal, newQuery, newGroup, parentPath });
      }
      dispatch(newQuery);
    },
    [combinators, debugMode, dispatch, onAddGroup, onLog, qbId, queryDisabled, reduxStore]
  );

  const onPropChange = useCallback(
    (prop: UpdateableProperties, value: any, path: number[]) => {
      const queryLocal = getReduxQuery(reduxStore.getState(), qbId) as RG;
      if ((pathIsDisabled(path, queryLocal) && prop !== 'disabled') || queryDisabled) {
        if (debugMode) {
          onLog({ type: LogType.pathDisabled, path, prop, value, query: queryLocal });
        }
        return;
      }
      const newQuery = update(queryLocal, prop, value, path, {
        resetOnFieldChange,
        resetOnOperatorChange,
        getRuleDefaultOperator,
        getValueSources: getValueSourcesMain,
        getRuleDefaultValue,
      });
      if (debugMode) {
        onLog({ type: LogType.update, query: queryLocal, newQuery, prop, value, path });
      }
      dispatch(newQuery);
    },
    [
      debugMode,
      dispatch,
      getRuleDefaultOperator,
      getRuleDefaultValue,
      getValueSourcesMain,
      onLog,
      qbId,
      queryDisabled,
      reduxStore,
      resetOnFieldChange,
      resetOnOperatorChange,
    ]
  );

  const onRuleOrGroupRemove = useCallback(
    (path: number[], context?: any) => {
      const queryLocal = getReduxQuery(reduxStore.getState(), qbId) as RG;
      if (pathIsDisabled(path, queryLocal) || queryDisabled) {
        // istanbul ignore else
        if (debugMode) {
          onLog({ type: LogType.pathDisabled, path, query: queryLocal });
        }
        return;
      }
      const ruleOrGroup = findPath(path, queryLocal);
      // istanbul ignore else
      if (ruleOrGroup) {
        if (onRemove(ruleOrGroup as RG | RuleType, path, queryLocal, context)) {
          const newQuery = remove(queryLocal, path);
          if (debugMode) {
            onLog({ type: LogType.remove, query: queryLocal, newQuery, path, ruleOrGroup });
          }
          dispatch(newQuery);
        } else {
          if (debugMode) {
            onLog({ type: LogType.onRemoveFalse, ruleOrGroup, path, query: queryLocal });
          }
        }
      }
    },
    [debugMode, dispatch, onLog, onRemove, qbId, queryDisabled, reduxStore]
  );

  const moveRule = useCallback(
    (oldPath: number[], newPath: number[], clone?: boolean) => {
      const queryLocal = getReduxQuery(reduxStore.getState(), qbId) as RG;
      if (pathIsDisabled(oldPath, queryLocal) || queryDisabled) {
        // istanbul ignore else
        if (debugMode) {
          onLog({ type: LogType.pathDisabled, oldPath, newPath, query: queryLocal });
        }
        return;
      }
      const newQuery = move(queryLocal, oldPath, newPath, { clone, combinators });
      if (debugMode) {
        onLog({ type: LogType.move, query: queryLocal, newQuery, oldPath, newPath, clone });
      }
      dispatch(newQuery);
    },
    [combinators, debugMode, dispatch, onLog, qbId, queryDisabled, reduxStore]
  );
  // #endregion

  const dndEnabledAttr = useMemo(
    () => (enableDragAndDrop ? 'enabled' : 'disabled'),
    [enableDragAndDrop]
  );
  const inlineCombinatorsAttr = useMemo(
    () => (independentCombinators || showCombinatorsBetweenRules ? 'enabled' : 'disabled'),
    [independentCombinators, showCombinatorsBetweenRules]
  );
  const combinatorPropObject: Pick<RuleGroupProps, 'combinator'> = useMemo(
    () => ('combinator' in rootQuery ? { combinator: rootQuery.combinator } : {}),
    [rootQuery]
  );

  const { validationResult, validationMap } = useMemo(() => {
    const validationResult =
      typeof validator === 'function' && rootQuery ? validator(rootQuery) : defaultValidationResult;
    const validationMap =
      typeof validationResult === 'boolean' ? defaultValidationMap : validationResult;
    return { validationResult, validationMap };
  }, [rootQuery, validator]);

  const schema = useMemo(
    (): Schema => ({
      fields,
      fieldMap,
      combinators,
      classNames: controlClassnames,
      createRule,
      createRuleGroup,
      controls: controlElements,
      getOperators: getOperatorsMain,
      getValueEditorType: getValueEditorTypeMain,
      getValueSources: getValueSourcesMain,
      getInputType: getInputTypeMain,
      getValues: getValuesMain,
      getValueEditorSeparator,
      getRuleClassname,
      getRuleGroupClassname,
      showCombinatorsBetweenRules,
      showNotToggle,
      showCloneButtons,
      showLockButtons,
      autoSelectField,
      autoSelectOperator,
      addRuleToNewGroups,
      enableDragAndDrop,
      independentCombinators,
      listsAsArrays,
      parseNumbers,
      validationMap,
      disabledPaths,
    }),
    [
      addRuleToNewGroups,
      autoSelectField,
      autoSelectOperator,
      combinators,
      controlClassnames,
      controlElements,
      createRule,
      createRuleGroup,
      disabledPaths,
      enableDragAndDrop,
      fieldMap,
      fields,
      getInputTypeMain,
      getOperatorsMain,
      getRuleClassname,
      getRuleGroupClassname,
      getValueEditorTypeMain,
      getValuesMain,
      getValueSourcesMain,
      getValueEditorSeparator,
      independentCombinators,
      listsAsArrays,
      parseNumbers,
      showCloneButtons,
      showCombinatorsBetweenRules,
      showLockButtons,
      showNotToggle,
      validationMap,
    ]
  );

  const actions = useMemo(
    (): QueryActions => ({
      onRuleAdd,
      onGroupAdd,
      onRuleRemove: onRuleOrGroupRemove,
      onGroupRemove: onRuleOrGroupRemove,
      onPropChange,
      moveRule,
    }),
    [moveRule, onGroupAdd, onPropChange, onRuleAdd, onRuleOrGroupRemove]
  );

  const wrapperClassName = useMemo(
    () =>
      clsx(standardClassnames.queryBuilder, clsx(controlClassnames.queryBuilder), {
        [standardClassnames.disabled]: queryDisabled,
        [standardClassnames.valid]: typeof validationResult === 'boolean' && validationResult,
        [standardClassnames.invalid]: typeof validationResult === 'boolean' && !validationResult,
      }),
    [controlClassnames.queryBuilder, queryDisabled, validationResult]
  );

  if (isFirstRender.current) isFirstRender.current = false;

  return {
    actions,
    rootQuery,
    queryDisabled,
    rqbContext,
    schema,
    translations,
    wrapperClassName,
    dndEnabledAttr,
    inlineCombinatorsAttr,
    combinatorPropObject,
  };
};
