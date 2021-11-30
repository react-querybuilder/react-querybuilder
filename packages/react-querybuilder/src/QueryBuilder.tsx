import produce, { enableES5 } from 'immer';
import { useEffect, useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  defaultCombinators,
  defaultControlClassnames,
  defaultControlElements,
  defaultFields,
  defaultOperators,
  defaultTranslations,
  standardClassnames
} from './defaults';
import type {
  Field,
  QueryBuilderProps,
  QueryBuilderPropsInternal,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleType,
  Schema
} from './types';
import {
  c,
  findPath,
  generateID,
  getCommonAncestorPath,
  getParentPath,
  isRuleGroup,
  pathsAreEqual,
  prepareRule,
  prepareRuleGroup,
  regenerateID,
  regenerateIDs,
  uniqByName
} from './utils';

enableES5();

export const QueryBuilder = <RG extends RuleGroupType | RuleGroupTypeIC = RuleGroupType>(
  props: QueryBuilderProps<RG>
) => {
  if (!props.independentCombinators) {
    return QueryBuilderImpl({
      ...props,
      independentCombinators: false
    } as QueryBuilderPropsInternal);
  }
  return QueryBuilderImpl<RuleGroupTypeIC>({
    ...props,
    independentCombinators: true
  } as QueryBuilderPropsInternal<RuleGroupTypeIC>);
};

