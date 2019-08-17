import cloneDeep from 'lodash/cloneDeep';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import uniqueId from 'uuid/v4';
import { ActionElement, ValueEditor, ValueSelector } from './controls';
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
  }
};

const defaultOperators = [
  { name: 'null', label: 'Is Null' },
  { name: 'notNull', label: 'Is Not Null' },
  { name: 'in', label: 'In' },
  { name: 'notIn', label: 'Not In' },
  { name: '=', label: '=' },
  { name: '!=', label: '!=' },
  { name: '<', label: '<' },
  { name: '>', label: '>' },
  { name: '<=', label: '<=' },
  { name: '>=', label: '>=' }
];

const defaultCombinators = [{ name: 'and', label: 'AND' }, { name: 'or', label: 'OR' }];

const defaultControlClassnames = {
  queryBuilder: '',

  ruleGroup: '',
  combinators: '',
  addRule: '',
  addGroup: '',
  removeGroup: '',

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
  valueEditor: ValueEditor
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
      id: `r-${uniqueId()}`,
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
      id: `g-${uniqueId()}`,
      rules: [],
      combinator: props.combinators[0].name
    };
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
    _notifyQueryChange();
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
    _notifyQueryChange();
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
    _notifyQueryChange();
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
    _notifyQueryChange();
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
    _notifyQueryChange();
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
  const _notifyQueryChange = () => {
    const { onQueryChange } = props;
    if (onQueryChange) {
      const query = cloneDeep(root);
      onQueryChange(query);
    }
  };

  const [root, setRoot] = useState(getInitialQuery());

  const schema = {
    fields: props.fields,
    operators: { ...defaultOperators, ...props.operators },
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
    getOperators
  };

  // Set the query state when a new query prop comes in
  useEffect(() => {
    setRoot(generateValidQuery(props.query || getInitialQuery()));
  }, [props.query]);

  // Notify a query change on mount
  useEffect(() => {
    _notifyQueryChange();
  }, []);

  return (
    <div className={`queryBuilder ${schema.classNames.queryBuilder}`}>
      <RuleGroup
        translations={props.translations}
        rules={root.rules}
        combinator={root.combinator}
        schema={schema}
        id={root.id}
        parentId={null}
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
  onQueryChange: null,
  controlClassnames: null
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
    valueEditor: PropTypes.func
  }),
  getOperators: PropTypes.func,
  onQueryChange: PropTypes.func,
  controlClassnames: PropTypes.object,
  translations: PropTypes.object
};

export default QueryBuilder;
