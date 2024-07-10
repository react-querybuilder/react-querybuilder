import { clsx } from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LogType, standardClassnames } from '../defaults';
import { getQuerySelectorById, useQueryBuilderSelector } from '../redux';
import {
  _RQB_INTERNAL_dispatchThunk,
  useRQB_INTERNAL_QueryBuilderDispatch,
  useRQB_INTERNAL_QueryBuilderStore,
} from '../redux/_internal';
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
  Schema,
  UpdateableProperties,
  ValidationMap,
  ValueSources,
} from '../types';
import {
  add,
  findPath,
  generateAccessibleDescription,
  isRuleGroup,
  isRuleGroupTypeIC,
  move,
  pathIsDisabled,
  prepareRuleGroup,
  remove,
  update,
} from '../utils';
import { useControlledOrUncontrolled } from './useControlledOrUncontrolled';
import { useDeprecatedProps } from './useDeprecatedProps';
import type { useQueryBuilderSetup } from './useQueryBuilderSetup';

const defaultValidationResult: ReturnType<QueryValidator> = {};
const defaultValidationMap: ValidationMap = {};
const defaultDisabledPaths: Path[] = [];
const icCombinatorPropObject = {} as const;
const defaultGetValueEditorSeparator = () => null;
const defaultGetRuleOrGroupClassname = () => '';
const defaultOnAddMoveRemove = () => true;
// istanbul ignore next
const defaultOnLog = (...params: unknown[]) => {
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
    getRuleClassname = defaultGetRuleOrGroupClassname,
    getRuleGroupClassname = defaultGetRuleOrGroupClassname,
    onAddRule = defaultOnAddMoveRemove,
    onAddGroup = defaultOnAddMoveRemove,
    onMoveRule = defaultOnAddMoveRemove,
    onMoveGroup = defaultOnAddMoveRemove,
    onRemove = defaultOnAddMoveRemove,
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
    rqbContext: incomingRqbContext,
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
  } = incomingRqbContext;

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

  const log = useCallback(
    (...params: unknown[]) => {
      if (debugMode) {
        onLog(...params);
      }
    },
    [debugMode, onLog]
  );

  // #region Handle controlled mode vs uncontrolled mode
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

  // We assume here that if the query has an `id` property, the query has already
  // been prepared. If `candidateQuery === query`, the user is probably just
  // passing back the parameter from the `onQueryChange` callback.
  const candidateQuery = queryProp ?? storeQuery ?? defaultQueryProp ?? fallbackQuery;
  const rootGroup = (
    !candidateQuery.id ? prepareRuleGroup(candidateQuery, { idGenerator }) : candidateQuery
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
  const disabledPaths = useMemo(
    () => (Array.isArray(disabled) && disabled) || defaultDisabledPaths,
    [disabled]
  );
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
        log({ qbId, type: LogType.parentPathDisabled, rule, parentPath, query: queryLocal });
        return;
      }
      // @ts-expect-error `queryLocal` is type `RuleGroupTypeAny`, but it doesn't matter here
      const nextRule = onAddRule(rule, parentPath, queryLocal, context);
      if (!nextRule) {
        log({ qbId, type: LogType.onAddRuleFalse, rule, parentPath, query: queryLocal });
        return;
      }
      const newRule = nextRule === true ? rule : nextRule;
      const newQuery = add(queryLocal, newRule, parentPath, {
        combinators,
        combinatorPreceding: newRule.combinatorPreceding ?? undefined,
      });
      log({ qbId, type: LogType.add, query: queryLocal, newQuery, newRule, parentPath });
      dispatchQuery(newQuery);
    },
    [qbId, queryBuilderStore, queryDisabled, onAddRule, combinators, dispatchQuery, log]
  );

  const onGroupAdd = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ruleGroup: RG, parentPath: Path, context?: any) => {
      const queryLocal = getQuerySelectorById(qbId)(queryBuilderStore.getState()) as RG;
      // istanbul ignore if
      if (!queryLocal) return;
      if (pathIsDisabled(parentPath, queryLocal) || queryDisabled) {
        log({
          qbId,
          type: LogType.parentPathDisabled,
          ruleGroup,
          parentPath,
          query: queryLocal,
        });
        return;
      }
      // @ts-expect-error `queryLocal` is type `RuleGroupTypeAny`, but it doesn't matter here
      const nextGroup = onAddGroup(ruleGroup, parentPath, queryLocal, context);
      if (!nextGroup) {
        log({ qbId, type: LogType.onAddGroupFalse, ruleGroup, parentPath, query: queryLocal });
        return;
      }
      const newGroup = nextGroup === true ? ruleGroup : nextGroup;
      const newQuery = add(queryLocal, newGroup, parentPath, {
        combinators,
        combinatorPreceding: (newGroup as RuleGroupTypeIC).combinatorPreceding ?? undefined,
      });
      log({ qbId, type: LogType.add, query: queryLocal, newQuery, newGroup, parentPath });
      dispatchQuery(newQuery);
    },
    [qbId, queryBuilderStore, queryDisabled, onAddGroup, combinators, log, dispatchQuery]
  );

  const onPropChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prop: UpdateableProperties, value: any, path: Path) => {
      const queryLocal = getQuerySelectorById(qbId)(queryBuilderStore.getState());
      // istanbul ignore if
      if (!queryLocal) return;
      if ((pathIsDisabled(path, queryLocal) && prop !== 'disabled') || queryDisabled) {
        log({ qbId, type: LogType.pathDisabled, path, prop, value, query: queryLocal });
        return;
      }
      const newQuery = update(queryLocal, prop, value, path, {
        resetOnFieldChange,
        resetOnOperatorChange,
        getRuleDefaultOperator: getRuleDefaultOperator as unknown as (field: string) => string,
        getValueSources: getValueSourcesMain as (field: string) => ValueSources,
        getRuleDefaultValue,
      });
      log({ qbId, type: LogType.update, query: queryLocal, newQuery, prop, value, path });
      dispatchQuery(newQuery);
    },
    [
      qbId,
      queryBuilderStore,
      queryDisabled,
      resetOnFieldChange,
      resetOnOperatorChange,
      getRuleDefaultOperator,
      getValueSourcesMain,
      getRuleDefaultValue,
      log,
      dispatchQuery,
    ]
  );

  const onRuleOrGroupRemove = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (path: Path, context?: any) => {
      const queryLocal = getQuerySelectorById(qbId)(queryBuilderStore.getState()) as RG;
      // istanbul ignore if
      if (!queryLocal) return;
      if (pathIsDisabled(path, queryLocal) || queryDisabled) {
        log({ qbId, type: LogType.pathDisabled, path, query: queryLocal });
        return;
      }
      const ruleOrGroup = findPath(path, queryLocal) as RG | R;
      // istanbul ignore else
      if (ruleOrGroup) {
        // @ts-expect-error `ruleOrGroup` and `queryLocal` are type `RuleGroupTypeAny`,
        // but it doesn't matter here
        if (onRemove(ruleOrGroup, path, queryLocal, context)) {
          const newQuery = remove(queryLocal, path);
          log({ qbId, type: LogType.remove, query: queryLocal, newQuery, path, ruleOrGroup });
          dispatchQuery(newQuery);
        } else {
          log({ qbId, type: LogType.onRemoveFalse, ruleOrGroup, path, query: queryLocal });
        }
      }
    },
    [qbId, queryBuilderStore, queryDisabled, log, onRemove, dispatchQuery]
  );

  const moveRule = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (oldPath: Path, newPath: Path | 'up' | 'down', clone?: boolean, context?: any) => {
      const queryLocal = getQuerySelectorById(qbId)(queryBuilderStore.getState()) as RG;
      // istanbul ignore if
      if (!queryLocal) return;
      if (pathIsDisabled(oldPath, queryLocal) || queryDisabled) {
        log({ qbId, type: LogType.pathDisabled, oldPath, newPath, query: queryLocal });
        return;
      }
      const nextQuery = move(queryLocal, oldPath, newPath, { clone, combinators });
      const ruleOrGroup = findPath(oldPath, queryLocal)!;
      const isGroup = isRuleGroup(ruleOrGroup);
      const callbackResult = (
        (isGroup ? onMoveGroup : onMoveRule) as (...args: unknown[]) => RG | boolean
      )(ruleOrGroup, oldPath, newPath, queryLocal, nextQuery, { clone, combinators }, context);
      if (!callbackResult) {
        log({
          qbId,
          type: isGroup ? LogType.onMoveGroupFalse : LogType.onMoveRuleFalse,
          ruleOrGroup,
          oldPath,
          newPath,
          clone,
          query: queryLocal,
          nextQuery,
        });
        return;
      }
      const newQuery = isRuleGroup(callbackResult) ? callbackResult : nextQuery;
      log({ qbId, type: LogType.move, query: queryLocal, newQuery, oldPath, newPath, clone });
      dispatchQuery(newQuery);
    },
    [
      qbId,
      queryBuilderStore,
      queryDisabled,
      combinators,
      onMoveGroup,
      onMoveRule,
      log,
      dispatchQuery,
    ]
  );
  // #endregion

  // #region Validation
  const { validationResult, validationMap } = useMemo(() => {
    const validationResult =
      typeof validator === 'function' && rootGroup ? validator(rootGroup) : defaultValidationResult;
    const validationMap =
      typeof validationResult === 'boolean' ? defaultValidationMap : validationResult;
    return { validationResult, validationMap };
  }, [rootGroup, validator]);
  // #endregion

  // #region Miscellaneous
  const dndEnabledAttr = useMemo(
    () => (enableDragAndDrop ? 'enabled' : 'disabled'),
    [enableDragAndDrop]
  );
  const inlineCombinatorsAttr = useMemo(
    () => (independentCombinators || showCombinatorsBetweenRules ? 'enabled' : 'disabled'),
    [independentCombinators, showCombinatorsBetweenRules]
  );
  const combinatorPropObject: Pick<RuleGroupProps, 'combinator'> = useMemo(
    () =>
      typeof rootGroup.combinator === 'string'
        ? { combinator: rootGroup.combinator }
        : icCombinatorPropObject,
    [rootGroup.combinator]
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
  // #endregion

  // #region Schema/actions
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
