import { clsx } from 'clsx';
import { useCallback, useEffect, useMemo } from 'react';
import { LogType, defaultCombinators, standardClassnames } from '../defaults';
import type {
  QueryActions,
  QueryBuilderProps,
  QueryValidator,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleType,
  Schema,
  UpdateableProperties,
  ValidationMap,
} from '../types';
import { add, findPath, move, pathIsDisabled, remove, update } from '../utils';
import type { useCreateReduxSlice } from './useCreateReduxSlice';
import type { useQueryBuilderSetup } from './useQueryBuilderSetup';
import { getReduxQuery, useAppDispatch, useAppSelector, useAppStore } from './useRedux';

const noop = () => {};

const defaultValidationResult: ReturnType<QueryValidator> = {};
const defaultValidationMap: ValidationMap = {};

export const useQueryBuilder = <RG extends RuleGroupType | RuleGroupTypeIC>(
  props: QueryBuilderProps<RG>,
  setup: ReturnType<typeof useQueryBuilderSetup<RG>>,
  { setReduxQuery }: ReturnType<typeof useCreateReduxSlice>['actions']
) => {
  const {
    query: queryProp,
    combinators = defaultCombinators,
    getValueEditorSeparator = () => null,
    getRuleClassname = () => '',
    getRuleGroupClassname = () => '',
    onAddRule = r => r,
    onAddGroup = rg => rg,
    onRemove = () => true,
    onQueryChange = noop,
    showCombinatorsBetweenRules = false,
    showNotToggle = false,
    showCloneButtons = false,
    showLockButtons = false,
    resetOnFieldChange = true,
    resetOnOperatorChange = false,
    autoSelectField = true,
    autoSelectOperator = true,
    addRuleToNewGroups = false,
    independentCombinators,
    listsAsArrays = false,
    parseNumbers = false,
    disabled = false,
    validator,
    onLog = console.log,
  } = props as QueryBuilderProps<RG>;

  const {
    rqbContext,
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

  // #region Handle controlled mode vs uncontrolled mode
  const reduxStore = useAppStore();
  const reduxDispatch = useAppDispatch();
  const reduxQuery = useAppSelector(getReduxQuery) as RG;

  // useEffect(() => {
  //   reduxDispatch(
  //     setQuery(defaultQuery ? prepareRuleGroup(defaultQuery, { idGenerator }) : createRuleGroup())
  //   );
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // const [queryState, setQueryState] = useState(() => {
  //   const q = query ?? defaultQuery;
  //   return q ? prepareRuleGroup(q, { idGenerator }) : createRuleGroup();
  // });

  // We assume here that if `queryProp` is passed in, and it's not the first render,
  // that `queryProp` has already been prepared, i.e. the user is just passing back
  // the `onQueryChange` callback parameter as `queryProp`. This appears to have a huge
  // performance impact.
  // const query: RG = queryProp
  //   ? isFirstRender.current
  //     ? prepareRuleGroup(queryProp, { idGenerator })
  //     : queryProp
  //   : reduxQuery;

  // Run `onQueryChange` on mount, if enabled
  useEffect(() => {
    if (enableMountQueryChange) {
      onQueryChange(reduxQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Help prevent `dispatch` from being regenerated on every render.
  // This assignment doesn't need memoization because even if `queryProp`
  // changes references, `!queryProp` is still `true`.
  const uncontrolled = !queryProp;

  /**
   * Updates the state-based query if the component is uncontrolled, then calls
   * `onQueryChange` with the updated query object. (`useCallback` is only effective
   * here when the user's `onQueryChange` handler is undefined or has a stable reference,
   * which usually means that it's wrapped in its own `useCallback`).
   */
  const dispatch = useCallback(
    (newQuery: RG) => {
      reduxDispatch(setReduxQuery(newQuery));
      console.log(newQuery);
      if (uncontrolled) {
        // setQueryState(newQuery);
      }
      // onQueryChange(newQuery);
    },
    // [reduxDispatch, onQueryChange, setReduxQuery, uncontrolled]
    [reduxDispatch, setReduxQuery, uncontrolled]
  );
  // #endregion

  // #region Query update methods
  const queryDisabled = useMemo(
    () => disabled === true || (Array.isArray(disabled) && disabled.some(p => p.length === 0)),
    [disabled]
  );
  const disabledPaths = useMemo(() => (Array.isArray(disabled) && disabled) || [], [disabled]);

  const onRuleAdd = useCallback(
    (rule: RuleType, parentPath: number[], context?: any) => {
      const queryLocal = getReduxQuery(reduxStore.getState()) as RG;
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
    [combinators, debugMode, dispatch, onAddRule, onLog, queryDisabled, reduxStore]
  );

  const onGroupAdd = useCallback(
    (ruleGroup: RG, parentPath: number[], context?: any) => {
      const queryLocal = getReduxQuery(reduxStore.getState()) as RG;
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
    [combinators, debugMode, dispatch, onAddGroup, onLog, queryDisabled, reduxStore]
  );

  const onPropChange = useCallback(
    (prop: UpdateableProperties, value: any, path: number[]) => {
      const queryLocal = getReduxQuery(reduxStore.getState()) as RG;
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
      queryDisabled,
      reduxStore,
      resetOnFieldChange,
      resetOnOperatorChange,
    ]
  );

  const onRuleOrGroupRemove = useCallback(
    (path: number[], context?: any) => {
      const queryLocal = getReduxQuery(reduxStore.getState()) as RG;
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
    [debugMode, dispatch, onLog, onRemove, queryDisabled, reduxStore]
  );

  const moveRule = useCallback(
    (oldPath: number[], newPath: number[], clone?: boolean) => {
      const queryLocal = getReduxQuery(reduxStore.getState()) as RG;
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
    [combinators, debugMode, dispatch, onLog, queryDisabled, reduxStore]
  );
  // #endregion

  const { validationResult, validationMap } = useMemo(() => {
    const validationResult =
      typeof validator === 'function' ? validator(reduxQuery) : defaultValidationResult;
    const validationMap =
      typeof validationResult === 'boolean' ? defaultValidationMap : validationResult;
    return { validationResult, validationMap };
  }, [reduxQuery, validator]);

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
      independentCombinators: !!independentCombinators,
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

  const actions: QueryActions = {
    onRuleAdd,
    onGroupAdd,
    onRuleRemove: onRuleOrGroupRemove,
    onGroupRemove: onRuleOrGroupRemove,
    onPropChange,
    moveRule,
  };

  const wrapperClassName = useMemo(
    () =>
      clsx(standardClassnames.queryBuilder, clsx(controlClassnames.queryBuilder), {
        [standardClassnames.disabled]: reduxQuery.disabled || queryDisabled,
        [standardClassnames.valid]: typeof validationResult === 'boolean' && validationResult,
        [standardClassnames.invalid]: typeof validationResult === 'boolean' && !validationResult,
      }),
    [controlClassnames.queryBuilder, queryDisabled, reduxQuery.disabled, validationResult]
  );

  return {
    actions,
    query: reduxQuery,
    queryDisabled,
    rqbContext,
    schema,
    translations,
    wrapperClassName,
  };
};
