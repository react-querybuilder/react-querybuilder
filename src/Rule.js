import React from 'react'

export default class Rule extends React.Component {
  static get defaultProps() {
    return {
      id: null,
      parentId: null,
      dataType: null,
      field: null,
      operator: null,
      value: null,
      schema: null,
    }
  }

  render() {
    const {
      dataType,
      field,
      operator,
      value,
      translations,
      schema: {
        dataTypes,
        fields,
        controls,
        getOperators,
        getLevel,
        classNames,
      },
    } = this.props
    var level = getLevel(this.props.id)
    return (
      <div className={`rule ${classNames.rule}`}>
        {React.createElement(controls.dataTypeSelector, {
          title: translations.dataTypes.title,
          options: dataTypes,
          value: dataType,
          className: `rule-datatypes ${classNames.dataTypes}`,
          handleOnChange: this.onDataTypeChange,
          level: level,
        })}
        {React.createElement(controls.fieldSelector, {
          options: fields,
          title: translations.fields.title,
          value: field,
          className: `rule-fields ${classNames.fields}`,
          handleOnChange: this.onFieldChanged,
          level: level,
        })}
        {React.createElement(controls.operatorSelector, {
          field: field,
          title: translations.operators.title,
          options: getOperators(field),
          value: operator,
          className: `rule-operators ${classNames.operators}`,
          handleOnChange: this.onOperatorChanged,
          level: level,
        })}
        {React.createElement(controls.valueEditor, {
          field: field,
          title: translations.value.title,
          operator: operator,
          value: value,
          className: `rule-value ${classNames.value}`,
          handleOnChange: this.onValueChanged,
          level: level,
        })}
        {React.createElement(controls.removeRuleAction, {
          label: translations.removeRule.label,
          title: translations.removeRule.title,
          className: `rule-remove ${classNames.removeRule}`,
          handleOnClick: this.removeRule,
          level: level,
        })}
      </div>
    )
  }

  onDataTypeChange = value => {
    this.onElementChanged('dataType', value)
  }

  onFieldChanged = value => {
    this.onElementChanged('field', value)
  }

  onOperatorChanged = value => {
    this.onElementChanged('operator', value)
  }

  onValueChanged = value => {
    this.onElementChanged('value', value)
  }

  onElementChanged = (property, value) => {
    const {
      id,
      schema: { onPropChange },
    } = this.props

    onPropChange(property, value, id)
  }

  removeRule = event => {
    event.preventDefault()
    event.stopPropagation()

    this.props.schema.onRuleRemove(this.props.id, this.props.parentId)
  }
}
