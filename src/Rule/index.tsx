import * as React from 'react';
import { NameAndLabel, Schema, Translations } from '../types';

// --- Component Props
interface RuleProps {
  id: string | null;
  field?: string | NameAndLabel;
  value?: string;
  operator?: NameAndLabel;
  schema: Schema;
  parentId: string | null;
  translations?: Translations;
}

class RuleComponent extends React.Component<RuleProps, {}> {
  static get defaultProps(): RuleProps {
    return {
      id: null,
      parentId: null,
      field: undefined,
      operator: undefined,
      value: undefined,
      schema: {} as Schema,
    };
  }

  render(): JSX.Element {
    const {
      field,
      operator,
      value,
      translations,
      schema: { fields, controls, getOperators, getLevel, classNames },
    } = this.props;

    const level = getLevel(this.props.id);
    // --- Handle conditional Translations Prop
    const validField = typeof field === 'string' ? field : 'Field';

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
          field,
          level,
          title: operatorsTitle,
          options: getOperators(validField),
          value: operator,
          className: `rule-operators ${classNames.operators}`,
          handleOnChange: this.onOperatorChanged,
        })}
        {React.createElement(controls.valueEditor, {
          field,
          level,
          operator,
          value,
          title: valueTitle,
          className: `rule-value ${classNames.value}`,
          handleOnChange: this.onValueChanged,
        })}
        {React.createElement(controls.removeRuleAction, {
          level,
          label: removeRuleLabel,
          title: removeRuleTitle,
          className: `rule-remove ${classNames.removeRule}`,
          handleOnClick: this.removeRule,
        })}
      </div>
    );
  }

  onFieldChanged = (value: string): void => {
    this.onElementChanged('field', value);
  }

  onOperatorChanged = (value: string): void => {
    this.onElementChanged('operator', value);
  }

  onValueChanged = (value: any): void => {
    this.onElementChanged('value', value);
  }

  onElementChanged = (property: string, value: any): void => {
    const {
      id,
      schema: { onPropChange },
    } = this.props;

    onPropChange(property, value, id);
  }

  removeRule = (event) => {
    event.preventDefault();
    event.stopPropagation();

    this.props.schema.onRuleRemove(this.props.id, this.props.parentId);
  }
}

export default RuleComponent;
