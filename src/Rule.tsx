import * as React from 'react';
import { NameAndLabel, Schema, Translations } from './types';

// --- Component Props
interface RuleProps {
  id: string | null;
  field: NameAndLabel;
  value: string;
  operator: NameAndLabel;
  schema: Schema;
  parentId: string | null;
  translations: Translations;
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
    var level = getLevel(this.props.id);
    return (
      <div className={`rule ${classNames.rule}`}>
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
