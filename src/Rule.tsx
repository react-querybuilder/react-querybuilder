import cloneDeep from 'lodash/cloneDeep';
import * as React from 'react';
import { RuleType } from '.';
import { standardClassnames } from './defaults';
import { Field, RuleProps } from './types';
import { c, generateID, getParentPath, getValidationClassNames } from './utils';

export const Rule = ({
  id,
  path,
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
    getOperators,
    getValueEditorType,
    getValues,
    onPropChange,
    onRuleAdd,
    onRuleRemove,
    autoSelectField,
    showCloneButtons,
    validationMap
  },
  context
}: RuleProps) => {
  const generateOnChangeHandler =
    (prop: Exclude<keyof RuleType, 'id' | 'path'>) => (value: any) => {
      onPropChange(prop, value, path);
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
    const parentPath = getParentPath(path);
    onRuleAdd(newRule, parentPath);
  };

  const removeRule = (event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();

    onRuleRemove(path);
  };

  const fieldData = fieldMap?.[field] ?? ({} as Field);
  const inputType = fieldData.inputType ?? getInputType(field, operator);
  const operators = fieldData.operators ?? getOperators(field);
  const valueEditorType = fieldData.valueEditorType ?? getValueEditorType(field, operator);
  const values = fieldData.values ?? getValues(field, operator);
  const level = path.length;

  const validationResult =
    validationMap[id ?? /* istanbul ignore next */ ''] ??
    (typeof fieldData.validator === 'function'
      ? fieldData.validator({ id, field, operator, value })
      : null);
  const validationClassName = getValidationClassNames(validationResult);
  const outerClassName = c(standardClassnames.rule, classNames.rule, validationClassName);

  return (
    <div
      className={outerClassName}
      data-rule-id={id}
      data-level={level}
      data-path={JSON.stringify(path)}>
      <controls.fieldSelector
        options={fields}
        title={translations.fields.title}
        value={field}
        operator={operator}
        className={c(standardClassnames.fields, classNames.fields)}
        handleOnChange={generateOnChangeHandler('field')}
        level={level}
        context={context}
        validation={validationResult}
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
            validation={validationResult}
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
            validation={validationResult}
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
          validation={validationResult}
        />
      )}
      <controls.removeRuleAction
        label={translations.removeRule.label}
        title={translations.removeRule.title}
        className={c(standardClassnames.removeRule, classNames.removeRule)}
        handleOnClick={removeRule}
        level={level}
        context={context}
        validation={validationResult}
      />
    </div>
  );
};

Rule.displayName = 'Rule';
