import { MouseEvent as ReactMouseEvent, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { DNDType, standardClassnames, TestID } from './defaults';
import type { DraggedItem, Field, RuleProps, RuleType } from './types';
import {
  c,
  filterFieldsByComparator,
  getParentPath,
  getValidationClassNames,
  isAncestor,
  pathsAreEqual,
} from './utils';

export const Rule = ({
  id,
  path,
  field,
  operator,
  value,
  translations,
  schema,
  disabled: disabledProp,
  parentDisabled,
  context,
  valueSource,
}: RuleProps) => {
  const {
    classNames,
    controls,
    fields,
    fieldMap,
    getInputType,
    getOperators,
    getValueEditorType,
    getValueSources,
    getValues,
    moveRule,
    onPropChange,
    onRuleRemove,
    autoSelectField,
    showCloneButtons,
    showLockButtons,
    independentCombinators,
    validationMap,
  } = schema;
  const disabled = !!parentDisabled || !!disabledProp;

  const dndRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLSpanElement>(null);
  const [{ isDragging, dragMonitorId }, drag, preview] = useDrag(
    () => ({
      type: DNDType.rule,
      item: (): DraggedItem => ({ path }),
      canDrag: !disabled,
      collect: monitor => ({
        isDragging: !disabled && monitor.isDragging(),
        dragMonitorId: monitor.getHandlerId(),
      }),
    }),
    [disabled, path]
  );
  const [{ isOver, dropMonitorId }, drop] = useDrop(
    () => ({
      accept: [DNDType.rule, DNDType.ruleGroup],
      canDrop: (item: DraggedItem) => {
        if (disabled) return false;
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
      collect: monitor => ({
        isOver: monitor.canDrop() && monitor.isOver(),
        dropMonitorId: monitor.getHandlerId(),
      }),
      drop: (item: DraggedItem, _monitor) => {
        const parentHoverPath = getParentPath(path);
        const hoverIndex = path[path.length - 1];

        moveRule(item.path, [...parentHoverPath, hoverIndex + 1]);
      },
    }),
    [disabled, moveRule, path]
  );
  drag(dragRef);
  preview(drop(dndRef));

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

  const fieldData = fieldMap?.[field] ?? ({} as Field);
  const inputType = fieldData.inputType ?? getInputType(field, operator);
  const operators = fieldData.operators ?? getOperators(field);
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
  const dndDragging = isDragging ? standardClassnames.dndDragging : '';
  const dndOver = isOver ? standardClassnames.dndOver : '';
  const outerClassName = c(
    standardClassnames.rule,
    classNames.rule,
    disabled ? standardClassnames.disabled : '',
    validationClassName,
    dndDragging,
    dndOver
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
      <controls.dragHandle
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
      <controls.fieldSelector
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
      {(autoSelectField || fieldData.name !== '~') && (
        <>
          <controls.operatorSelector
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
          {!['null', 'notNull'].includes(operator) && valueSources.length > 1 && (
            <controls.valueSourceSelector
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
          <controls.valueEditor
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
      {showCloneButtons && (
        <controls.cloneRuleAction
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
        <controls.lockRuleAction
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
      <controls.removeRuleAction
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
