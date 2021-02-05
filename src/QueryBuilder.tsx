import arrayFind from 'array-find';
import arrayFindIndex from 'array-find-index';
import cloneDeep from 'lodash/cloneDeep';
import objectAssign from 'object-assign';
import { useEffect, useState } from 'react';
import { ActionElement, NotToggle, ValueEditor, ValueSelector } from './controls';
import { Rule } from './Rule';
import { RuleGroup } from './RuleGroup';
import {
  Classnames,
  Controls,
  NameLabelPair,
  QueryBuilderProps,
  RuleGroupType,
  RuleType,
  Schema,
  Translations
} from './types';
import { findRule, generateID, generateValidQuery, getLevel, isRuleGroup } from './utils';

export const defaultTranslations: Translations = {
  fields: {
    title: 'Fields'
  },
  operators: {
    title: 'Operators'
  },
  value: {
    title: 'Value'
  },
  removeRule: {
    label: 'x',
    title: 'Remove rule'
  },
  removeGroup: {
    label: 'x',
    title: 'Remove group'
  },
  addRule: {
    label: '+Rule',
    title: 'Add rule'
  },
  addGroup: {
    label: '+Group',
    title: 'Add group'
  },
  combinators: {
    title: 'Combinators'
  },
  notToggle: {
    title: 'Invert this group'
  }
};

export const defaultOperators: NameLabelPair[] = [
  { name: '=', label: '=' },
  { name: '!=', label: '!=' },
  { name: '<', label: '<' },
  { name: '>', label: '>' },
  { name: '<=', label: '<=' },
  { name: '>=', label: '>=' },
  { name: 'contains', label: 'contains' },
  { name: 'beginsWith', label: 'begins with' },
  { name: 'endsWith', label: 'ends with' },
  { name: 'doesNotContain', label: 'does not contain' },
  { name: 'doesNotBeginWith', label: 'does not begin with' },
  { name: 'doesNotEndWith', label: 'does not end with' },
  { name: 'null', label: 'is null' },
  { name: 'notNull', label: 'is not null' },
  { name: 'in', label: 'in' },
  { name: 'notIn', label: 'not in' }
];

export const defaultCombinators: NameLabelPair[] = [
  { name: 'and', label: 'AND' },
  { name: 'or', label: 'OR' }
];

const defaultControlClassnames: Classnames = {
  queryBuilder: '',
  ruleGroup: '',
  header: '',
  combinators: '',
  addRule: '',
  addGroup: '',
  removeGroup: '',
  notToggle: '',
  rule: '',
  fields: '',
  operators: '',
  value: '',
  removeRule: ''
};

const defaultControlElements: Controls = {
  addGroupAction: ActionElement,
  removeGroupAction: ActionElement,
  addRuleAction: ActionElement,
  removeRuleAction: ActionElement,
  combinatorSelector: ValueSelector,
  fieldSelector: ValueSelector,
  operatorSelector: ValueSelector,
  valueEditor: ValueEditor,
  notToggle: NotToggle,
  ruleGroup: RuleGroup,
  rule: Rule
};

