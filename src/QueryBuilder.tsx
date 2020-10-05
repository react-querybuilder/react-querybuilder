import arrayFindIndex from 'array-find-index';
import cloneDeep from 'lodash/cloneDeep';
import { nanoid } from 'nanoid';
import objectAssign from 'object-assign';
import React, { useEffect, useState } from 'react';
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
import { findRule, generateValidQuery, getLevel, isRuleGroup } from './utils';

const defaultTranslations: Translations = {
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

const defaultOperators: NameLabelPair[] = [
  { name: 'null', label: 'is null' },
  { name: 'notNull', label: 'is not null' },
  { name: 'in', label: 'in' },
  { name: 'notIn', label: 'not in' },
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
  { name: 'doesNotEndWith', label: 'does not end with' }
];

const defaultCombinators: NameLabelPair[] = [
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

export const QueryBuilder: React.FC<QueryBuilderProps> = ({
  query,
  fields = [],
  operators = defaultOperators,
  combinators = defaultCombinators,
  translations = defaultTranslations,
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
  resetOnOperatorChange = false
}) => {
  /**
   * Gets the initial query
   */
  const getInitialQuery = () => {
    return (query && generateValidQuery(query)) || createRuleGroup();
  };

  const createRule = (): RuleType => {
    let field = '';
    if (fields && fields[0]) {
      field = fields[0].name
    }
    if (getDefaultField) {
      if (typeof getDefaultField === 'string') {
        field = getDefaultField;
      } else {
        field = getDefaultField(fields);
      }
    }

    return {
      id: `r-${nanoid()}`,
      field,
      value: '',
      operator: getOperatorsMain(field)[0].name
    };
  };

  const createRuleGroup = (): RuleGroupType => {
    return {
      id: `g-${nanoid()}`,
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
    if (getOperators) {
      const ops = getOperators(field);
      if (ops) return ops;
    }

    return operators;
  };

  const getRuleDefaultValue =
    getDefaultValue ??
    ((rule: RuleType) => {
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
    });

  /**
   * Adds a rule to the query
   */
  const onRuleAdd = (rule: RuleType, parentId: string) => {
    const rootCopy = cloneDeep(root);
    const parent = findRule(parentId, rootCopy) as RuleGroupType;
    /* istanbul ignore else */
    if (parent) {
      parent.rules.push({
        ...rule,
        value: getRuleDefaultValue(rule)
      });
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
  useEffect(() => {
    _notifyQueryChange(root);
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
      />
    </div>
  );
};

QueryBuilder.displayName = 'QueryBuilder';
