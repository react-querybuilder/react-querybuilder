import clone from 'lodash/clone';
import cloneDeep from 'lodash/cloneDeep';
import uniqWith from 'lodash/uniqWith';
import { useEffect, useState } from 'react';
import {
  defaultCombinators,
  defaultControlClassnames,
  defaultControlElements,
  defaultOperators,
  defaultTranslations,
  standardClassnames
} from './defaults';
import './query-builder.scss';
import { Field, QueryBuilderProps, RuleGroupType, RuleType, Schema } from './types';
import { c, findPath, generateID, generateValidQueryObject, isRuleGroup } from './utils';

export const QueryBuilder = ({
  query,
  fields = [],
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
  onAddRule,
  onAddGroup,
  onQueryChange,
  controlClassnames,
  showCombinatorsBetweenRules = false,
  showNotToggle = false,
  showCloneButtons = false,
  resetOnFieldChange = true,
  resetOnOperatorChange = false,
  autoSelectField = true,
  addRuleToNewGroups = false,
  validator,
  context
}: QueryBuilderProps) => {
  if (!autoSelectField) {
    fields = [{ id: '~', name: '~', label: '------' } as Field].concat(fields);
  }

  const fieldMap: { [k: string]: Field } = {};
  fields = uniqWith(fields, (a, b) => a.name === b.name);
  fields.forEach((f) => (fieldMap[f.name] = f));

  /**
   * Gets the initial query
   */
  const getInitialQuery = () => {
    return generateValidQueryObject(query || createRuleGroup());
  };

  const createRule = (): RuleType => {
    let field = '';
    if (fields?.length && fields[0]) {
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

  const createRuleGroup = (): RuleGroupType => {
    return {
      id: `g-${generateID()}`,
      rules: addRuleToNewGroups ? [createRule()] : [],
      combinator: combinators[0].name,
      not: false
    };
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
    const newRule = typeof onAddRule === 'function' ? onAddRule(rule, parentPath, root) : rule;
    if (!newRule) return;
    const rootCopy = cloneDeep(root);
    const parent = findPath(parentPath, rootCopy) as RuleGroupType;
    const thisPath = parentPath.concat([parent.rules.length]);
    parent.rules.push(generateValidQueryObject(newRule, thisPath));
    setRoot(rootCopy);
    _notifyQueryChange(rootCopy);
  };

  /**
   * Adds a rule group to the query
   */
  const onGroupAdd = (group: RuleGroupType, parentPath: number[]) => {
    const newGroup = typeof onAddGroup === 'function' ? onAddGroup(group, parentPath, root) : group;
    if (!newGroup) return;
    const rootCopy = cloneDeep(root);
    const parent = findPath(parentPath, rootCopy) as RuleGroupType;
    const thisPath = parentPath.concat([parent.rules.length]);
    parent.rules.push(generateValidQueryObject(newGroup, thisPath));
    setRoot(rootCopy);
    _notifyQueryChange(rootCopy);
  };

  const onPropChange = (
    prop: Exclude<keyof RuleType | keyof RuleGroupType, 'id' | 'path'>,
    value: any,
    path: number[]
  ) => {
    const rootCopy = cloneDeep(root);
    const rule = findPath(path, rootCopy);
    /* istanbul ignore else */
    if (rule) {
      const isGroup = isRuleGroup(rule);

      // TODO: there has to be a better way to do this
      if (isGroup) {
        (rule[prop as keyof RuleGroupType] as any) = value;
      } else {
        rule[prop as keyof RuleType] = value;
      }

      if (!isGroup) {
        // Reset operator and set default value for field change
        if (resetOnFieldChange && prop === 'field') {
          const operator = getRuleDefaultOperator(rule.field);
          rule.operator = operator;
          rule.value = getRuleDefaultValue(rule);
        }

        if (resetOnOperatorChange && prop === 'operator') {
          rule.value = getRuleDefaultValue(rule);
        }
      }

      setRoot(rootCopy);
      _notifyQueryChange(rootCopy);
    }
  };

  /**
   * Removes a rule from the query
   */
  const onRuleRemove = (path: number[]) => {
    const rootCopy = cloneDeep(root);
    const parentPath = clone(path);
    const index = parentPath.pop();
    const parent = findPath(parentPath, rootCopy) as RuleGroupType;
    /* istanbul ignore else */
    if (parent) {
      parent.rules.splice(index!, 1);

      setRoot(rootCopy);
      _notifyQueryChange(rootCopy);
    }
  };

  /**
   * Removes a rule group from the query
   */
  const onGroupRemove = (path: number[]) => {
    const rootCopy = cloneDeep(root);
    const parentPath = clone(path);
    const index = parentPath.pop();
    const parent = findPath(parentPath, rootCopy) as RuleGroupType;
    /* istanbul ignore else */
    if (parent) {
      parent.rules.splice(index!, 1);

      setRoot(rootCopy);
      _notifyQueryChange(rootCopy);
    }
  };

  /**
   * Executes the `onQueryChange` function, if provided
   */
  const _notifyQueryChange = (newRoot: RuleGroupType) => {
    /* istanbul ignore else */
    if (onQueryChange) {
      const newQuery = cloneDeep(newRoot);
      onQueryChange(newQuery);
    }
  };

  const [root, setRoot] = useState(getInitialQuery() as RuleGroupType);

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
    onRuleRemove,
    onGroupRemove,
    onPropChange,
    isRuleGroup,
    controls: { ...defaultControlElements, ...controlElements },
    getOperators: getOperatorsMain,
    getValueEditorType: getValueEditorTypeMain,
    getInputType: getInputTypeMain,
    getValues: getValuesMain,
    showCombinatorsBetweenRules,
    showNotToggle,
    showCloneButtons,
    autoSelectField,
    addRuleToNewGroups,
    validationMap
  };

  // Set the query state when a new query prop comes in
  useEffect(() => {
    setRoot(generateValidQueryObject(query || getInitialQuery()));
  }, [query]);

  // Notify a query change on mount
  /* istanbul ignore next */
  useEffect(() => {
    if (enableMountQueryChange) {
      _notifyQueryChange(root);
    }
  }, []);

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
    <div className={className}>
      <schema.controls.ruleGroup
        translations={{ ...defaultTranslations, ...translations }}
        rules={root.rules}
        combinator={root.combinator}
        schema={schema}
        id={root.id}
        path={[]}
        not={!!root.not}
        context={context}
      />
    </div>
  );
};

QueryBuilder.displayName = 'QueryBuilder';
