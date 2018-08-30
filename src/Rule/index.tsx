import * as React from 'react';
import { NameAndLabel, Schema, Translations } from '../types';

// --- Component Props
interface RuleProps {
  id: string | null;
  field: NameAndLabel;
  value: string;
  operator: NameAndLabel;
  schema: Schema;
  parentId: string | null;
  translations?: Translations;
  onRuleRemove: (ruleId: string, parentId: string) => void;
}

class RuleComponent extends React.Component<RuleProps, {}> {
  static get defaultProps() {
    return {
      id: null,
      parentId: null,
      field: null,
      operator: null,
      value: null,
      schema: null,
    };
  }

  render() {
    const {
      field,
      operator,
      value,
      translations,
      schema: { fields, controls, getOperators, getLevel, classNames },
    } = this.props;

    const level = getLevel(this.props.id);
    // --- Handle conditional Translations Prop
    const fieldTitle =
      translations == null || translations.fields == null
        ? 'Fields'
        : translations.fields.title;

    const operatorsTitle =
      translations == null || translations.operators == null
        ? 'Operators'
        : translations.operators.title;

    const valueTitle =
      translations == null || translations.value == null
        ? 'Value'
        : translations.value.title;

    const removeRuleLabel =
      translations == null || translations.removeRule == null
        ? 'Remove Rule'
        : translations.removeRule.label;

    const removeRuleTitle =
      translations == null || translations.removeRule == null
        ? 'Remove Rule'
        : translations.removeRule.title;

    return (
      <div className={`rule ${classNames.rule}`}>
        {React.createElement(controls.fieldSelector, {
          level,
          options: fields,
          title: fieldTitle,
          value: field,
          className: `rule-fields ${classNames.fields}`,
          handleOnChange: this.onFieldChanged,
        })}
        {React.createElement(controls.operatorSelector, {
          field: field,
          title: operatorsTitle,
          options: getOperators(field),
          value: operator,
          className: `rule-operators ${classNames.operators}`,
          handleOnChange: this.onOperatorChanged,
          level: level,
        })}
        {React.createElement(controls.valueEditor, {
          field: field,
          title: valueTitle,
          operator: operator,
          value: value,
          className: `rule-value ${classNames.value}`,
          handleOnChange: this.onValueChanged,
          level: level,
        })}
        {React.createElement(controls.removeRuleAction, {
          label: removeRuleLabel,
          title: removeRuleTitle,
          className: `rule-remove ${classNames.removeRule}`,
          handleOnClick: this.removeRule,
          level: level,
        })}
      </div>
    );
  }

  onFieldChanged = (value) => {
    this.onElementChanged('field', value);
  };

  onOperatorChanged = (value) => {
    this.onElementChanged('operator', value);
  };

  onValueChanged = (value) => {
    this.onElementChanged('value', value);
  };

  onElementChanged = (property, value) => {
    const {
      id,
      schema: { onPropChange },
    } = this.props;

    onPropChange(property, value, id);
  };

  removeRule = (event) => {
    event.preventDefault();
    event.stopPropagation();

    this.props.schema.onRuleRemove(this.props.id, this.props.parentId);
  };
}

export default RuleComponent;
