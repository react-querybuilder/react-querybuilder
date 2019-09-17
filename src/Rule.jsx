import React from 'react';

const Rule = ({
  id,
  parentId,
  field,
  operator,
  value,
  translations,
  context,
  schema: {
    classNames,
    controls,
    fields,
    getInputType,
    getLevel,
    getOperators,
    getValueEditorType,
    getValues,
    onPropChange,
    onRuleRemove
  }
}) => {
  const onElementChanged = (property, value) => {
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

    onRuleRemove(id, parentId);
  };

  const level = getLevel(id);

  return (
    <div className={`rule ${classNames.rule}`} data-rule-id={id} data-level={level}>
      <controls.fieldSelector
        options={fields}
        title={translations.fields.title}
        value={field}
        className={`rule-fields ${classNames.fields}`}
        handleOnChange={onFieldChanged}
        level={level}
      />
      <controls.operatorSelector
        field={field}
        title={translations.operators.title}
        options={getOperators(field)}
        value={operator}
        className={`rule-operators ${classNames.operators}`}
        handleOnChange={onOperatorChanged}
        level={level}
        context={context}
      />
      <controls.valueEditor
        field={field}
        title={translations.value.title}
        operator={operator}
        value={value}
        type={getValueEditorType(field, operator)}
        inputType={getInputType(field, operator)}
        values={getValues(field, operator)}
        className={`rule-value ${classNames.value}`}
        handleOnChange={onValueChanged}
        level={level}
        context={context}
      />
      <controls.removeRuleAction
        label={translations.removeRule.label}
        title={translations.removeRule.title}
        className={`rule-remove ${classNames.removeRule}`}
        handleOnClick={removeRule}
        level={level}
      />
    </div>
  );
};

Rule.defaultProps = {
  id: null,
  parentId: null,
  field: null,
  operator: null,
  value: null,
  schema: null,
  context: null
};

Rule.displayName = 'Rule';

export default Rule;
