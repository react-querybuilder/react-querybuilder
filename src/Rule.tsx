import { MouseEvent as ReactMouseEvent, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { dndTypes, standardClassnames } from './defaults';
import { Field, RuleProps, RuleType } from './types';
import { c, generateID, getParentPath, getValidationClassNames } from './utils';

export const Rule = ({
  id,
  path,
  field,
  operator,
  value,
  translations,
  schema,
  context
}: RuleProps) => {
  const {
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
    enableDragAndDrop,
    validationMap
  } = schema;

  const dndRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLSpanElement>(null);
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: dndTypes.rule,
      item: { id, path, field, operator, value },
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      })
    }),
    []
  );
  const [{ isOver }, drop] = useDrop(() => ({
    accept: [dndTypes.rule, dndTypes.ruleGroup],
    collect: (monitor) => ({
      isOver: monitor.isOver() && (monitor.getItem() as any).id !== id
      // canDrop: monitor.canDrop()
    })
  }));
  drag(dragRef);
  preview(drop(dndRef));

  const generateOnChangeHandler =
    (prop: Exclude<keyof RuleType, 'id' | 'path'>) => (value: any) => {
      onPropChange(prop, value, path);
    };

  const cloneRule = (event: ReactMouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();

    const newRule: RuleType = JSON.parse(
      JSON.stringify({
        id: `r-${generateID()}`,
        field,
        operator,
        value
      })
    );
    const parentPath = getParentPath(path);
    onRuleAdd(newRule, parentPath);
  };

  const removeRule = (event: ReactMouseEvent<Element, MouseEvent>) => {
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
  const dndDragging = isDragging ? standardClassnames.dndDragging : '';
  const dndOver = isOver ? standardClassnames.dndOver : '';
  const outerClassName = c(
    standardClassnames.rule,
    classNames.rule,
    validationClassName,
    dndDragging,
    dndOver
  );

  return (
    <div
      ref={dndRef}
      className={outerClassName}
      data-rule-id={id}
      data-level={level}
      data-path={JSON.stringify(path)}>
      <controls.dragHandle
        ref={dragRef}
        enabled={enableDragAndDrop}
        level={level}
        title={translations.dragHandle.title}
        label={translations.dragHandle.label}
        className={c(standardClassnames.dragHandle, classNames.dragHandle)}
      />
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
