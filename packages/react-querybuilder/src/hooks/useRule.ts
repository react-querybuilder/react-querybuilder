import { clsx } from 'clsx';
import { useMemo } from 'react';
import { standardClassnames } from '../defaults';
import type { RuleProps, RuleType } from '../types';
import {
  filterFieldsByComparator,
  getOption,
  getParentPath,
  getValidationClassNames,
  useDeprecatedProps,
  useReactDndWarning,
} from '../utils';

export const useRule = (props: RuleProps) => {
  const {
    id,
    path,
    rule: ruleProp,
    schema,
    actions,
    disabled: disabledProp,
    parentDisabled,
    field: fieldProp,
    operator: operatorProp,
    value: valueProp,
    valueSource: valueSourceProp,
    dragMonitorId = '',
    dropMonitorId = '',
    dndRef = null,
    dragRef = null,
    isDragging = false,
    isOver = false,
  } = props;

  const {
    classNames: classNamesProp,
    fields,
    fieldMap,
    getInputType,
    getOperators,
    getValueEditorType,
    getValueEditorSeparator,
    getValueSources,
    getValues,
    validationMap,
    enableDragAndDrop,
    getRuleClassname,
  } = schema;

  const { moveRule, onPropChange, onRuleRemove } = actions;
  const disabled = !!parentDisabled || !!disabledProp;

  const rule = ruleProp
    ? ruleProp
    : {
        field: fieldProp!,
        operator: operatorProp!,
        value: valueProp,
        valueSource: valueSourceProp,
      };
  const { field, operator, value, valueSource } = rule;

  useDeprecatedProps('rule', !!ruleProp);

  useReactDndWarning(enableDragAndDrop, !!(dragMonitorId || dropMonitorId || dndRef || dragRef));

  const classNames = useMemo(
    () => ({
      dragHandle: clsx(standardClassnames.dragHandle, classNamesProp.dragHandle),
      fields: clsx(standardClassnames.fields, classNamesProp.fields),
      operators: clsx(standardClassnames.operators, classNamesProp.operators),
      valueSource: clsx(standardClassnames.valueSource, classNamesProp.valueSource),
      value: clsx(standardClassnames.value, classNamesProp.value),
      cloneRule: clsx(standardClassnames.cloneRule, classNamesProp.cloneRule),
      lockRule: clsx(standardClassnames.lockRule, classNamesProp.lockRule),
      removeRule: clsx(standardClassnames.removeRule, classNamesProp.removeRule),
    }),
    [
      classNamesProp.dragHandle,
      classNamesProp.fields,
      classNamesProp.operators,
      classNamesProp.valueSource,
      classNamesProp.value,
      classNamesProp.cloneRule,
      classNamesProp.lockRule,
      classNamesProp.removeRule,
    ]
  );

  const generateOnChangeHandler =
    (prop: Exclude<keyof RuleType, 'id' | 'path'>) => (value: any, _context?: any) => {
      if (!disabled) {
        onPropChange(prop, value, path);
      }
    };

  const cloneRule = (_event?: any, _context?: any) => {
    if (!disabled) {
      const newPath = [...getParentPath(path), path[path.length - 1] + 1];
      moveRule(path, newPath, true);
    }
  };

  const toggleLockRule = (_event?: any, _context?: any) => {
    onPropChange('disabled', !disabled, path);
  };

  const removeRule = (_event?: any, _context?: any) => {
    if (!disabled) {
      onRuleRemove(path);
    }
  };

  const fieldData = fieldMap?.[field] ?? { name: field, label: field };
  const inputType = fieldData.inputType ?? getInputType(field, operator);
  const operators = getOperators(field);
  const operatorObject = getOption(operators, operator);
  const arity = operatorObject?.arity;
  const hideValueControls =
    (typeof arity === 'string' && arity === 'unary') || (typeof arity === 'number' && arity < 2);
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
  const valueEditorSeparator = getValueEditorSeparator(field, operator);
  const values =
    valueSource === 'field'
      ? filterFieldsByComparator(fieldData, fields, operator)
      : fieldData.values ?? getValues(field, operator);
  const valueSourceOptions = valueSources.map(vs => ({ name: vs, label: vs }));

  const validationResult =
    validationMap[id ?? /* istanbul ignore next */ ''] ??
    (typeof fieldData.validator === 'function'
      ? fieldData.validator({ id, field, operator, value })
      : null);
  const validationClassName = getValidationClassNames(validationResult);
  const fieldBasedClassName = useMemo(() => fieldData?.className ?? '', [fieldData?.className]);
  const operatorBasedClassName = useMemo(
    () => operatorObject?.className ?? '',
    [operatorObject?.className]
  );

  const outerClassName = clsx(
    getRuleClassname(rule),
    fieldBasedClassName,
    operatorBasedClassName,
    standardClassnames.rule,
    classNamesProp.rule,
    {
      [standardClassnames.disabled]: disabled,
      [standardClassnames.dndDragging]: isDragging,
      [standardClassnames.dndOver]: isOver,
    },
    validationClassName
  );

  return {
    classNames,
    cloneRule,
    disabled,
    dndRef,
    dragMonitorId,
    dragRef,
    dropMonitorId,
    fieldData,
    generateOnChangeHandler,
    hideValueControls,
    inputType,
    operators,
    outerClassName,
    removeRule,
    rule,
    toggleLockRule,
    validationResult,
    valueEditorSeparator,
    valueEditorType,
    values,
    valueSourceOptions,
    valueSources,
  };
};
