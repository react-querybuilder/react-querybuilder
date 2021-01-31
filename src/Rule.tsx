import arrayFind from 'array-find';
import * as React from 'react';
import { RuleProps } from './types';

export const Rule = ({
  id,
  parentId,
  field,
  operator,
  value,
  translations,
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
  },
  context
}: RuleProps) => {
  const onElementChanged = (property: string, value: any) => {
    onPropChange(property, value, id);
  };

  const onFieldChanged = (value: any) => {
    onElementChanged('field', value);
  };

  const onOperatorChanged = (value: any) => {
    onElementChanged('operator', value);
  };

  const onValueChanged = (value: any) => {
    onElementChanged('value', value);
  };

  const removeRule = (event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();

    onRuleRemove(id, parentId);
  };

  const fieldData = arrayFind(fields, (f) => f.name === field);
  const inputType = fieldData?.inputType ?? getInputType(field, operator);
  const operators = fieldData?.operators ?? getOperators(field);
  const valueEditorType = fieldData?.valueEditorType ?? getValueEditorType(field, operator);
  const values = fieldData?.values ?? getValues(field, operator);
  const level = getLevel(id);

  return (
    <div className={`rule ${classNames.rule}`} data-rule-id={id} data-level={level}>
      <controls.fieldSelector
        options={fields}
        title={translations.fields.title}
        value={field}
        operator={operator}
        className={`rule-fields ${classNames.fields}`}
        handleOnChange={onFieldChanged}
        level={level}
        context={context}
      />
      <controls.operatorSelector
        field={field}
        fieldData={fieldData}
        title={translations.operators.title}
        options={operators}
        value={operator}
        className={`rule-operators ${classNames.operators}`}
        handleOnChange={onOperatorChanged}
        level={level}
        context={context}
      />
      <controls.valueEditor
        field={field}
        fieldData={fieldData}
        title={translations.value.title}
        operator={operator}
        value={value}
        type={valueEditorType}
        inputType={inputType}
        values={values}
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
        context={context}
      />
    </div>
  );
};

Rule.displayName = 'Rule';
