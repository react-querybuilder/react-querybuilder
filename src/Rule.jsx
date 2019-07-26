import React from 'react';

const Rule = (props) => {
  const onElementChanged = (property, value) => {
    const {
      id,
      schema: { onPropChange }
    } = props;

    onPropChange(property, value, id);
  };

  const onFieldChanged = (value) => {
    onElementChanged('field', value);
  };

  const onOperatorChanged = (value) => {
    onElementChanged('operator', value);
  };

  const onValueChanged = (value) => {
    onElementChanged('value', value);
  };

  const removeRule = (event) => {
    event.preventDefault();
    event.stopPropagation();

    props.schema.onRuleRemove(props.id, props.parentId);
  };

  const {
    field,
    operator,
    value,
    translations,
    schema: { fields, controls, getOperators, getLevel, classNames }
  } = props;

  const level = getLevel(props.id);

  return (
    <div className={`rule ${classNames.rule}`}>
      {React.createElement(controls.fieldSelector, {
        options: fields,
        title: translations.fields.title,
        value: field,
        className: `rule-fields ${classNames.fields}`,
        handleOnChange: onFieldChanged,
        level: level
      })}
      {React.createElement(controls.operatorSelector, {
        field: field,
        title: translations.operators.title,
        options: getOperators(field),
        value: operator,
        className: `rule-operators ${classNames.operators}`,
        handleOnChange: onOperatorChanged,
        level: level
      })}
      {React.createElement(controls.valueEditor, {
        field: field,
        title: translations.value.title,
        operator: operator,
        value: value,
        className: `rule-value ${classNames.value}`,
        handleOnChange: onValueChanged,
        level: level
      })}
      {React.createElement(controls.removeRuleAction, {
        label: translations.removeRule.label,
        title: translations.removeRule.title,
        className: `rule-remove ${classNames.removeRule}`,
        handleOnClick: removeRule,
        level: level
      })}
    </div>
  );
};

Rule.defaultProps = {
  id: null,
  parentId: null,
  field: null,
  operator: null,
  value: null,
  schema: null
};

export default Rule;
