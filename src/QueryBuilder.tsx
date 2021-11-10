import produce, { enableES5 } from 'immer';
import { useEffect, useState } from 'react';
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
import './query-builder.scss';
import {
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
  prepareRule,
  prepareRuleGroup,
  getParentPath,
  isRuleGroup,
  uniqByName
} from './utils';

enableES5();

export const QueryBuilder = <RG extends RuleGroupType | RuleGroupTypeIC = RuleGroupType>(
  props: QueryBuilderProps<RG>
) => {
  if (!props.inlineCombinators) {
    return QueryBuilderImpl({ ...props, inlineCombinators: false } as QueryBuilderPropsInternal);
  }
  return QueryBuilderImpl<RuleGroupTypeIC>({ ...props, inlineCombinators: true });
};

const QueryBuilderImpl = <RG extends RuleGroupType | RuleGroupTypeIC = RuleGroupType>({
  query,
  fields = defaultFields,
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
  inlineCombinators,
  validator,
  context
}: QueryBuilderPropsInternal<RG>) => {
  if (!autoSelectField) {
    fields = defaultFields.concat(fields);
  }

  const fieldMap: { [k: string]: Field } = {};
  fields = uniqByName(fields);
  fields.forEach((f) => (fieldMap[f.name] = f));

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
    if (inlineCombinators) {
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

  const [queryState, setQueryState] = useState(createRuleGroup());
  const root: RG = query ? (prepareRuleGroup(query) as any) : queryState;

  // Notify a query change on mount
  /* istanbul ignore next */
  useEffect(() => {
    if (enableMountQueryChange) {
      onQueryChange(root);
    }
  }, []);

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

  /**
   * Gets the operators for a given field
   */
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
          parent.rules.push(typeof prevCombinator === 'string' ? prevCombinator : 'and');
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
      if ('combinator' in parent) {
        parent.rules.push(prepareRuleGroup(newGroup) as any);
      } else if (!('combinator' in parent)) {
        if (parent.rules.length > 0) {
          const prevCombinator = parent.rules[parent.rules.length - 2];
          parent.rules.push(typeof prevCombinator === 'string' ? prevCombinator : 'and');
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

  const updateInlineCombinator = (value: string, path: number[]) => {
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

  const moveRule = (oldPath: number[], newPath: number[]) => {
    // No-op if the old and new paths are the same
    if (oldPath.join('-') === newPath.join('-')) {
      return;
    }

    const parentOldPath = getParentPath(oldPath);
    const parentNewPath = getParentPath(newPath);
    const ruleOrGroup = findPath(oldPath, root)!;

    const commonAncestorPath: number[] = [];
    for (
      let i = 0;
      i < parentOldPath.length && i < parentNewPath.length && parentOldPath[i] === parentNewPath[i];
      i++
    ) {
      commonAncestorPath.push(parentNewPath[i]);
    }
    const movedUp = newPath[commonAncestorPath.length] < oldPath[commonAncestorPath.length];

    const newQuery = produce(root, (draft) => {
      const parentOfRuleToRemove = findPath(parentOldPath, draft) as RG;
      parentOfRuleToRemove.rules.splice(oldPath[oldPath.length - 1], 1);
      const newNewPath = [...newPath];
      if (!movedUp) {
        newNewPath[commonAncestorPath.length] -= 1;
      }
      const newNewParentPath = getParentPath(newNewPath);
      const parentToInsertInto = findPath(newNewParentPath, draft) as RG;
      parentToInsertInto.rules.splice(newNewPath[newNewPath.length - 1], 0, ruleOrGroup);
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

  const validationResult = typeof validator === 'function' ? validator(root) : {};
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
    updateInlineCombinator,
    moveRule,
    showCombinatorsBetweenRules,
    showNotToggle,
    showCloneButtons,
    autoSelectField,
    addRuleToNewGroups,
    enableDragAndDrop,
    inlineCombinators: !!inlineCombinators,
    validationMap
  };

  const className = c(
    standardClassnames.queryBuilder,
    schema.classNames.queryBuilder,
    typeof validationResult === 'boolean'
      ? validationResult
        ? standardClassnames.valid
        : standardClassnames.invalid
      : ''
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={className} data-dnd={enableDragAndDrop ? 'enabled' : 'disabled'}>
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
