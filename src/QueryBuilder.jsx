import cloneDeep from 'lodash/cloneDeep';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import nanoid from 'nanoid';
import { ActionElement, NotToggle, ValueEditor, ValueSelector } from './controls';
import RuleGroup from './RuleGroup';
import { findRule, generateValidQuery, getLevel, isRuleGroup } from './utils';

/**
 * @typedef {Object} RuleType
 * @property {string} id
 * @property {string} field
 * @property {string} operator
 * @property {any} value
 */
/**
 * @typedef {Object} RuleGroupType
 * @property {string} id
 * @property {string} combinator
 * @property {(RuleType|RuleGroupType)[]} rules
 * @property {boolean} not
 */
/**
 * @typedef {Object} ControlElements
 * @property {React.Component} addGroupAction
 * @property {React.Component} removeGroupAction
 * @property {React.Component} addRuleAction
 * @property {React.Component} removeRuleAction
 * @property {React.Component} combinatorSelector
 * @property {React.Component} fieldSelector
 * @property {React.Component} operatorSelector
 * @property {React.Component} valueEditor
 * @property {React.Component} notToggle
 */
/**
 * @typedef {Object} QueryBuilderProps
 * @property {RuleGroupType} query
 * @property {string[]} fields
 * @property {{name: string; label: string;}[]} operators
 * @property {{name: string; label: string;}[]} combinators
 * @property {ControlElements} controlElements
 * @property {(field: string) => {name: string; label: string;}[]} getOperators
 * @property {(query: RuleGroupType) => void} onQueryChange
 * @property {{}} controlClassnames
 * @property {{}} translations
 * @property {boolean} showCombinatorsBetweenRules
 */

