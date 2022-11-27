import { QueryBuilderContext } from '@react-querybuilder/ctx';
import type {
  Field,
  NameLabelPair,
  QueryActions,
  QueryBuilderProps,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleType,
  Schema,
  UpdateableProperties,
} from '@react-querybuilder/ts';
import { clsx } from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  defaultCombinators,
  defaultOperators,
  defaultTranslations,
  LogType,
  standardClassnames,
} from './defaults';
import {
  filterFieldsByComparator,
  generateID,
  getValueSourcesUtil,
  uniqByName,
  uniqOptGroups,
} from './internal';
import { useControlledOrUncontrolled } from './internal/hooks';
import {
  add,
  findPath,
  getFirstOption,
  isOptionGroupArray,
  joinWith,
  move,
  objectKeys,
  pathIsDisabled,
  prepareRuleGroup,
  remove,
  update,
  useMergedContext,
} from './utils';

const noop = () => {};

export const QueryBuilder = <RG extends RuleGroupType | RuleGroupTypeIC>({
  defaultQuery,
  query: queryProp,
  fields: fieldsPropOriginal,
  operators = defaultOperators,
  combinators = defaultCombinators,
  translations: translationsProp = defaultTranslations,
  enableMountQueryChange: enableMountQueryChangeProp = true,
  controlClassnames: controlClassnamesProp,
  controlElements: controlElementsProp,
  getDefaultField,
  getDefaultOperator,
  getDefaultValue,
  getOperators,
  getValueEditorType,
  getValueSources,
  getInputType,
  getValues,
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
  enableDragAndDrop: enableDragAndDropProp,
  independentCombinators,
  listsAsArrays = false,
  disabled = false,
  validator,
  context,
  debugMode: debugModeProp = false,
  onLog = console.log,
}: QueryBuilderProps<RG>) => {
  const rqbContext = useMergedContext({
    controlClassnames: controlClassnamesProp,
    controlElements: controlElementsProp,
    debugMode: debugModeProp,
    enableDragAndDrop: enableDragAndDropProp,
    enableMountQueryChange: enableMountQueryChangeProp,
    translations: translationsProp,
  });

  const {
    controlClassnames,
    controlElements,
    debugMode,
    enableDragAndDrop,
    enableMountQueryChange,
    translations,
  } = rqbContext;

  // #region Set up `fields`
  const defaultField = useMemo(
    (): Field => ({
      id: translations.fields.placeholderName,
      name: translations.fields.placeholderName,
      label: translations.fields.placeholderLabel,
    }),
    [translations.fields.placeholderLabel, translations.fields.placeholderName]
  );
  const fieldsProp = useMemo(
    () => fieldsPropOriginal ?? [defaultField],
    [defaultField, fieldsPropOriginal]
  );

  const fields = useMemo(() => {
    const f = Array.isArray(fieldsProp)
      ? fieldsProp
      : objectKeys(fieldsProp)
          .map((fld): Field => ({ ...fieldsProp[fld], name: fld }))
          .sort((a, b) => a.label.localeCompare(b.label));
    if (isOptionGroupArray(f)) {
      if (autoSelectField) {
        return uniqOptGroups(f);
      } else {
        return uniqOptGroups([
          {
            label: translations.fields.placeholderGroupLabel,
            options: [defaultField],
          },
          ...f,
        ]);
      }
    } else {
      if (autoSelectField) {
        return uniqByName(f);
      } else {
        return uniqByName([defaultField, ...f]);
      }
    }
  }, [autoSelectField, defaultField, fieldsProp, translations.fields.placeholderGroupLabel]);

  const fieldMap = useMemo(() => {
    if (!Array.isArray(fieldsProp)) {
      const fp: Record<string, Field> = {};
      objectKeys(fieldsProp).forEach(f => (fp[f] = { ...fieldsProp[f], name: f }));
      if (autoSelectField) {
        return fp;
      } else {
        return { ...fp, [translations.fields.placeholderName]: defaultField };
      }
    }
    const fm: Record<string, Field> = {};
    if (isOptionGroupArray(fields)) {
      fields.forEach(f => f.options.forEach(opt => (fm[opt.name] = opt)));
    } else {
      fields.forEach(f => (fm[f.name] = f));
    }
    return fm;
  }, [autoSelectField, defaultField, fields, fieldsProp, translations.fields.placeholderName]);
  // #endregion

  // #region Set up `operators`
  const defaultOperator = useMemo(
    (): NameLabelPair => ({
      id: translations.operators.placeholderName,
      name: translations.operators.placeholderName,
      label: translations.operators.placeholderLabel,
    }),
    [translations.operators.placeholderLabel, translations.operators.placeholderName]
  );

  const getOperatorsMain = useCallback(
    (field: string) => {
      const fieldData = fieldMap[field];
      let opsFinal = operators;

      if (fieldData?.operators) {
        opsFinal = fieldData.operators;
      } else if (getOperators) {
        const ops = getOperators(field);
        if (ops) {
          opsFinal = ops;
        }
      }

      if (!autoSelectOperator) {
        if (isOptionGroupArray(opsFinal)) {
          opsFinal = [
            {
              label: translations.operators.placeholderGroupLabel,
              options: [defaultOperator],
            },
            ...opsFinal,
          ];
        } else {
          opsFinal = [defaultOperator, ...opsFinal];
        }
      }

      return isOptionGroupArray(opsFinal) ? uniqOptGroups(opsFinal) : uniqByName(opsFinal);
    },
    [
      autoSelectOperator,
      defaultOperator,
      fieldMap,
      getOperators,
      operators,
      translations.operators.placeholderGroupLabel,
    ]
  );

  const getRuleDefaultOperator = useCallback(
    (field: string) => {
      const fieldData = fieldMap[field];
      if (fieldData?.defaultOperator) {
        return fieldData.defaultOperator;
      }

      if (getDefaultOperator) {
        if (typeof getDefaultOperator === 'function') {
          return getDefaultOperator(field);
        } else {
          return getDefaultOperator;
        }
      }

      const ops = getOperatorsMain(field) ?? /* istanbul ignore next */ [];
      return ops.length
        ? getFirstOption(ops) ?? /* istanbul ignore next */ ''
        : /* istanbul ignore next */ '';
    },
    [fieldMap, getDefaultOperator, getOperatorsMain]
  );
  // #endregion

  // #region Rule property getters
  const getValueEditorTypeMain = useCallback(
    (field: string, operator: string) => {
      if (getValueEditorType) {
        const vet = getValueEditorType(field, operator);
        if (vet) return vet;
      }

      return 'text';
    },
    [getValueEditorType]
  );

  const getValueSourcesMain = useCallback(
    (field: string, operator: string) =>
      getValueSourcesUtil(fieldMap[field], operator, getValueSources),
    [fieldMap, getValueSources]
  );

  const getValuesMain = useCallback(
    (field: string, operator: string) => {
      const fieldData = fieldMap[field];
      // Ignore this in tests because Rule already checks for
      // the presence of the values property in fieldData.
      /* istanbul ignore if */
      if (fieldData?.values) {
        return fieldData.values;
      }
      if (getValues) {
        const vals = getValues(field, operator);
        if (vals) return vals;
      }

      return [];
    },
    [fieldMap, getValues]
  );

  const getRuleDefaultValue = useCallback(
    (rule: RuleType) => {
      const fieldData = fieldMap[rule.field];
      if (fieldData?.defaultValue !== undefined && fieldData.defaultValue !== null) {
        return fieldData.defaultValue;
      } else if (getDefaultValue) {
        return getDefaultValue(rule);
      }

      let value: any = '';

      const values = getValuesMain(rule.field, rule.operator);

      const getFirstOptionsFrom = (opts: any[]) => {
        const firstOption = getFirstOption(opts);
        if (rule.operator === 'between' || rule.operator === 'notBetween') {
          const valArray = [firstOption, firstOption];
          return listsAsArrays
            ? valArray
            : joinWith(
                valArray.map(v => v ?? /* istanbul ignore next */ ''),
                ','
              );
        } else {
          return firstOption;
        }
      };

      if (rule.valueSource === 'field') {
        const filteredFields = filterFieldsByComparator(fieldData, fields, rule.operator);
        if (filteredFields.length > 0) {
          value = getFirstOptionsFrom(filteredFields);
        } else {
          value = '';
        }
      } else if (values.length) {
        value = getFirstOptionsFrom(values);
      } else {
        const editorType = getValueEditorTypeMain(rule.field, rule.operator);
        if (editorType === 'checkbox') {
          value = false;
        }
      }

      return value;
    },
    [fieldMap, fields, getDefaultValue, getValueEditorTypeMain, getValuesMain, listsAsArrays]
  );

  const getInputTypeMain = useCallback(
    (field: string, operator: string) => {
      if (getInputType) {
        const inputType = getInputType(field, operator);
        if (inputType) return inputType;
      }

      return 'text';
    },
    [getInputType]
  );
  // #endregion

  // #region Rule/group creators
  const createRule = useCallback((): RuleType => {
    let field = '';
    /* istanbul ignore else */
    if (fields?.length > 0 && fields[0]) {
      field = getFirstOption(fields) ?? /* istanbul ignore next */ '';
    }
    if (getDefaultField) {
      if (typeof getDefaultField === 'function') {
        field = getDefaultField(fields);
      } else {
        field = getDefaultField;
      }
    }

    const operator = getRuleDefaultOperator(field);

    const valueSource = getValueSourcesMain(field, operator)[0] ?? 'value';

    const newRule: RuleType = {
      id: `r-${generateID()}`,
      field,
      operator,
      valueSource,
      value: '',
    };

    const value = getRuleDefaultValue(newRule);

    return { ...newRule, value };
  }, [fields, getDefaultField, getRuleDefaultOperator, getRuleDefaultValue, getValueSourcesMain]);

  const createRuleGroup = useCallback((): RG => {
    // TODO: figure out how to avoid `@ts-expect-error` here
    if (independentCombinators) {
      // @ts-expect-error TS can't tell that RG means RuleGroupTypeIC
      return {
        id: `g-${generateID()}`,
        rules: addRuleToNewGroups ? [createRule()] : [],
        not: false,
      };
    }
    // @ts-expect-error TS can't tell that RG means RuleGroupType
    return {
      id: `g-${generateID()}`,
      rules: addRuleToNewGroups ? [createRule()] : [],
      combinator: getFirstOption(combinators) ?? /* istanbul ignore next */ '',
      not: false,
    };
  }, [addRuleToNewGroups, combinators, createRule, independentCombinators]);
  // #endregion

  // #region Handle controlled mode vs uncontrolled mode
  const isFirstRender = useRef(true);
  // This state variable is only used when the component is uncontrolled
  const [queryState, setQueryState] = useState(
    defaultQuery ? prepareRuleGroup(defaultQuery) : createRuleGroup()
  );
  // We assume here that if `queryProp` is passed in, and it's not the first render,
  // that `queryProp` has already been prepared, i.e. the user is just passing back
  // the `onQueryChange` callback parameter as `queryProp`. This appears to have a huge
  // performance impact.
  const query: RG = queryProp
    ? isFirstRender.current
      ? prepareRuleGroup(queryProp)
      : queryProp
    : queryState;

  useControlledOrUncontrolled({
    defaultQuery,
    queryProp,
    isFirstRender: isFirstRender.current,
  });

  isFirstRender.current = false;

  // Run `onQueryChange` on mount, if enabled
  useEffect(() => {
    if (enableMountQueryChange) {
      onQueryChange(query);
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
      if (uncontrolled) {
        setQueryState(newQuery);
      }
      onQueryChange(newQuery);
    },
    [onQueryChange, uncontrolled]
  );
  // #endregion

  // #region Query update methods
  const queryDisabled = useMemo(
    () => disabled === true || (Array.isArray(disabled) && disabled.some(p => p.length === 0)),
    [disabled]
  );
  const disabledPaths = useMemo(() => (Array.isArray(disabled) && disabled) || [], [disabled]);

  const onRuleAdd = (rule: RuleType, parentPath: number[], context?: any) => {
    if (pathIsDisabled(parentPath, query) || queryDisabled) {
      // istanbul ignore else
      if (debugMode) {
        onLog({ type: LogType.parentPathDisabled, rule, parentPath, query });
      }
      return;
    }
    const newRule = onAddRule(rule, parentPath, query, context);
    if (!newRule) {
      // istanbul ignore else
      if (debugMode) {
        onLog({ type: LogType.onAddRuleFalse, rule, parentPath, query });
      }
      return;
    }
    const newQuery = add(query, newRule, parentPath, { combinators });
    dispatch(newQuery);
  };

  const onGroupAdd = (ruleGroup: RG, parentPath: number[], context?: any) => {
    if (pathIsDisabled(parentPath, query) || queryDisabled) {
      // istanbul ignore else
      if (debugMode) {
        onLog({
          type: LogType.parentPathDisabled,
          ruleGroup,
          parentPath,
          query,
        });
      }
      return;
    }
    const newGroup = onAddGroup(ruleGroup, parentPath, query, context);
    if (!newGroup) {
      // istanbul ignore else
      if (debugMode) {
        onLog({ type: LogType.onAddGroupFalse, ruleGroup, parentPath, query });
      }
      return;
    }
    const newQuery = add(query, newGroup, parentPath, { combinators });
    dispatch(newQuery);
  };

  const onPropChange = (prop: UpdateableProperties, value: any, path: number[]) => {
    if ((pathIsDisabled(path, query) && prop !== 'disabled') || queryDisabled) {
      if (debugMode) {
        onLog({ type: LogType.pathDisabled, path, prop, value, query });
      }
      return;
    }
    const newQuery = update(query, prop, value, path, {
      resetOnFieldChange,
      resetOnOperatorChange,
      getRuleDefaultOperator,
      getValueSources: getValueSourcesMain,
      getRuleDefaultValue,
    });
    dispatch(newQuery);
  };

  const onRuleOrGroupRemove = (path: number[], context?: any) => {
    if (pathIsDisabled(path, query) || queryDisabled) {
      // istanbul ignore else
      if (debugMode) {
        onLog({ type: LogType.pathDisabled, path, query });
      }
      return;
    }
    const ruleOrGroup = findPath(path, query);
    // istanbul ignore else
    if (ruleOrGroup) {
      if (onRemove(ruleOrGroup as RG | RuleType, path, query, context)) {
        const newQuery = remove(query, path);
        dispatch(newQuery);
      } else {
        if (debugMode) {
          onLog({ type: LogType.onRemoveFalse, ruleOrGroup, path, query });
        }
      }
    }
  };

  const moveRule = (oldPath: number[], newPath: number[], clone?: boolean) => {
    if (pathIsDisabled(oldPath, query) || pathIsDisabled(newPath, query) || queryDisabled) {
      // istanbul ignore else
      if (debugMode) {
        onLog({ type: LogType.pathDisabled, oldPath, newPath, query });
      }
      return;
    }
    const newQuery = move(query, oldPath, newPath, { clone, combinators });
    dispatch(newQuery);
  };
  // #endregion

  const { validationResult, validationMap } = useMemo(() => {
    const validationResult = typeof validator === 'function' ? validator(query) : {};
    const validationMap = typeof validationResult === 'object' ? validationResult : {};
    return { validationResult, validationMap };
  }, [query, validator]);

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
      validationMap,
      disabledPaths,
    }),
    [
      addRuleToNewGroups,
      autoSelectField,
      autoSelectOperator,
      controlClassnames,
      combinators,
      controlElements,
      createRule,
      createRuleGroup,
      disabledPaths,
      enableDragAndDrop,
      fieldMap,
      fields,
      getInputTypeMain,
      getOperatorsMain,
      getValueEditorTypeMain,
      getValueSourcesMain,
      getValuesMain,
      independentCombinators,
      listsAsArrays,
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
        [standardClassnames.disabled]: query.disabled || queryDisabled,
        [standardClassnames.valid]: typeof validationResult === 'boolean' && validationResult,
        [standardClassnames.invalid]: typeof validationResult === 'boolean' && !validationResult,
      }),
    [controlClassnames.queryBuilder, queryDisabled, query.disabled, validationResult]
  );

  useEffect(() => {
    if (debugMode) {
      onLog({ type: LogType.queryUpdate, query, queryState, schema });
    }
  }, [debugMode, onLog, queryState, query, schema]);

  const { ruleGroup: RuleGroupControlElement } = controlElements;

  return (
    <QueryBuilderContext.Provider key={enableDragAndDrop ? 'dnd' : 'no-dnd'} value={rqbContext}>
      <div
        className={wrapperClassName}
        data-dnd={enableDragAndDrop ? 'enabled' : 'disabled'}
        data-inlinecombinators={
          independentCombinators || showCombinatorsBetweenRules ? 'enabled' : 'disabled'
        }>
        <RuleGroupControlElement
          translations={translations}
          ruleGroup={query}
          rules={query.rules}
          combinator={'combinator' in query ? query.combinator : undefined}
          not={!!query.not}
          schema={schema}
          actions={actions}
          id={query.id}
          path={[]}
          disabled={!!query.disabled || queryDisabled}
          parentDisabled={queryDisabled}
          context={context}
        />
      </div>
    </QueryBuilderContext.Provider>
  );
};

QueryBuilder.displayName = 'QueryBuilder';
