import cloneDeep from 'lodash/cloneDeep';
import * as React from 'react';
import { RuleType } from '.';
import { standardClassnames } from './defaults';
import { Field, RuleProps } from './types';
import { c, generateID } from './utils';

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
    fieldMap,
    getInputType,
    getLevel,
    getOperators,
    getValueEditorType,
    getValues,
    onPropChange,
    onRuleAdd,
    onRuleRemove,
    autoSelectField,
    showCloneButtons
  },
  context
}: RuleProps) => {
  const generateOnChangeHandler = (prop: Exclude<keyof RuleType, 'id'>) => (value: any) => {
    onPropChange(prop, value, id);
  };

  const cloneRule = (event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();

    const newRule: RuleType = cloneDeep({
      id: `r-${generateID()}`,
      field,
      operator,
      value
    });
    onRuleAdd(newRule, parentId);
  };

  const removeRule = (event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();

    onRuleRemove(id, parentId);
  };

  const fieldData = fieldMap?.[field] ?? ({} as Field);
  const inputType = fieldData.inputType ?? getInputType(field, operator);
  const operators = fieldData.operators ?? getOperators(field);
  const valueEditorType = fieldData.valueEditorType ?? getValueEditorType(field, operator);
  const values = fieldData.values ?? getValues(field, operator);
  const level = getLevel(id);

  return (
    <div
      className={c(standardClassnames.rule, classNames.rule)}
      data-rule-id={id}
      data-level={level}>
      <controls.fieldSelector
        options={fields}
        title={translations.fields.title}
        value={field}
        operator={operator}
        className={c(standardClassnames.fields, classNames.fields)}
        handleOnChange={generateOnChangeHandler('field')}
        level={level}
        context={context}
      />
      {(autoSelectField || fieldData.name !== '~') && (
        <>
          <controls.operatorSelector
            field={field}
            fieldData={fieldData}
            title={translations.operators.title}
            options={operators}
            value={operator}
            className={c(standardClassnames.operators, classNames.operators)}
            handleOnChange={generateOnChangeHandler('operator')}
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
            className={c(standardClassnames.value, classNames.value)}
            handleOnChange={generateOnChangeHandler('value')}
            level={level}
            context={context}
          />
        </>
      )}
      {showCloneButtons && (
        <controls.cloneRuleAction
          label={translations.cloneRule.label}
          title={translations.cloneRule.title}
          className={c(standardClassnames.cloneRule, classNames.cloneRule)}
          handleOnClick={cloneRule}
          level={level}
          context={context}
        />
      )}
      <controls.removeRuleAction
        label={translations.removeRule.label}
        title={translations.removeRule.title}
        className={c(standardClassnames.removeRule, classNames.removeRule)}
        handleOnClick={removeRule}
        level={level}
        context={context}
      />
    </div>
  );
};

Rule.displayName = 'Rule';
