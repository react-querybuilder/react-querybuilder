import { enableES5 } from 'immer';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  defaultCombinators,
  defaultControlClassnames,
  defaultControlElements,
  defaultFields,
  defaultOperators,
  defaultTranslations,
  standardClassnames,
} from './defaults';
import {
  Field,
  QueryBuilderProps,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleType,
  Schema,
  UpdateableProperties,
} from './types';
import {
  add,
  c,
  generateID,
  getFirstOption,
  isOptionGroupArray,
  isRuleGroup,
  move,
  pathIsDisabled,
  prepareRuleGroup,
  remove,
  uniqByName,
  uniqOptGroups,
  update,
} from './utils';

enableES5();

export const QueryBuilder = <RG extends RuleGroupType | RuleGroupTypeIC>({
  defaultQuery,
  query,
  fields: fieldsProp = defaultFields,
  operators = defaultOperators,
  combinators = defaultCombinators,
  translations = defaultTranslations,
  enableMountQueryChange = true,
  controlElements,
  getDefaultField,
  getDefaultOperator,
  getDefaultValue,
  getOperators,
  getValueEditorType,
  getInputType,
  getValues,
  onAddRule = r => r,
  onAddGroup = rg => rg,
  onQueryChange = () => {},
  controlClassnames,
  showCombinatorsBetweenRules = false,
  showNotToggle = false,
  showCloneButtons = false,
  showLockButtons = false,
  resetOnFieldChange = true,
  resetOnOperatorChange = false,
  autoSelectField = true,
  addRuleToNewGroups = false,
  enableDragAndDrop = false,
  independentCombinators,
  disabled = false,
  validator,
  context,
}: QueryBuilderProps<RG>) => {
  const fields = useMemo(() => {
    let f = fieldsProp;
    if (!autoSelectField) {
      if (isOptionGroupArray(fieldsProp)) {
        f = [{ label: '------', options: defaultFields }].concat(fieldsProp);
      } else {
        f = defaultFields.concat(fieldsProp);
      }
    }
    return isOptionGroupArray(f) ? uniqOptGroups(f) : uniqByName(f);
  }, [autoSelectField, fieldsProp]);

  const fieldMap = useMemo(() => {
    const fm: { [k: string]: Field } = {};
    if (isOptionGroupArray(fields)) {
      fields.forEach(f => f.options.forEach(opt => (fm[opt.name] = opt)));
    } else {
      fields.forEach(f => (fm[f.name] = f));
    }
    return fm;
  }, [fields]);

  const queryDisabled = useMemo(
    () => disabled === true || (Array.isArray(disabled) && disabled.some(p => p.length === 0)),
    [disabled]
  );
  const disabledPaths = useMemo(() => (Array.isArray(disabled) && disabled) || [], [disabled]);

  const getOperatorsMain = useCallback(
    (field: string) => {
      const fieldData = fieldMap[field];
      if (fieldData?.operators) {
        return fieldData.operators;
      }
      if (getOperators) {
        const ops = getOperators(field);
        if (ops) return ops;
      }

      return operators;
    },
    [fieldMap, getOperators, operators]
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

      const operators = getOperatorsMain(field) ?? /* istanbul ignore next */ [];
      return operators.length
        ? getFirstOption(operators) ?? /* istanbul ignore next */ ''
        : /* istanbul ignore next */ '';
    },
    [fieldMap, getDefaultOperator, getOperatorsMain]
  );

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

  const getValuesMain = useCallback(
    (field: string, operator: string) => {
      const fieldData = fieldMap[field];
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
      /* istanbul ignore if */
      if (fieldData?.defaultValue !== undefined && fieldData.defaultValue !== null) {
        return fieldData.defaultValue;
      } else if (getDefaultValue) {
        return getDefaultValue(rule);
      }

      let value: any = '';

      const values = getValuesMain(rule.field, rule.operator);

      if (values.length) {
        value = getFirstOption(values);
      } else {
        const editorType = getValueEditorTypeMain(rule.field, rule.operator);

        if (editorType === 'checkbox') {
          value = false;
        }
      }

      return value;
    },
    [fieldMap, getDefaultValue, getValueEditorTypeMain, getValuesMain]
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

    const newRule: RuleType = {
      id: `r-${generateID()}`,
      field,
      value: '',
      operator,
    };

    const value = getRuleDefaultValue(newRule);

    return { ...newRule, value };
  }, [fields, getDefaultField, getRuleDefaultOperator, getRuleDefaultValue]);

  const createRuleGroup = useCallback((): RG => {
    if (independentCombinators) {
      return {
        id: `g-${generateID()}`,
        rules: addRuleToNewGroups ? [createRule()] : [],
        not: false,
      } as any;
    }
    return {
      id: `g-${generateID()}`,
      rules: addRuleToNewGroups ? [createRule()] : [],
      combinator: getFirstOption(combinators) ?? /* istanbul ignore next */ '',
      not: false,
    } as any;
  }, [addRuleToNewGroups, combinators, createRule, independentCombinators]);

  const isFirstRender = useRef(true);
  const [queryState, setQueryState] = useState(defaultQuery ?? createRuleGroup());
  // We assume here that if a query is passed in, and it's not the first render,
  // that the query has already been prepared, i.e. the user is just passing back
  // the onQueryChange callback parameter as query. This appears to have a huge
  // performance impact.
  const root: RG = query ? (isFirstRender.current ? prepareRuleGroup(query) : query) : queryState;
  isFirstRender.current = false;

  // Notify a query change on mount
  useEffect(() => {
    if (enableMountQueryChange) {
      onQueryChange(root);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Executes the `onQueryChange` function if provided,
   * and sets the state for uncontrolled components
   */
  const dispatch = useCallback(
    (newQuery: RG) => {
      // State variable only used when component is uncontrolled
      if (!query) {
        setQueryState(newQuery);
      }
      onQueryChange(newQuery);
    },
    [onQueryChange, query]
  );

  const onRuleAdd = (rule: RuleType, parentPath: number[]) => {
    if (pathIsDisabled(parentPath, root) || queryDisabled) return;
    const newRule = onAddRule(rule, parentPath, root);
    if (!newRule) return;
    const newQuery = add(root, newRule, parentPath);
    dispatch(newQuery);
  };

  const onGroupAdd = (group: RG, parentPath: number[]) => {
    if (pathIsDisabled(parentPath, root) || queryDisabled) return;
    const newGroup = onAddGroup(group, parentPath, root);
    if (!newGroup) return;
    const newQuery = add(root, newGroup, parentPath);
    dispatch(newQuery);
  };

  const onPropChange = (prop: UpdateableProperties, value: any, path: number[]) => {
    if ((pathIsDisabled(path, root) && prop !== 'disabled') || queryDisabled) return;
    const newQuery = update(root, prop, value, path, {
      resetOnFieldChange,
      resetOnOperatorChange,
      getRuleDefaultOperator,
      getRuleDefaultValue,
    });
    dispatch(newQuery);
  };

  const onRuleOrGroupRemove = (path: number[]) => {
    if (pathIsDisabled(path, root) || queryDisabled) return;
    const newQuery = remove(root, path);
    dispatch(newQuery);
  };

  const moveRule = (oldPath: number[], newPath: number[], clone?: boolean) => {
    if (pathIsDisabled(oldPath, root) || pathIsDisabled(newPath, root) || queryDisabled) return;
    const newQuery = move(root, oldPath, newPath, { clone, combinators });
    dispatch(newQuery);
  };

  const validationResult = useMemo(
    () => (typeof validator === 'function' ? validator(root) : {}),
    [root, validator]
  );
  const validationMap = useMemo(
    () => (typeof validationResult === 'object' ? validationResult : {}),
    [validationResult]
  );

  const classNames = useMemo(
    () => ({ ...defaultControlClassnames, ...controlClassnames }),
    [controlClassnames]
  );

  const controls = useMemo(
    () => ({ ...defaultControlElements, ...controlElements }),
    [controlElements]
  );

  const schema: Schema = {
    fields,
    fieldMap,
    combinators,
    classNames,
    createRule,
    createRuleGroup,
    onRuleAdd,
    onGroupAdd,
    onRuleRemove: onRuleOrGroupRemove,
    onGroupRemove: onRuleOrGroupRemove,
    onPropChange,
    isRuleGroup,
    controls,
    getOperators: getOperatorsMain,
    getValueEditorType: getValueEditorTypeMain,
    getInputType: getInputTypeMain,
    getValues: getValuesMain,
    moveRule,
    showCombinatorsBetweenRules,
    showNotToggle,
    showCloneButtons,
    showLockButtons,
    autoSelectField,
    addRuleToNewGroups,
    enableDragAndDrop,
    independentCombinators: !!independentCombinators,
    validationMap,
    disabledPaths,
  };

  const wrapperClassName = useMemo(
    () =>
      c(
        standardClassnames.queryBuilder,
        classNames.queryBuilder,
        root.disabled || queryDisabled ? standardClassnames.disabled : '',
        typeof validationResult === 'boolean'
          ? validationResult
            ? standardClassnames.valid
            : standardClassnames.invalid
          : ''
      ),
    [classNames.queryBuilder, queryDisabled, root.disabled, validationResult]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={wrapperClassName}
        data-dnd={enableDragAndDrop ? 'enabled' : 'disabled'}
        data-inlinecombinators={
          independentCombinators || showCombinatorsBetweenRules ? 'enabled' : 'disabled'
        }>
        <controls.ruleGroup
          translations={{ ...defaultTranslations, ...translations }}
          rules={root.rules}
          combinator={'combinator' in root ? root.combinator : undefined}
          schema={schema}
          id={root.id}
          path={[]}
          not={!!root.not}
          disabled={!!root.disabled || queryDisabled}
          parentDisabled={queryDisabled}
          context={context}
        />
      </div>
    </DndProvider>
  );
};

QueryBuilder.displayName = 'QueryBuilder';
