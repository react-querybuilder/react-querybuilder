import { ActionElement, ValueEditor, ValueSelector } from './controls/index'

import PropTypes from 'prop-types'
import React from 'react'
import RuleGroup from './RuleGroup'
import cloneDeep from 'lodash/cloneDeep'
import uniqueId from 'uuid/v4'

export default class QueryBuilder extends React.Component {
  static get defaultProps() {
    return {
      query: null,
      dataTypes: QueryBuilder.defaultDataTypes,
      fields: [],
      operators: QueryBuilder.defaultOperators,
      combinators: QueryBuilder.defaultCombinators,
      translations: QueryBuilder.defaultTranslations,
      controlElements: null,
      getOperators: null,
      onQueryChange: null,
      controlClassnames: null,
    }
  }

  static get propTypes() {
    return {
      query: PropTypes.object,
      dataTypes: PropTypes.array,
      fields: PropTypes.array.isRequired,
      operators: PropTypes.array,
      combinators: PropTypes.array,
      controlElements: PropTypes.shape({
        addGroupAction: PropTypes.func,
        removeGroupAction: PropTypes.func,
        addRuleAction: PropTypes.func,
        removeRuleAction: PropTypes.func,
        combinatorSelector: PropTypes.func,
        dataTypeSelector: PropTypes.func,
        fieldSelector: PropTypes.func,
        operatorSelector: PropTypes.func,
        valueEditor: PropTypes.func,
      }),
      getOperators: PropTypes.func,
      onQueryChange: PropTypes.func,
      controlClassnames: PropTypes.object,
      translations: PropTypes.object,
    }
  }

  constructor(...args) {
    super(...args)
    this.state = {
      root: {},
      schema: {},
    }
  }

  static get defaultTranslations() {
    return {
      dataTypes: {
        title: 'Data Types',
      },
      fields: {
        title: 'Fields',
      },
      operators: {
        title: 'Operators',
      },
      value: {
        title: 'Value',
      },
      removeRule: {
        label: 'x',
        title: 'Remove rule',
      },
      removeGroup: {
        label: 'x',
        title: 'Remove group',
      },
      addRule: {
        label: '+Rule',
        title: 'Add rule',
      },
      addGroup: {
        label: '+Group',
        title: 'Add group',
      },
      combinators: {
        title: 'Combinators',
      },
    }
  }

  static get defaultDataTypes() {
    return [
      { name: 'string_type', label: 'String' },
      { name: 'integer_type', label: 'Integer' },
      { name: 'date_type', label: 'Date' },
      { name: 'float_type', label: 'Float' },
      { name: 'json_type', label: 'JSON' },
    ]
  }

  static get defaultOperators() {
    return [
      { name: 'null', label: 'Is Null' },
      { name: 'notNull', label: 'Is Not Null' },
      { name: 'in', label: 'In' },
      { name: 'notIn', label: 'Not In' },
      { name: '=', label: '=' },
      { name: '!=', label: '!=' },
      { name: '<', label: '<' },
      { name: '>', label: '>' },
      { name: '<=', label: '<=' },
      { name: '>=', label: '>=' },
    ]
  }

  static get defaultCombinators() {
    return [{ name: 'and', label: 'AND' }, { name: 'or', label: 'OR' }]
  }

  static get defaultControlClassnames() {
    return {
      queryBuilder: '',

      ruleGroup: '',
      combinators: '',
      addRule: '',
      addGroup: '',
      removeGroup: '',

      rule: '',
      dataTypes: '',
      fields: '',
      operators: '',
      value: '',
      removeRule: '',
    }
  }

  static get defaultControlElements() {
    return {
      addGroupAction: ActionElement,
      removeGroupAction: ActionElement,
      addRuleAction: ActionElement,
      removeRuleAction: ActionElement,
      combinatorSelector: ValueSelector,
      dataTypeSelector: ValueSelector,
      fieldSelector: ValueSelector,
      operatorSelector: ValueSelector,
      valueEditor: ValueEditor,
    }
  }

