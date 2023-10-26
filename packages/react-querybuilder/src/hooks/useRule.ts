import { clsx } from 'clsx';
import { useCallback, useMemo } from 'react';
import { standardClassnames } from '../defaults';
import { useDeprecatedProps, useReactDndWarning } from '../hooks';
import type { RuleProps, RuleType } from '../types';
import {
  filterFieldsByComparator,
  getOption,
  getParentPath,
  getValidationClassNames,
} from '../utils';

/**
 * Prepares all values and methods used by the {@link Rule} component.
 */
export const useRule = (props: RuleProps) => {
  const {
    id,
    path,
    rule: ruleProp,
    schema,
    actions: { moveRule, onPropChange, onRuleRemove },
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

  useDeprecatedProps('rule', !!ruleProp);

  useReactDndWarning(enableDragAndDrop, !!(dragMonitorId || dropMonitorId || dndRef || dragRef));

  const disabled = !!parentDisabled || !!disabledProp;

  const rule = useMemo(
    () =>
      ruleProp
        ? ruleProp
        : {
            id,
            field: fieldProp ?? /* istanbul ignore next */ '',
            operator: operatorProp ?? /* istanbul ignore next */ '',
            value: valueProp,
            valueSource: valueSourceProp,
          },
    [fieldProp, id, operatorProp, ruleProp, valueProp, valueSourceProp]
  );

  const classNames = useMemo(
    () => ({
      shiftActions: clsx(standardClassnames.shiftActions, classNamesProp.shiftActions),
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
      classNamesProp.shiftActions,
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

  const generateOnChangeHandler = useCallback(
    (prop: Exclude<keyof RuleType, 'id' | 'path'>) => (value: any, _context?: any) => {
      if (!disabled) {
        onPropChange(prop, value, path);
      }
    },
    [disabled, onPropChange, path]
  );

  const cloneRule = useCallback(
    (_event?: any, _context?: any) => {
      if (!disabled) {
        const newPath = [...getParentPath(path), path[path.length - 1] + 1];
        moveRule(path, newPath, true);
      }
    },
    [disabled, moveRule, path]
  );

  const toggleLockRule = useCallback(
    (_event?: any, _context?: any) => {
      onPropChange('disabled', !disabled, path);
    },
    [disabled, onPropChange, path]
  );

  const removeRule = useCallback(
    (_event?: any, _context?: any) => {
      if (!disabled) {
        onRuleRemove(path);
      }
    },
    [disabled, onRuleRemove, path]
  );

  const fieldData = useMemo(
    () => fieldMap?.[rule.field] ?? { name: rule.field, label: rule.field },
    [fieldMap, rule.field]
  );
  const inputType = useMemo(
    () => fieldData.inputType ?? getInputType(rule.field, rule.operator),
    [fieldData.inputType, getInputType, rule.field, rule.operator]
  );
  const operators = useMemo(() => getOperators(rule.field), [getOperators, rule.field]);
  const operatorObject = useMemo(
    () => getOption(operators, rule.operator),
    [operators, rule.operator]
  );
  const arity = operatorObject?.arity;
  const hideValueControls =
    (typeof arity === 'string' && arity === 'unary') || (typeof arity === 'number' && arity < 2);
  const valueSources = useMemo(
    () =>
      typeof fieldData.valueSources === 'function'
        ? fieldData.valueSources(rule.operator)
        : fieldData.valueSources ?? getValueSources(rule.field, rule.operator),
    [fieldData, getValueSources, rule.field, rule.operator]
  );
  const valueEditorType = useMemo(
    () =>
      rule.valueSource === 'field'
        ? 'select'
        : (typeof fieldData.valueEditorType === 'function'
            ? fieldData.valueEditorType(rule.operator)
            : fieldData.valueEditorType) ?? getValueEditorType(rule.field, rule.operator),
    [fieldData, getValueEditorType, rule.field, rule.operator, rule.valueSource]
  );
  const valueEditorSeparator = useMemo(
    () => getValueEditorSeparator(rule.field, rule.operator),
    [getValueEditorSeparator, rule.field, rule.operator]
  );
  const values = useMemo(
    () =>
      rule.valueSource === 'field'
        ? filterFieldsByComparator(fieldData, fields, rule.operator)
        : fieldData.values ?? getValues(rule.field, rule.operator),
    [fieldData, fields, getValues, rule.field, rule.operator, rule.valueSource]
  );
  const valueSourceOptions = useMemo(
    () => valueSources.map(vs => ({ name: vs, label: vs })),
    [valueSources]
  );

  const validationResult = useMemo(
    () =>
      validationMap[id ?? /* istanbul ignore next */ ''] ??
      (typeof fieldData.validator === 'function' ? fieldData.validator(rule) : null),
    [fieldData, id, rule, validationMap]
  );
  const validationClassName = useMemo(
    () => getValidationClassNames(validationResult),
    [validationResult]
  );
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