export const QueryBuilder = ({
  query,
  fields = [],
  operators = defaultOperators,
  combinators = defaultCombinators,
  translations = defaultTranslations,
  enableMountQueryChange = true,
  controlElements,
  getDefaultField,
  getDefaultValue,
  getOperators,
  getValueEditorType,
  getInputType,
  getValues,
  onQueryChange,
  controlClassnames,
  showCombinatorsBetweenRules = false,
  showNotToggle = false,
  resetOnFieldChange = true,
  resetOnOperatorChange = false,
  context
}: QueryBuilderProps) => {
  /**
   * Gets the initial query
   */
  const getInitialQuery = () => {
    return (query && generateValidQuery(query)) || createRuleGroup();
  };

  const createRule = (): RuleType => {
    let field = '';
    if (fields && fields[0]) {
      field = fields[0].name;
    }
    if (getDefaultField) {
      if (typeof getDefaultField === 'string') {
        field = getDefaultField;
      } else {
        field = getDefaultField(fields);
      }
    }

    const f = arrayFind(fields, (f) => f.name === field);
    const value = f?.defaultValue ?? '';

    return {
      id: `r-${generateID()}`,
      field,
      value,
      operator: getOperatorsMain(field)[0].name
    };
  };

  const createRuleGroup = (): RuleGroupType => {
    return {
      id: `g-${generateID()}`,
      rules: [],
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
    const fieldData = arrayFind(fields, (f) => f.name === field);
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
    const fieldData = arrayFind(fields, (f) => f.name === field);
    if (fieldData?.operators) {
      return fieldData.operators;
    }
    if (getOperators) {
      const ops = getOperators(field);
      if (ops) return ops;
    }

    return operators;
  };

  const getRuleDefaultValue = (rule: RuleType) => {
    const fieldData = arrayFind(fields, (f) => f.name === rule.field);
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
  const onRuleAdd = (rule: RuleType, parentId: string) => {
    const rootCopy = cloneDeep(root);
    const parent = findRule(parentId, rootCopy) as RuleGroupType;
    const fieldData = arrayFind(fields, (f) => f.name === rule.field);
    const value = fieldData?.defaultValue ?? getRuleDefaultValue(rule);
    /* istanbul ignore else */
    if (parent) {
      parent.rules.push({ ...rule, value });
      setRoot(rootCopy);
      _notifyQueryChange(rootCopy);
    }
  };

  /**
   * Adds a rule group to the query
   */
  const onGroupAdd = (group: RuleGroupType, parentId: string) => {
    const rootCopy = cloneDeep(root);
    const parent = findRule(parentId, rootCopy) as RuleGroupType;
    /* istanbul ignore else */
    if (parent) {
      parent.rules.push(group);
      setRoot(rootCopy);
      _notifyQueryChange(rootCopy);
    }
  };

  const onPropChange = (prop: string, value: any, ruleId: string) => {
    const rootCopy = cloneDeep(root);
    const rule = findRule(ruleId, rootCopy) as RuleType;
    /* istanbul ignore else */
    if (rule) {
      objectAssign(rule, { [prop]: value });

      // Reset operator and set default value for field change
      if (resetOnFieldChange && prop === 'field') {
        objectAssign(rule, {
          operator: getOperatorsMain(rule.field)[0].name,
          value: getRuleDefaultValue(rule)
        });
      }

      if (resetOnOperatorChange && prop === 'operator') {
        Object.assign(rule, {
          value: getRuleDefaultValue(rule)
        });
      }

      setRoot(rootCopy);
      _notifyQueryChange(rootCopy);
    }
  };

  /**
   * Removes a rule from the query
   */
  const onRuleRemove = (ruleId: string, parentId: string) => {
    const rootCopy = cloneDeep(root);
    const parent = findRule(parentId, rootCopy) as RuleGroupType;
    /* istanbul ignore else */
    if (parent) {
      const index = arrayFindIndex(parent.rules, (x) => x.id === ruleId);

      parent.rules.splice(index, 1);

      setRoot(rootCopy);
      _notifyQueryChange(rootCopy);
    }
  };

  /**
   * Removes a rule group from the query
   */
  const onGroupRemove = (groupId: string, parentId: string) => {
    const rootCopy = cloneDeep(root);
    const parent = findRule(parentId, rootCopy) as RuleGroupType;
    /* istanbul ignore else */
    if (parent) {
      const index = arrayFindIndex(parent.rules, (x) => x.id === groupId);

      parent.rules.splice(index, 1);

      setRoot(rootCopy);
      _notifyQueryChange(rootCopy);
    }
  };

  /**
   * Gets the level of the rule with the provided ID
   */
  const getLevelFromRoot = (id: string) => {
    return getLevel(id, 0, root);
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

  const schema: Schema = {
    fields,
    combinators,
    classNames: { ...defaultControlClassnames, ...controlClassnames },
    createRule,
    createRuleGroup,
    onRuleAdd,
    onGroupAdd,
    onRuleRemove,
    onGroupRemove,
    onPropChange,
    getLevel: getLevelFromRoot,
    isRuleGroup,
    controls: { ...defaultControlElements, ...controlElements },
    getOperators: getOperatorsMain,
    getValueEditorType: getValueEditorTypeMain,
    getInputType: getInputTypeMain,
    getValues: getValuesMain,
    showCombinatorsBetweenRules,
    showNotToggle
  };

  // Set the query state when a new query prop comes in
  useEffect(() => {
    setRoot(generateValidQuery(query || getInitialQuery()) as RuleGroupType);
  }, [query]);

  // Notify a query change on mount
  /* istanbul ignore next */
  useEffect(() => {
    if (enableMountQueryChange) {
      _notifyQueryChange(root);
    }
  }, []);

  return (
    <div className={`queryBuilder ${schema.classNames.queryBuilder}`}>
      <schema.controls.ruleGroup
        translations={{ ...defaultTranslations, ...translations }}
        rules={root.rules}
        combinator={root.combinator}
        schema={schema}
        id={root.id}
        not={!!root.not}
        context={context}
      />
    </div>
  );
};

QueryBuilder.displayName = 'QueryBuilder';