  componentWillMount() {
    const {
      dataTypes,
      fields,
      operators,
      combinators,
      controlElements,
      controlClassnames,
    } = this.props
    const classNames = Object.assign(
      {},
      QueryBuilder.defaultControlClassnames,
      controlClassnames
    )
    const controls = Object.assign(
      {},
      QueryBuilder.defaultControlElements,
      controlElements
    )
    this.setState({
      root: this.getInitialQuery(),
      schema: {
        dataTypes,
        fields,
        operators,
        combinators,

        classNames,

        createRule: this.createRule.bind(this),
        createRuleGroup: this.createRuleGroup.bind(this),
        onRuleAdd: this._notifyQueryChange.bind(this, this.onRuleAdd),
        onGroupAdd: this._notifyQueryChange.bind(this, this.onGroupAdd),
        onRuleRemove: this._notifyQueryChange.bind(this, this.onRuleRemove),
        onGroupRemove: this._notifyQueryChange.bind(this, this.onGroupRemove),
        onPropChange: this._notifyQueryChange.bind(this, this.onPropChange),
        getLevel: this.getLevel.bind(this),
        isRuleGroup: this.isRuleGroup.bind(this),
        controls,
        getOperators: (...args) => this.getOperators(...args),
      },
    })
  }

  getInitialQuery() {
    return this.props.query || this.createRuleGroup()
  }

  componentDidMount() {
    this._notifyQueryChange(null)
  }

  render() {
    const {
      root: { id, rules, combinator },
      schema,
    } = this.state
    const { translations } = this.props

    return (
      <div className={`queryBuilder ${schema.classNames.queryBuilder}`}>
        <RuleGroup
          translations={translations}
          rules={rules}
          combinator={combinator}
          schema={schema}
          id={id}
          parentId={null}
        />
      </div>
    )
  }

  isRuleGroup(rule) {
    return !!(rule.combinator && rule.rules)
  }

  createRule() {
    const { dataTypes, fields, operators } = this.state.schema

    return {
      id: `r-${uniqueId()}`,
      dataType: dataTypes[0].name,
      field: fields[0].name,
      value: '',
      operator: operators[0].name,
    }
  }

  createRuleGroup() {
    return {
      id: `g-${uniqueId()}`,
      rules: [],
      combinator: this.props.combinators[0].name,
    }
  }

  getOperators(dataType) {
    if (this.props.getOperators) {
      const ops = this.props.getOperators(dataType)
      if (ops) {
        return ops
      }
    }

    return this.props.operators
  }

  onRuleAdd(rule, parentId) {
    const parent = this._findRule(parentId, this.state.root)
    parent.rules.push(rule)

    this.setState({ root: this.state.root })
  }

  onGroupAdd(group, parentId) {
    const parent = this._findRule(parentId, this.state.root)
    parent.rules.push(group)

    this.setState({ root: this.state.root })
  }

  onPropChange(prop, value, ruleId) {
    const rule = this._findRule(ruleId, this.state.root)
    Object.assign(rule, { [prop]: value })

    this.setState({ root: this.state.root })
  }

  onRuleRemove(ruleId, parentId) {
    const parent = this._findRule(parentId, this.state.root)
    const index = parent.rules.findIndex(x => x.id === ruleId)

    parent.rules.splice(index, 1)
    this.setState({ root: this.state.root })
  }

  onGroupRemove(groupId, parentId) {
    const parent = this._findRule(parentId, this.state.root)
    const index = parent.rules.findIndex(x => x.id === groupId)

    parent.rules.splice(index, 1)
    this.setState({ root: this.state.root })
  }

  getLevel(id) {
    return this._getLevel(id, 0, this.state.root)
  }

  _getLevel(id, index, root) {
    const { isRuleGroup } = this.state.schema

    var foundAtIndex = -1
    if (root.id === id) {
      foundAtIndex = index
    } else if (isRuleGroup(root)) {
      root.rules.forEach(rule => {
        if (foundAtIndex === -1) {
          var indexForRule = index
          if (isRuleGroup(rule)) indexForRule++
          foundAtIndex = this._getLevel(id, indexForRule, rule)
        }
      })
    }
    return foundAtIndex
  }

  _findRule(id, parent) {
    const { isRuleGroup } = this.state.schema

    if (parent.id === id) {
      return parent
    }

    for (const rule of parent.rules) {
      if (rule.id === id) {
        return rule
      } else if (isRuleGroup(rule)) {
        const subRule = this._findRule(id, rule)
        if (subRule) {
          return subRule
        }
      }
    }
  }

  _notifyQueryChange(fn, ...args) {
    if (fn) {
      fn.call(this, ...args)
    }

    const { onQueryChange } = this.props
    if (onQueryChange) {
      const query = cloneDeep(this.state.root)
      onQueryChange(query)
    }
  }
}
