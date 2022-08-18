import { type MouseEvent as ReactMouseEvent } from 'react';
import { standardClassnames, TestID } from './defaults';
import { filterFieldsByComparator, getValidationClassNames } from './internal';
import { useDeprecatedProps, useReactDndWarning } from './internal/hooks';
import type { RuleProps, RuleType } from './types';
import { c, getParentPath } from './utils';

export const Rule = ({
  id,
  path,
  rule,
  translations,
  schema,
  actions,
  disabled: disabledProp,
  parentDisabled,
  context,
  field: fieldProp,
  operator: operatorProp,
  value: valueProp,
  valueSource: valueSourceProp,
  dragMonitorId = '',
  dropMonitorId = '',
  dndRef = null,
  dragRef = null,
}: RuleProps) => {
  const {
    classNames,
    controls: {
      dragHandle: DragHandleControlElement,
      fieldSelector: FieldSelectorControlElement,
      operatorSelector: OperatorSelectorControlElement,
      valueSourceSelector: ValueSourceSelectorControlElement,
      valueEditor: ValueEditorControlElement,
      cloneRuleAction: CloneRuleActionControlElement,
      lockRuleAction: LockRuleActionControlElement,
      removeRuleAction: RemoveRuleActionControlElement,
    },
    fields,
    fieldMap,
    getInputType,
    getOperators,
    getValueEditorType,
    getValueSources,
    getValues,
    autoSelectField,
    autoSelectOperator,
    showCloneButtons,
    showLockButtons,
    listsAsArrays,
    validationMap,
    enableDragAndDrop,
  } = schema;
  const { moveRule, onPropChange, onRuleRemove } = actions;
  const disabled = !!parentDisabled || !!disabledProp;

  const { field, operator, value, valueSource } = rule
    ? rule
    : { field: fieldProp, operator: operatorProp, value: valueProp, valueSource: valueSourceProp };

  useDeprecatedProps('rule', !!rule);

  useReactDndWarning(enableDragAndDrop, !!(dragMonitorId || dropMonitorId || dndRef || dragRef));

  const generateOnChangeHandler =
    (prop: Exclude<keyof RuleType, 'id' | 'path'>) => (value: any) => {
      if (!disabled) {
        onPropChange(prop, value, path);
      }
    };

  const cloneRule = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!disabled) {
      const newPath = [...getParentPath(path), path[path.length - 1] + 1];
      moveRule(path, newPath, true);
    }
  };

  const toggleLockRule = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    onPropChange('disabled', !disabled, path);
  };

  const removeRule = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!disabled) {
      onRuleRemove(path);
    }
  };

  const fieldData = fieldMap?.[field] ?? { name: field, label: field };
  const inputType = fieldData.inputType ?? getInputType(field, operator);
  const operators = getOperators(field);
  const valueSources =
    typeof fieldData.valueSources === 'function'
      ? fieldData.valueSources(operator)
      : fieldData.valueSources ?? getValueSources(field, operator);
  const valueEditorType =
    valueSource === 'field'
      ? 'select'
      : (typeof fieldData.valueEditorType === 'function'
          ? fieldData.valueEditorType(operator)
          : fieldData.valueEditorType) ?? getValueEditorType(field, operator);
  const values =
    valueSource === 'field'
      ? filterFieldsByComparator(fieldData, fields, operator)
      : fieldData.values ?? getValues(field, operator);
  const level = path.length;
  const vsOptions = valueSources.map(vs => ({ name: vs, label: vs }));

  const validationResult =
    validationMap[id ?? /* istanbul ignore next */ ''] ??
    (typeof fieldData.validator === 'function'
      ? fieldData.validator({ id, field, operator, value })
      : null);
  const validationClassName = getValidationClassNames(validationResult);
  const outerClassName = c(
    standardClassnames.rule,
    classNames.rule,
    disabled ? standardClassnames.disabled : '',
    validationClassName
  );

  return (
    <div
      ref={dndRef}
      data-testid={TestID.rule}
      data-dragmonitorid={dragMonitorId}
      data-dropmonitorid={dropMonitorId}
      className={outerClassName}
      data-rule-id={id}
      data-level={level}
      data-path={JSON.stringify(path)}>
      <DragHandleControlElement
        testID={TestID.dragHandle}
        ref={dragRef}
        level={level}
        path={path}
        title={translations.dragHandle.title}
        label={translations.dragHandle.label}
        className={c(standardClassnames.dragHandle, classNames.dragHandle)}
        disabled={disabled}
        context={context}
        validation={validationResult}
      />
      <FieldSelectorControlElement
        testID={TestID.fields}
        options={fields}
        title={translations.fields.title}
        value={field}
        operator={operator}
        className={c(standardClassnames.fields, classNames.fields)}
        handleOnChange={generateOnChangeHandler('field')}
        level={level}
        path={path}
        disabled={disabled}
        context={context}
        validation={validationResult}
      />
      {(autoSelectField || field !== translations.fields.placeholderName) && (
        <>
          <OperatorSelectorControlElement
            testID={TestID.operators}
            field={field}
            fieldData={fieldData}
            title={translations.operators.title}
            options={operators}
            value={operator}
            className={c(standardClassnames.operators, classNames.operators)}
            handleOnChange={generateOnChangeHandler('operator')}
            level={level}
            path={path}
            disabled={disabled}
            context={context}
            validation={validationResult}
          />
          {(autoSelectOperator || operator !== translations.operators.placeholderName) && (
            <>
              {!['null', 'notNull'].includes(operator) && valueSources.length > 1 && (
                <ValueSourceSelectorControlElement
                  testID={TestID.valueSourceSelector}
                  field={field}
                  fieldData={fieldData}
                  title={translations.valueSourceSelector.title}
                  options={vsOptions}
                  value={valueSource ?? 'value'}
                  className={c(standardClassnames.valueSource, classNames.valueSource)}
                  handleOnChange={generateOnChangeHandler('valueSource')}
                  level={level}
                  path={path}
                  disabled={disabled}
                  context={context}
                  validation={validationResult}
                />
              )}
              <ValueEditorControlElement
                testID={TestID.valueEditor}
                field={field}
                fieldData={fieldData}
                title={translations.value.title}
                operator={operator}
                value={value}
                valueSource={valueSource ?? 'value'}
                type={valueEditorType}
                inputType={inputType}
                values={values}
                listsAsArrays={listsAsArrays}
                className={c(standardClassnames.value, classNames.value)}
                handleOnChange={generateOnChangeHandler('value')}
                level={level}
                path={path}
                disabled={disabled}
                context={context}
                validation={validationResult}
              />
            </>
          )}
        </>
      )}
      {showCloneButtons && (
        <CloneRuleActionControlElement
          testID={TestID.cloneRule}
          label={translations.cloneRule.label}
          title={translations.cloneRule.title}
          className={c(standardClassnames.cloneRule, classNames.cloneRule)}
          handleOnClick={cloneRule}
          level={level}
          path={path}
          disabled={disabled}
          context={context}
          validation={validationResult}
        />
      )}
      {showLockButtons && (
        <LockRuleActionControlElement
          testID={TestID.lockRule}
          label={translations.lockRule.label}
          title={translations.lockRule.title}
          className={c(standardClassnames.lockRule, classNames.lockRule)}
          handleOnClick={toggleLockRule}
          level={level}
          path={path}
          disabled={disabled}
          disabledTranslation={parentDisabled ? undefined : translations.lockRuleDisabled}
          context={context}
          validation={validationResult}
        />
      )}
      <RemoveRuleActionControlElement
        testID={TestID.removeRule}
        label={translations.removeRule.label}
        title={translations.removeRule.title}
        className={c(standardClassnames.removeRule, classNames.removeRule)}
        handleOnClick={removeRule}
        level={level}
        path={path}
        disabled={disabled}
        context={context}
        validation={validationResult}
      />
    </div>
  );
};

Rule.displayName = 'Rule';
