import { clsx } from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LogType, standardClassnames } from '../defaults';
import type {
  Combinator,
  Controls,
  Field,
  FullOptionList,
  FullOptionRecord,
  GetOptionIdentifierType,
  Operator,
  Path,
  QueryActions,
  QueryBuilderProps,
  QueryValidator,
  RuleGroupProps,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleType,
  Schema,
  ToFlexibleOption,
  ToFullOption,
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
import type { useQueryBuilderSetup } from './useQueryBuilderSetup';
import { useDeprecatedProps } from './useDeprecatedProps';

const defaultValidationResult: ReturnType<QueryValidator> = {};
const defaultValidationMap: ValidationMap = {};
const defaultGetValueEditorSeparator = () => null;
const defaultGetRuleClassname = () => '';
const defaultGetRuleGroupClassname = () => '';
const defaultOnAddRule = (r: RuleType) => r;
const defaultOnAddGroup = (rg: any) => rg;
const defaultOnRemove = () => true;
// istanbul ignore next
const defaultOnLog = (...params: any[]) => {
  console.log(...params);
};

/**
 * For given {@link QueryBuilderProps} and setup values from {@link useQueryBuilderSetup},
 * prepares and returns all values required to render a query builder.
 */
export function useQueryBuilderSchema<
  RG extends RuleGroupTypeAny,
  F extends ToFlexibleOption<Field>,
  O extends ToFlexibleOption<Operator>,
  C extends ToFlexibleOption<Combinator>,
>(
  props: QueryBuilderProps<RG, F, O, C>,
  setup: ReturnType<typeof useQueryBuilderSetup<RG, F, O, C>>
) {
  type R = RG extends RuleGroupType<infer RT> | RuleGroupTypeIC<infer RT> ? RT : never;
  type Setup = ReturnType<typeof useQueryBuilderSetup<RG, F, O, C>>;
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
  } = setup as unknown as Setup;

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

  const fallbackQuery = useMemo(() => createRuleGroup(), [createRuleGroup]);

  // Assume the query has already been prepared if this is not the first render.
  const [queryState, setQueryState] = useState(() =>
    prepareRuleGroup(queryProp ?? defaultQueryProp ?? fallbackQuery, { idGenerator })
  );
  const rootGroup = queryProp ?? queryState;

  const independentCombinators = useMemo(() => isRuleGroupTypeIC(rootGroup), [rootGroup]);
  const invalidIC = !!props.independentCombinators && !independentCombinators;
  useDeprecatedProps('invalid-ic', invalidIC);
  useDeprecatedProps(
    'unnecessary-ic',
    !invalidIC && (props.independentCombinators ?? 'not present') !== 'not present'
  );

  // This effect only runs once, at the beginning of the component lifecycle.
  useEffect(() => {
    // Leave `onQueryChange` undefined if `enableMountQueryChange` is disabled
    if (
      enableMountQueryChange &&
      ((oQC: any): oQC is (q: RuleGroupTypeAny) => void => typeof oQC === 'function')(onQueryChange)
    ) {
      onQueryChange(rootGroup);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _queryPropPresent = !!queryProp;
  /**
   * Updates the redux-based query, then calls `onQueryChange` with the updated
   * query object. NOTE: `useCallback` is only effective here when the user's
   * `onQueryChange` handler is undefined or has a stable reference, which usually
   * means that it's wrapped in its own `useCallback`.
   */
  const updateQuery = useCallback(
    (queryUpdater: (currentQuery: RuleGroupTypeAny) => RuleGroupTypeAny) => {
      setQueryState(q => {
        const newQuery = queryUpdater(q);
        if (
          !Object.is(q, newQuery) &&
          ((oQC: any): oQC is (q: RuleGroupTypeAny) => void => typeof oQC === 'function')(
            onQueryChange
          )
        ) {
          onQueryChange(newQuery);
        }
        // if (!_queryPropPresent) {
        //   // This component is uncontrolled, so update the query state
        //   return newQuery;
        // } else {
        //   // This component is controlled, so don't update the query state
        //   return q;
        // }
        return newQuery;
      });
    },
    // [onQueryChange, _queryPropPresent]
    [onQueryChange]
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
    (rule: R, parentPath: Path, context?: any) => {
      updateQuery(queryLocal => {
        if (pathIsDisabled(parentPath, queryLocal) || queryDisabled) {
          // istanbul ignore else
          if (debugMode) {
            onLog({ type: LogType.parentPathDisabled, rule, parentPath, query: queryLocal });
          }
          return queryLocal;
        }
        // @ts-expect-error `queryLocal` is type `RuleGroupTypeAny`, but it doesn't matter here
        const newRule = onAddRule(rule, parentPath, queryLocal, context);
        if (!newRule) {
          // istanbul ignore else
          if (debugMode) {
            onLog({ type: LogType.onAddRuleFalse, rule, parentPath, query: queryLocal });
          }
          return queryLocal;
        }
        const newQuery = add(queryLocal, newRule, parentPath, {
          combinators,
          combinatorPreceding: newRule.combinatorPreceding ?? undefined,
        });
        if (debugMode) {
          onLog({ type: LogType.add, query: queryLocal, newQuery, newRule, parentPath });
        }
        return newQuery;
      });
    },
    [combinators, debugMode, onAddRule, onLog, queryDisabled, updateQuery]
  );

  const onGroupAdd = useCallback(
    (ruleGroup: RG, parentPath: Path, context?: any) => {
      updateQuery(queryLocal => {
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
          return queryLocal;
        }
        // @ts-expect-error `queryLocal` is type `RuleGroupTypeAny`, but it doesn't matter here
        const newGroup = onAddGroup(ruleGroup, parentPath, queryLocal, context);
        if (!newGroup) {
          // istanbul ignore else
          if (debugMode) {
            onLog({ type: LogType.onAddGroupFalse, ruleGroup, parentPath, query: queryLocal });
          }
          return queryLocal;
        }
        const newQuery = add(queryLocal, newGroup, parentPath, {
          combinators,
          combinatorPreceding: (newGroup as RuleGroupTypeIC).combinatorPreceding ?? undefined,
        });
        if (debugMode) {
          onLog({ type: LogType.add, query: queryLocal, newQuery, newGroup, parentPath });
        }
        return newQuery;
      });
    },
    [combinators, debugMode, onAddGroup, onLog, queryDisabled, updateQuery]
  );

  const onPropChange = useCallback(
    (prop: UpdateableProperties, value: any, path: Path) => {
      updateQuery(queryLocal => {
        if ((pathIsDisabled(path, queryLocal) && prop !== 'disabled') || queryDisabled) {
          if (debugMode) {
            onLog({ type: LogType.pathDisabled, path, prop, value, query: queryLocal });
          }
          return queryLocal;
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
        return newQuery;
      });
    },
    [
      debugMode,
      getRuleDefaultOperator,
      getRuleDefaultValue,
      getValueSourcesMain,
      onLog,
      queryDisabled,
      resetOnFieldChange,
      resetOnOperatorChange,
      updateQuery,
    ]
  );

  const onRuleOrGroupRemove = useCallback(
    (path: Path, context?: any) => {
      updateQuery(queryLocal => {
        if (pathIsDisabled(path, queryLocal) || queryDisabled) {
          // istanbul ignore else
          if (debugMode) {
            onLog({ type: LogType.pathDisabled, path, query: queryLocal });
          }
          return queryLocal;
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
            return newQuery;
          } else {
            if (debugMode) {
              onLog({ type: LogType.onRemoveFalse, ruleOrGroup, path, query: queryLocal });
            }
          }
        }
        return queryLocal;
      });
    },
    [debugMode, onLog, onRemove, queryDisabled, updateQuery]
  );

  const moveRule = useCallback(
    (oldPath: Path, newPath: Path, clone?: boolean) => {
      updateQuery(queryLocal => {
        if (pathIsDisabled(oldPath, queryLocal) || queryDisabled) {
          // istanbul ignore else
          if (debugMode) {
            onLog({ type: LogType.pathDisabled, oldPath, newPath, query: queryLocal });
          }
          return queryLocal;
        }
        const newQuery = move(queryLocal, oldPath, newPath, { clone, combinators });
        if (debugMode) {
          onLog({ type: LogType.move, query: queryLocal, newQuery, oldPath, newPath, clone });
        }
        return newQuery;
      });
    },
    [combinators, debugMode, onLog, queryDisabled, updateQuery]
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
    (): Schema<ToFullOption<F>, GetOptionIdentifierType<O>> => ({
      addRuleToNewGroups,
      accessibleDescriptionGenerator,
      autoSelectField,
      autoSelectOperator,
      classNames: controlClassnames,
      combinators,
      controls: controlElements as unknown as Controls<ToFullOption<F>, GetOptionIdentifierType<O>>,
      createRule,
      createRuleGroup,
      disabledPaths,
      enableDragAndDrop,
      fieldMap: fieldMap as unknown as FullOptionRecord<
        ToFullOption<F>,
        GetOptionIdentifierType<F>
      >,
      fields: fields as unknown as FullOptionList<ToFullOption<F>>,
      updateQuery,
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
      getValueEditorSeparator,
      getValueEditorTypeMain,
      getValuesMain,
      getValueSourcesMain,
      independentCombinators,
      listsAsArrays,
      parseNumbers,
      qbId,
      showCloneButtons,
      showCombinatorsBetweenRules,
      showLockButtons,
      showNotToggle,
      showShiftActions,
      updateQuery,
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

  if (isFirstRender.current) isFirstRender.current = false;

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
