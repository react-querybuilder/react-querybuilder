import { clsx } from 'clsx';
import { useCallback, useEffect, useMemo } from 'react';
import { LogType, standardClassnames } from '../defaults';
import {
  _RQB_INTERNAL_dispatchThunk,
  useRQB_INTERNAL_QueryBuilderDispatch,
  useRQB_INTERNAL_QueryBuilderStore,
} from '../redux/_internal';
import { getQuerySelectorById, useQueryBuilderSelector } from '../redux';
import type {
  FullCombinator,
  FullField,
  FullOperator,
  FullOptionMap,
  GetOptionIdentifierType,
  GetRuleTypeFromGroupWithFieldAndOperator,
  Path,
  QueryActions,
  QueryBuilderProps,
  QueryValidator,
  RuleGroupProps,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleType,
  Schema,
  UpdateableProperties,
  ValidationMap,
  ValueSources,
} from '../types';
import {
  add,
  findPath,
  generateAccessibleDescription,
  isRuleGroupType,
  isRuleGroupTypeIC,
  move,
  pathIsDisabled,
  prepareRuleGroup,
  remove,
  update,
} from '../utils';
import { useDeprecatedProps } from './useDeprecatedProps';
import type { useQueryBuilderSetup } from './useQueryBuilderSetup';

const defaultValidationResult: ReturnType<QueryValidator> = {};
const defaultValidationMap: ValidationMap = {};
const defaultGetValueEditorSeparator = () => null;
const defaultGetRuleClassname = () => '';
const defaultGetRuleGroupClassname = () => '';
const defaultOnAddRule = (r: RuleType) => r;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultOnAddGroup = (rg: any) => rg;
const defaultOnRemove = () => true;
// istanbul ignore next
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultOnLog = (...params: any[]) => {
  console.log(...params);
};

/**
 * For given {@link QueryBuilderProps} and setup values from {@link useQueryBuilderSetup},
 * prepares and returns all values required to render a query builder.
 */