const defaultTranslations = {
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

const defaultOperators = [
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

const defaultCombinators = [
  { name: 'and', label: 'AND' },
  { name: 'or', label: 'OR' }
];

const defaultControlClassnames = {
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

const defaultControlElements = {
  addGroupAction: ActionElement,
  removeGroupAction: ActionElement,
  addRuleAction: ActionElement,
  removeRuleAction: ActionElement,
  combinatorSelector: ValueSelector,
  fieldSelector: ValueSelector,
  operatorSelector: ValueSelector,
  valueEditor: ValueEditor,
  notToggle: NotToggle
};

/**
 * @param {QueryBuilderProps} props
 */
const QueryBuilder = (props) => {
  /**
   * Gets the initial query
   * @returns {RuleGroupType}
   */
  const getInitialQuery = () => {
    const { query } = props;
    return (query && generateValidQuery(query)) || createRuleGroup();
  };

  /**
   * @returns {RuleType}
   */
  const createRule = () => {
    const { fields } = props;
    const field = fields[0].name;

    return {
      id: `r-${nanoid()}`,
      field,
      value: '',
      operator: getOperators(field)[0].name
    };
  };

  /**
   * @returns {RuleGroupType}
   */
  const createRuleGroup = () => {
    return {
      id: `g-${nanoid()}`,
      rules: [],
      combinator: props.combinators[0].name,
      not: false
    };
  };

  /**
   * Gets the ValueEditor type for a given field and operator
   * @param {string} field
   * @param {string} operator
   * @returns {string}
   */
  const getValueEditorType = (field, operator) => {
    if (props.getValueEditorType) {
      const vet = props.getValueEditorType(field, operator);
      if (vet) return vet;
    }

    return 'text';
  };

  /**
   * Gets the `<input />` type for a given field and operator
   * @param {string} field
   * @param {string} operator
   * @returns {string}
   */
  const getInputType = (field, operator) => {
    if (props.getInputType) {
      const inputType = props.getInputType(field, operator);
      if (inputType) return inputType;
    }

    return 'text';
  };

  /**
   * Gets the list of valid values for a given field and operator
   * @param {string} field
   * @param {string} operator
   * @returns {{name: string; label: string;}[]}
   */
  const getValues = (field, operator) => {
    if (props.getValues) {
      const vals = props.getValues(field, operator);
      if (vals) return vals;
    }

    return [];
  };

  /**
   * Gets the operators for a given field
   * @param {string} field
   * @returns {{name: string; label: string;}[]}
   */
  const getOperators = (field) => {
    if (props.getOperators) {
      const ops = props.getOperators(field);
      if (ops) return ops;
    }

    return props.operators;
  };

  /**
   * Adds a rule to the query
   * @param {RuleType} rule Rule to add
   * @param {string} parentId ID of the parent rule group
   */
  const onRuleAdd = (rule, parentId) => {
    const rootCopy = { ...root };
    const parent = findRule(parentId, rootCopy);
    parent.rules.push(rule);
    setRoot(rootCopy);
    _notifyQueryChange(rootCopy);
  };

  /**
   * Adds a rule group to the query
   * @param {RuleGroupType} group Rule group to add
   * @param {string} parentId ID of the parent rule group
   */
  const onGroupAdd = (group, parentId) => {
    const rootCopy = { ...root };
    const parent = findRule(parentId, rootCopy);
    parent.rules.push(group);
    setRoot(rootCopy);
    _notifyQueryChange(rootCopy);
  };

  /**
   * @param {string} prop Property that changed
   * @param {any} value Value of the property
   * @param {string} ruleId ID of the rule
   */
  const onPropChange = (prop, value, ruleId) => {
    const rootCopy = { ...root };
    const rule = findRule(ruleId, rootCopy);
    Object.assign(rule, { [prop]: value });

    // Reset operator and value for field change
    if (prop === 'field') {
      Object.assign(rule, { operator: getOperators(rule.field)[0].name, value: '' });
    }

    setRoot(rootCopy);
    _notifyQueryChange(rootCopy);
  };

  /**
   * Removes a rule from the query
   * @param {string} ruleId ID of rule to remove
   * @param {string} parentId ID of the parent rule group
   */
  const onRuleRemove = (ruleId, parentId) => {
    const rootCopy = { ...root };
    const parent = findRule(parentId, rootCopy);
    const index = parent.rules.findIndex((x) => x.id === ruleId);

    parent.rules.splice(index, 1);

    setRoot(rootCopy);
    _notifyQueryChange(rootCopy);
  };

  /**
   * Removes a rule group from the query
   * @param {string} groupId ID of rule group to remove
   * @param {string} parentId ID of the parent rule group
   */
  const onGroupRemove = (groupId, parentId) => {
    const rootCopy = { ...root };
    const parent = findRule(parentId, rootCopy);
    const index = parent.rules.findIndex((x) => x.id === groupId);

    parent.rules.splice(index, 1);

    setRoot(rootCopy);
    _notifyQueryChange(rootCopy);
  };

  /**
   * Gets the level of the rule with the provided ID
   * @param {string} id Rule ID
   */
  const getLevelFromRoot = (id) => {
    return getLevel(id, 0, root);
  };

  /**
   * Executes the `onQueryChange` function, if provided
   */
  const _notifyQueryChange = (newRoot) => {
    const { onQueryChange } = props;
    if (onQueryChange) {
      const query = cloneDeep(newRoot);
      onQueryChange(query);
    }
  };

  const [root, setRoot] = useState(getInitialQuery());

  const schema = {
    fields: props.fields,
    combinators: props.combinators,
    classNames: { ...defaultControlClassnames, ...props.controlClassnames },
    createRule,
    createRuleGroup,
    onRuleAdd,
    onGroupAdd,
    onRuleRemove,
    onGroupRemove,
    onPropChange,
    getLevel: getLevelFromRoot,
    isRuleGroup,
    controls: { ...defaultControlElements, ...props.controlElements },
    getOperators,
    getValueEditorType,
    getInputType,
    getValues,
    showCombinatorsBetweenRules: props.showCombinatorsBetweenRules,
    showNotToggle: props.showNotToggle
  };

  // Set the query state when a new query prop comes in
  useEffect(() => {
    setRoot(generateValidQuery(props.query || getInitialQuery()));
  }, [props.query]);

  // Notify a query change on mount
  useEffect(() => {
    _notifyQueryChange(root);
  }, []);

  return (
    <div className={`queryBuilder ${schema.classNames.queryBuilder}`}>
      <RuleGroup
        translations={{ ...defaultTranslations, ...props.translations }}
        rules={root.rules}
        combinator={root.combinator}
        schema={schema}
        id={root.id}
        parentId={null}
        not={root.not}
      />
    </div>
  );
};

QueryBuilder.defaultProps = {
  query: null,
  fields: [],
  operators: defaultOperators,
  combinators: defaultCombinators,
  translations: defaultTranslations,
  controlElements: null,
  getOperators: null,
  getValueEditorType: null,
  getInputType: null,
  getValues: null,
  onQueryChange: null,
  controlClassnames: null,
  showCombinatorsBetweenRules: false,
  showNotToggle: false
};

QueryBuilder.propTypes = {
  query: PropTypes.object,
  fields: PropTypes.array.isRequired,
  operators: PropTypes.arrayOf(
    PropTypes.shape({ name: PropTypes.string, label: PropTypes.string })
  ),
  combinators: PropTypes.arrayOf(
    PropTypes.shape({ name: PropTypes.string, label: PropTypes.string })
  ),
  controlElements: PropTypes.shape({
    addGroupAction: PropTypes.func,
    removeGroupAction: PropTypes.func,
    addRuleAction: PropTypes.func,
    removeRuleAction: PropTypes.func,
    combinatorSelector: PropTypes.func,
    fieldSelector: PropTypes.func,
    operatorSelector: PropTypes.func,
    valueEditor: PropTypes.func,
    notToggle: PropTypes.func
  }),
  getOperators: PropTypes.func,
  getValueEditorType: PropTypes.func,
  getInputType: PropTypes.func,
  getValues: PropTypes.func,
  onQueryChange: PropTypes.func,
  controlClassnames: PropTypes.object,
  translations: PropTypes.object,
  showCombinatorsBetweenRules: PropTypes.bool,
  showNotToggle: PropTypes.bool
};

QueryBuilder.displayName = 'QueryBuilder';

export default QueryBuilder;