const QueryBuilderImpl = <RG extends RuleGroupType | RuleGroupTypeIC = RuleGroupType>({
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
  onAddRule = (r) => r,
  onAddGroup = (rg) => rg,
  onQueryChange = () => {},
  controlClassnames,
  showCombinatorsBetweenRules = false,
  showNotToggle = false,
  showCloneButtons = false,
  resetOnFieldChange = true,
  resetOnOperatorChange = false,
  autoSelectField = true,
  addRuleToNewGroups = false,
  enableDragAndDrop = false,
  independentCombinators,
  validator,
  context
}: QueryBuilderPropsInternal<RG>) => {
  const fields = useMemo(() => {
    let f = fieldsProp;
    if (!autoSelectField) {
      f = defaultFields.concat(fieldsProp);
    }
    return uniqByName(f);
  }, [autoSelectField, fieldsProp]);

  const fieldMap = useMemo(() => {
    const fm: { [k: string]: Field } = {};
    fields.forEach((f) => (fm[f.name] = f));
    return fm;
  }, [fields]);

  const getOperatorsMain = (field: string) => {
    const fieldData = fieldMap[field];
    if (fieldData?.operators) {
      return fieldData.operators;
    }
    if (getOperators) {
      const ops = getOperators(field);
      if (ops) return ops;
    }

    return operators;
  };

  const getRuleDefaultOperator = (field: string) => {
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
    return operators.length ? operators[0].name : /* istanbul ignore next */ '';
  };

  const getRuleDefaultValue = (rule: RuleType) => {
    const fieldData = fieldMap[rule.field];
    /* istanbul ignore next */
    if (fieldData?.defaultValue !== undefined && fieldData.defaultValue !== null) {
      return fieldData.defaultValue;
    } else if (getDefaultValue) {
      return getDefaultValue(rule);
    }

    let value: any = '';

    const values = getValuesMain(rule.field, rule.operator);

    if (values.length) {
      value = values[0].name;
    } else {
      const editorType = getValueEditorTypeMain(rule.field, rule.operator);

      if (editorType === 'checkbox') {
        value = false;
      }
    }

    return value;
  };

  /**
   * Gets the ValueEditor type for a given field and operator
   */
  const getValueEditorTypeMain = (field: string, operator: string) => {
    if (getValueEditorType) {
      const vet = getValueEditorType(field, operator);
      if (vet) return vet;
    }

    return 'text';
  };

  /**
   * Gets the `<input />` type for a given field and operator
   */
  const getInputTypeMain = (field: string, operator: string) => {
    if (getInputType) {
      const inputType = getInputType(field, operator);
      if (inputType) return inputType;
    }

    return 'text';
  };

  /**
   * Gets the list of valid values for a given field and operator
   */
  const getValuesMain = (field: string, operator: string) => {
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
  };

  const createRule = (): RuleType => {
    let field = '';
    /* istanbul ignore else */
    if (fields?.length > 0 && fields[0]) {
      field = fields[0].name;
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
      operator
    };

    const value = getRuleDefaultValue(newRule);

    return { ...newRule, value };
  };

  const createRuleGroup = (): RG => {
    if (independentCombinators) {
      return {
        id: `g-${generateID()}`,
        rules: addRuleToNewGroups ? [createRule()] : [],
        not: false
      } as any;
    }
    return {
      id: `g-${generateID()}`,
      rules: addRuleToNewGroups ? [createRule()] : [],
      combinator: combinators[0].name,
      not: false
    } as any;
  };

  const [isFirstRender, setIsFirstRender] = useState(true);
  const [queryState, setQueryState] = useState(defaultQuery ?? createRuleGroup());
  // We assume here that if a query is passed in, and it's not the first render,
  // that the query has already been prepared, i.e. the user is just passing back
  // the onQueryChange callback parameter as query. This appears to have a huge
  // performance impact.
  const root: RG = query ? (isFirstRender ? (prepareRuleGroup(query) as any) : query) : queryState;

  // Notify a query change on mount
  /* istanbul ignore next */
  useEffect(() => {
    if (enableMountQueryChange) {
      onQueryChange(root);
    }
    setIsFirstRender(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Adds a rule to the query
   */
  const onRuleAdd = (rule: RuleType, parentPath: number[]) => {
    const newRule = onAddRule(rule, parentPath, root);
    if (!newRule) return;
    const newQuery = produce(root, (draft) => {
      const parent = findPath(parentPath, draft) as RG;
      if ('combinator' in parent) {
        parent.rules.push(prepareRule(newRule));
      } else {
        if (parent.rules.length > 0) {
          const prevCombinator = parent.rules[parent.rules.length - 2];
          parent.rules.push((typeof prevCombinator === 'string' ? prevCombinator : 'and') as any);
        }
        parent.rules.push(prepareRule(newRule));
      }
    });
    _notifyQueryChange(newQuery);
  };

  /**
   * Adds a rule group to the query
   */
  const onGroupAdd = (group: RG, parentPath: number[]) => {
    const newGroup = onAddGroup(group, parentPath, root);
    if (!newGroup) return;
    const newQuery = produce(root, (draft) => {
      const parent = findPath(parentPath, draft) as RG;
      /* istanbul ignore else */
      if ('combinator' in parent) {
        parent.rules.push(prepareRuleGroup(newGroup) as any);
      } else if (!('combinator' in parent)) {
        if (parent.rules.length > 0) {
          const prevCombinator = parent.rules[parent.rules.length - 2];
          parent.rules.push((typeof prevCombinator === 'string' ? prevCombinator : 'and') as any);
        }
        parent.rules.push(prepareRuleGroup(newGroup) as any);
      }
    });
    _notifyQueryChange(newQuery);
  };

  const onPropChange = (
    prop: Exclude<keyof RuleType | keyof RuleGroupType, 'id' | 'path'>,
    value: any,
    path: number[]
  ) => {
    const newQuery = produce(root, (draft) => {
      const ruleOrGroup = findPath(path, draft);
      /* istanbul ignore if */
      if (!ruleOrGroup) return;
      const isGroup = 'rules' in ruleOrGroup;
      (ruleOrGroup as any)[prop] = value;
      if (!isGroup) {
        // Reset operator and set default value for field change
        if (resetOnFieldChange && prop === 'field') {
          ruleOrGroup.operator = getRuleDefaultOperator(value);
          ruleOrGroup.value = getRuleDefaultValue({ ...ruleOrGroup, field: value });
        }

        // Set default value for operator change
        if (resetOnOperatorChange && prop === 'operator') {
          ruleOrGroup.value = getRuleDefaultValue({ ...ruleOrGroup, operator: value });
        }
      }
    });
    _notifyQueryChange(newQuery);
  };

  const updateIndependentCombinator = (value: string, path: number[]) => {
    const parentPath = getParentPath(path);
    const index = path[path.length - 1];
    const newQuery = produce(root, (draft) => {
      const parentRules = (findPath(parentPath, draft) as RG).rules;
      parentRules[index] = value;
    });
    _notifyQueryChange(newQuery);
  };

  const onRuleOrGroupRemove = (path: number[]) => {
    const parentPath = getParentPath(path);
    const index = path[path.length - 1];
    const newQuery = produce(root, (draft) => {
      const parent = findPath(parentPath, draft) as RG;
      if (!('combinator' in parent) && parent.rules.length > 1) {
        const idxStartDelete = index === 0 ? 0 : index - 1;
        parent.rules.splice(idxStartDelete, 2);
      } else {
        parent.rules.splice(index, 1);
      }
    });
    _notifyQueryChange(newQuery);
  };

  const moveRule = (oldPath: number[], newPath: number[], clone?: boolean) => {
    // No-op if the old and new paths are the same.
    // Ignore in test coverage since components that call this method
    // already prevent this case via their respective canDrop tests.
    /* istanbul ignore if */
    if (pathsAreEqual(oldPath, newPath)) {
      return;
    }

    const parentOldPath = getParentPath(oldPath);
    const ruleOrGroupOriginal = findPath(oldPath, root);
    /* istanbul ignore if */
    if (!ruleOrGroupOriginal) return;
    const ruleOrGroup = clone
      ? 'rules' in ruleOrGroupOriginal
        ? regenerateIDs(ruleOrGroupOriginal)
        : regenerateID(ruleOrGroupOriginal)
      : ruleOrGroupOriginal;

    const commonAncestorPath = getCommonAncestorPath(oldPath, newPath);
    const movingOnUp = newPath[commonAncestorPath.length] <= oldPath[commonAncestorPath.length];

    const newQuery = produce(root, (draft) => {
      const parentOfRuleToRemove = findPath(parentOldPath, draft) as RG;
      const ruleToRemoveIndex = oldPath[oldPath.length - 1];
      const oldPrevCombinator =
        independentCombinators && ruleToRemoveIndex > 0
          ? (parentOfRuleToRemove.rules[ruleToRemoveIndex - 1] as string)
          : null;
      const oldNextCombinator =
        independentCombinators && ruleToRemoveIndex < parentOfRuleToRemove.rules.length - 1
          ? (parentOfRuleToRemove.rules[ruleToRemoveIndex + 1] as string)
          : null;
      /* istanbul ignore else */
      if (!clone) {
        const idxStartDelete = independentCombinators
          ? Math.max(0, ruleToRemoveIndex - 1)
          : ruleToRemoveIndex;
        const deleteLength = independentCombinators ? 2 : 1;
        // Remove the source item
        parentOfRuleToRemove.rules.splice(idxStartDelete, deleteLength);
      }

      const newNewPath = [...newPath];
      /* istanbul ignore else */
      if (!movingOnUp && !clone) {
        newNewPath[commonAncestorPath.length] -= independentCombinators ? 2 : 1;
      }
      const newNewParentPath = getParentPath(newNewPath);
      const parentToInsertInto = findPath(newNewParentPath, draft) as RG;
      const newIndex = newNewPath[newNewPath.length - 1];

      // Insert the source item at the target path
      if (parentToInsertInto.rules.length === 0 || !independentCombinators) {
        parentToInsertInto.rules.splice(newIndex, 0, ruleOrGroup);
      } else {
        if (newIndex === 0) {
          if (ruleToRemoveIndex === 0 && oldNextCombinator) {
            parentToInsertInto.rules.splice(newIndex, 0, ruleOrGroup, oldNextCombinator);
          } else {
            const newNextCombinator =
              parentToInsertInto.rules[1] ||
              oldPrevCombinator ||
              /* istanbul ignore next */ combinators[0].name;
            parentToInsertInto.rules.splice(newIndex, 0, ruleOrGroup, newNextCombinator);
          }
        } else {
          if (oldPrevCombinator) {
            parentToInsertInto.rules.splice(newIndex, 0, oldPrevCombinator, ruleOrGroup);
          } else {
            const newPrevCombinator =
              parentToInsertInto.rules[newIndex - 2] || oldNextCombinator || combinators[0].name;
            parentToInsertInto.rules.splice(newIndex, 0, newPrevCombinator, ruleOrGroup);
          }
        }
      }
    });
    _notifyQueryChange(newQuery);
  };

  /**
   * Executes the `onQueryChange` function if provided,
   * and sets the state for uncontrolled components
   */
  const _notifyQueryChange = (newQuery: RG) => {
    // State variable only used when component is uncontrolled
    if (!query) {
      setQueryState(newQuery);
    }
    onQueryChange(newQuery);
  };

  const validationResult = useMemo(
    () => (typeof validator === 'function' ? validator(root) : {}),
    [root, validator]
  );
  const validationMap = typeof validationResult === 'object' ? validationResult : {};

  const schema: Schema = {
    fields,
    fieldMap,
    combinators,
    classNames: { ...defaultControlClassnames, ...controlClassnames },
    createRule,
    createRuleGroup,
    onRuleAdd,
    onGroupAdd,
    onRuleRemove: onRuleOrGroupRemove,
    onGroupRemove: onRuleOrGroupRemove,
    onPropChange,
    isRuleGroup,
    controls: { ...defaultControlElements, ...controlElements },
    getOperators: getOperatorsMain,
    getValueEditorType: getValueEditorTypeMain,
    getInputType: getInputTypeMain,
    getValues: getValuesMain,
    updateIndependentCombinator,
    moveRule,
    showCombinatorsBetweenRules,
    showNotToggle,
    showCloneButtons,
    autoSelectField,
    addRuleToNewGroups,
    enableDragAndDrop,
    independentCombinators: !!independentCombinators,
    validationMap
  };

  const className = useMemo(
    () =>
      c(
        standardClassnames.queryBuilder,
        schema.classNames.queryBuilder,
        typeof validationResult === 'boolean'
          ? validationResult
            ? standardClassnames.valid
            : standardClassnames.invalid
          : ''
      ),
    [schema.classNames.queryBuilder, validationResult]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={className}
        data-dnd={enableDragAndDrop ? 'enabled' : 'disabled'}
        data-inlinecombinators={
          independentCombinators || showCombinatorsBetweenRules ? 'enabled' : 'disabled'
        }>
        <schema.controls.ruleGroup
          translations={{ ...defaultTranslations, ...translations }}
          rules={root.rules}
          combinator={'combinator' in root ? root.combinator : undefined}
          schema={schema}
          id={root.id}
          path={[]}
          not={!!root.not}
          context={context}
        />
      </div>
    </DndProvider>
  );
};

QueryBuilder.displayName = 'QueryBuilder';