export function useQueryBuilderSchema<
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
>(
  props: QueryBuilderProps<RG, F, O, C>,
  setup: ReturnType<typeof useQueryBuilderSetup<RG, F, O, C>>
) {
  type R = GetRuleTypeFromGroupWithFieldAndOperator<RG, F, O>;

  const {
    query: queryProp,
    defaultQuery: defaultQueryProp,
    getValueEditorSeparator = defaultGetValueEditorSeparator,
    getRuleClassname = defaultGetRuleClassname,
    getRuleGroupClassname = defaultGetRuleGroupClassname,
    onAddRule = defaultOnAddRule,
    onAddGroup = defaultOnAddGroup,
    onRemove = defaultOnRemove,
    onQueryChange,
    showCombinatorsBetweenRules: showCombinatorsBetweenRulesProp = false,
    showNotToggle: showNotToggleProp = false,
    showShiftActions: showShiftActionsProp = false,
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
    onLog = defaultOnLog,
    idGenerator,
    accessibleDescriptionGenerator = generateAccessibleDescription,
  } = props;

  const {
    qbId,
    rqbContext,
    fields,
    fieldMap,
    combinators,
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
    controlElements: controls,
    debugMode,
    enableDragAndDrop,
    enableMountQueryChange,
    translations,
  } = rqbContext;

  // #region Boolean coercion
  const showCombinatorsBetweenRules = !!showCombinatorsBetweenRulesProp;
  const showNotToggle = !!showNotToggleProp;
  const showShiftActions = !!showShiftActionsProp;
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
  const queryBuilderStore = useRQB_INTERNAL_QueryBuilderStore();
  const queryBuilderDispatch = useRQB_INTERNAL_QueryBuilderDispatch();

  const querySelector = useMemo(() => getQuerySelectorById(setup.qbId), [setup.qbId]);
  const storeQuery = useQueryBuilderSelector(querySelector);
  const getQuery = useCallback(
    () => querySelector(queryBuilderStore.getState()),
    [queryBuilderStore, querySelector]
  );

  const fallbackQuery = useMemo(() => createRuleGroup(), [createRuleGroup]);

  // We assume here that if the query has an `id` property, the query has already
  // been prepared. If `candidateQuery === query`, the user is probably just
  // passing back the parameter from the `onQueryChange` callback.
  const candidateQuery = queryProp ?? storeQuery ?? defaultQueryProp ?? fallbackQuery;
  const rootGroup = (
    !candidateQuery.id ? prepareRuleGroup(candidateQuery, { idGenerator }) : candidateQuery
  ) as RuleGroupTypeAny<R>;

  // If a new `query` prop is passed in that doesn't match the query in the store,
  // update the store to match the prop _without_ calling `onQueryChange`.
  useEffect(() => {
    if (!!queryProp && queryProp !== storeQuery) {
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
    // 'invalid'
  );

  // This effect only runs once, at the beginning of the component lifecycle.
  useEffect(() => {
    queryBuilderDispatch(
      _RQB_INTERNAL_dispatchThunk({
        payload: { qbId, query: rootGroup },
        onQueryChange:
          // Leave `onQueryChange` undefined if `enableMountQueryChange` is disabled
          enableMountQueryChange && typeof onQueryChange === 'function' ? onQueryChange : undefined,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Updates the redux-based query, then calls `onQueryChange` with the updated
   * query object. NOTE: `useCallback` is only effective here when the user's
   * `onQueryChange` handler is undefined or has a stable reference, which usually
   * means that it's wrapped in its own `useCallback`.
   */
  const dispatchQuery = useCallback(
    (newQuery: RuleGroupTypeAny) => {
      queryBuilderDispatch(
        _RQB_INTERNAL_dispatchThunk({ payload: { qbId, query: newQuery }, onQueryChange })
      );
    },
    [onQueryChange, qbId, queryBuilderDispatch]
  );
  // #endregion

  // #region Query update methods
  const disabledPaths = useMemo(() => (Array.isArray(disabled) && disabled) || [], [disabled]);
  const queryDisabled = disabled === true;
  const rootGroupDisabled = useMemo(
    () => rootGroup.disabled || disabledPaths.some(p => p.length === 0),
    [disabledPaths, rootGroup.disabled]
  );

  const onRuleAdd = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (rule: R, parentPath: Path, context?: any) => {
      const queryLocal = getQuerySelectorById(qbId)(queryBuilderStore.getState()) as RG;
      // istanbul ignore if
      if (!queryLocal) return;
      if (pathIsDisabled(parentPath, queryLocal) || queryDisabled) {
        // istanbul ignore else
        if (debugMode) {
          onLog({ type: LogType.parentPathDisabled, rule, parentPath, query: queryLocal });
        }
        return;
      }
      // @ts-expect-error `queryLocal` is type `RuleGroupTypeAny`, but it doesn't matter here
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
      dispatchQuery(newQuery);
    },
    [
      combinators,
      debugMode,
      dispatchQuery,
      onAddRule,
      onLog,
      qbId,
      queryDisabled,
      queryBuilderStore,
    ]
  );

  const onGroupAdd = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ruleGroup: RG, parentPath: Path, context?: any) => {
      const queryLocal = getQuerySelectorById(qbId)(queryBuilderStore.getState()) as RG;
      // istanbul ignore if
      if (!queryLocal) return;
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
      // @ts-expect-error `queryLocal` is type `RuleGroupTypeAny`, but it doesn't matter here
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
      dispatchQuery(newQuery);
    },
    [
      combinators,
      debugMode,
      dispatchQuery,
      onAddGroup,
      onLog,
      qbId,
      queryDisabled,
      queryBuilderStore,
    ]
  );

  const onPropChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prop: UpdateableProperties, value: any, path: Path) => {
      const queryLocal = getQuerySelectorById(qbId)(queryBuilderStore.getState());
      // istanbul ignore if
      if (!queryLocal) return;
      if ((pathIsDisabled(path, queryLocal) && prop !== 'disabled') || queryDisabled) {
        if (debugMode) {
          onLog({ type: LogType.pathDisabled, path, prop, value, query: queryLocal });
        }
        return;
      }
      const newQuery = update(queryLocal, prop, value, path, {
        resetOnFieldChange,
        resetOnOperatorChange,
        getRuleDefaultOperator: getRuleDefaultOperator as unknown as (field: string) => string,
        getValueSources: getValueSourcesMain as (field: string) => ValueSources,
        getRuleDefaultValue,
      });
      if (debugMode) {
        onLog({ type: LogType.update, query: queryLocal, newQuery, prop, value, path });
      }
      dispatchQuery(newQuery);
    },
    [
      debugMode,
      dispatchQuery,
      getRuleDefaultOperator,
      getRuleDefaultValue,
      getValueSourcesMain,
      onLog,
      qbId,
      queryDisabled,
      queryBuilderStore,
      resetOnFieldChange,
      resetOnOperatorChange,
    ]
  );

  const onRuleOrGroupRemove = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (path: Path, context?: any) => {
      const queryLocal = getQuerySelectorById(qbId)(queryBuilderStore.getState()) as RG;
      // istanbul ignore if
      if (!queryLocal) return;
      if (pathIsDisabled(path, queryLocal) || queryDisabled) {
        // istanbul ignore else
        if (debugMode) {
          onLog({ type: LogType.pathDisabled, path, query: queryLocal });
        }
        return;
      }
      const ruleOrGroup = findPath(path, queryLocal) as RG | R;
      // istanbul ignore else
      if (ruleOrGroup) {
        // @ts-expect-error `ruleOrGroup` and `queryLocal` are type `RuleGroupTypeAny`,
        // but it doesn't matter here
        if (onRemove(ruleOrGroup, path, queryLocal, context)) {
          const newQuery = remove(queryLocal, path);
          if (debugMode) {
            onLog({ type: LogType.remove, query: queryLocal, newQuery, path, ruleOrGroup });
          }
          dispatchQuery(newQuery);
        } else {
          if (debugMode) {
            onLog({ type: LogType.onRemoveFalse, ruleOrGroup, path, query: queryLocal });
          }
        }
      }
    },
    [debugMode, dispatchQuery, onLog, onRemove, qbId, queryDisabled, queryBuilderStore]
  );

  const moveRule = useCallback(
    (oldPath: Path, newPath: Path, clone?: boolean) => {
      const queryLocal = getQuerySelectorById(qbId)(queryBuilderStore.getState());
      // istanbul ignore if
      if (!queryLocal) return;
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
      dispatchQuery(newQuery);
    },
    [combinators, debugMode, dispatchQuery, onLog, qbId, queryDisabled, queryBuilderStore]
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
    () => (isRuleGroupType(rootGroup) ? { combinator: rootGroup.combinator } : {}),
    [rootGroup]
  );

  const { validationResult, validationMap } = useMemo(() => {
    const validationResult =
      typeof validator === 'function' && rootGroup ? validator(rootGroup) : defaultValidationResult;
    const validationMap =
      typeof validationResult === 'boolean' ? defaultValidationMap : validationResult;
    return { validationResult, validationMap };
  }, [rootGroup, validator]);

  const schema = useMemo(
    (): Schema<F, GetOptionIdentifierType<O>> => ({
      addRuleToNewGroups,
      accessibleDescriptionGenerator,
      autoSelectField,
      autoSelectOperator,
      classNames: controlClassnames,
      combinators,
      controls,
      createRule,
      createRuleGroup,
      disabledPaths,
      enableDragAndDrop,
      fieldMap: fieldMap as FullOptionMap<F>,
      fields,
      dispatchQuery,
      getQuery,
      getInputType: getInputTypeMain,
      getOperators: getOperatorsMain,
      getRuleClassname,
      getRuleGroupClassname,
      getValueEditorSeparator,
      getValueEditorType: getValueEditorTypeMain,
      getValues: getValuesMain,
      getValueSources: getValueSourcesMain,
      independentCombinators,
      listsAsArrays,
      parseNumbers,
      qbId,
      showCloneButtons,
      showCombinatorsBetweenRules,
      showLockButtons,
      showNotToggle,
      showShiftActions,
      validationMap,
    }),
    [
      addRuleToNewGroups,
      accessibleDescriptionGenerator,
      autoSelectField,
      autoSelectOperator,
      combinators,
      controlClassnames,
      controls,
      createRule,
      createRuleGroup,
      disabledPaths,
      enableDragAndDrop,
      fieldMap,
      fields,
      dispatchQuery,
      getQuery,
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
      qbId,
      showCloneButtons,
      showCombinatorsBetweenRules,
      showLockButtons,
      showNotToggle,
      showShiftActions,
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

  return {
    ...props,
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
