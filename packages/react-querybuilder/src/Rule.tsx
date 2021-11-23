import { MouseEvent as ReactMouseEvent, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { dndTypes, standardClassnames } from './defaults';
import type { DraggedItem, Field, RuleProps, RuleType } from './types';
import { c, getParentPath, getValidationClassNames, isAncestor, pathsAreEqual } from './utils';

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
    moveRule,
    onPropChange,
    onRuleRemove,
    autoSelectField,
    showCloneButtons,
    independentCombinators,
    validationMap
  } = schema;

  const dndRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLSpanElement>(null);
  const [{ isDragging, dragMonitorId }, drag, preview] = useDrag(() => ({
    type: dndTypes.rule,
    item: (): DraggedItem => ({ path }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      dragMonitorId: monitor.getHandlerId()
    })
  }));
  const [{ isOver, dropMonitorId }, drop] = useDrop(
    () => ({
      accept: [dndTypes.rule, dndTypes.ruleGroup],
      canDrop: (item: DraggedItem) => {
        const parentHoverPath = getParentPath(path);
        const parentItemPath = getParentPath(item.path);
        const hoverIndex = path[path.length - 1];
        const itemIndex = item.path[item.path.length - 1];

        // Don't allow drop if 1) item is ancestor of drop target,
        // or 2) item is hovered over itself or the previous item
        return !(
          isAncestor(item.path, path) ||
          (pathsAreEqual(parentHoverPath, parentItemPath) &&
            (hoverIndex === itemIndex ||
              hoverIndex === itemIndex - 1 ||
              (independentCombinators && hoverIndex === itemIndex - 2)))
        );
      },
      collect: (monitor) => ({
        isOver: monitor.canDrop() && monitor.isOver(),
        dropMonitorId: monitor.getHandlerId()
      }),
      drop: (item: DraggedItem, _monitor) => {
        const parentHoverPath = getParentPath(path);
        const hoverIndex = path[path.length - 1];

        moveRule(item.path, [...parentHoverPath, hoverIndex + 1]);
      }
    }),
    [moveRule, path]
  );
  drag(dragRef);
  preview(drop(dndRef));

  const generateOnChangeHandler =
    (prop: Exclude<keyof RuleType, 'id' | 'path'>) => (value: any) => {
      onPropChange(prop, value, path);
    };

  const cloneRule = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const newPath = [...getParentPath(path), path[path.length - 1] + 1];
    moveRule(path, newPath, true);
  };

  const removeRule = (event: ReactMouseEvent) => {
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
      data-testid="rule"
      data-dragmonitorid={dragMonitorId}
      data-dropmonitorid={dropMonitorId}
      className={outerClassName}
      data-rule-id={id}
      data-level={level}
      data-path={JSON.stringify(path)}>
      <controls.dragHandle
        ref={dragRef}
        level={level}
        title={translations.dragHandle.title}
        label={translations.dragHandle.label}
        className={c(standardClassnames.dragHandle, classNames.dragHandle)}
        context={context}
        validation={validationResult}
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
