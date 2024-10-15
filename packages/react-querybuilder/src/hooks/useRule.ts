import type { MouseEvent } from 'react';
import { useCallback, useMemo } from 'react';
import { standardClassnames } from '../defaults';
import type {
  ActionElementEventHandler,
  FlexibleOptionList,
  FullField,
  FullOperator,
  InputType,
  Option,
  OptionList,
  RuleProps,
  RuleType,
  ValidationResult,
  ValueEditorType,
  ValueSourceOptions,
  ValueSources,
} from '../types';
import {
  filterFieldsByComparator,
  getOption,
  getParentPath,
  getValidationClassNames,
} from '../utils';
import { clsx } from '../utils/clsx';
import { useDeprecatedProps } from './useDeprecatedProps';
import { useReactDndWarning } from './useReactDndWarning';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type UseRule = RuleProps & {
  classNames: {
    shiftActions: string;
    dragHandle: string;
    fields: string;
    operators: string;
    valueSource: string;
    value: string;
    cloneRule: string;
    lockRule: string;
    removeRule: string;
  };
  cloneRule: ActionElementEventHandler;
  fieldData: FullField<string, string, string, Option<string>, Option<string>>;
  generateOnChangeHandler: (
    prop: Exclude<keyof RuleType, 'id' | 'path'>
  ) => ActionElementEventHandler;
  hideValueControls: boolean;
  inputType: InputType | null;
  operators: OptionList<FullOperator>;
  outerClassName: string;
  removeRule: ActionElementEventHandler;
  shiftRuleUp: (event?: MouseEvent, _context?: any) => void;
  shiftRuleDown: (event?: MouseEvent, _context?: any) => void;
  toggleLockRule: ActionElementEventHandler;
  validationResult: boolean | ValidationResult;
  valueEditorSeparator: React.ReactNode;
  valueEditorType: ValueEditorType;
  values: FlexibleOptionList<Option<string>>;
  valueSourceOptions: ValueSourceOptions;
  valueSources: ValueSources;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Prepares all values and methods used by the {@link Rule} component.
 */
export const useRule = (props: RuleProps): UseRule => {
  const {
    id,
    path,
    rule: ruleProp,
    schema: {
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
      suppressStandardClassnames,
    },
    actions: { moveRule, onPropChange, onRuleRemove },
    disabled: disabledProp,
    parentDisabled,
    shiftUpDisabled,
    shiftDownDisabled,
    field: fieldProp,
    operator: operatorProp,
    value: valueProp,
    valueSource: valueSourceProp,
    // Drag-and-drop
    dropEffect = 'move',
    dragMonitorId = '',
    dropMonitorId = '',
    dndRef = null,
    dragRef = null,
    isDragging = false,
    isOver = false,
  } = props;

  useDeprecatedProps('rule', !ruleProp);

  useReactDndWarning(enableDragAndDrop, !!(dragMonitorId || dropMonitorId || dndRef || dragRef));

  const disabled = !!parentDisabled || !!disabledProp;

  const rule = useMemo(
    () =>
      ruleProp ?? {
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
      shiftActions: clsx(
        suppressStandardClassnames || standardClassnames.shiftActions,
        classNamesProp.shiftActions
      ),
      dragHandle: clsx(
        suppressStandardClassnames || standardClassnames.dragHandle,
        classNamesProp.dragHandle
      ),
      fields: clsx(
        suppressStandardClassnames || standardClassnames.fields,
        classNamesProp.valueSelector,
        classNamesProp.fields
      ),
      operators: clsx(
        suppressStandardClassnames || standardClassnames.operators,
        classNamesProp.valueSelector,
        classNamesProp.operators
      ),
      valueSource: clsx(
        suppressStandardClassnames || standardClassnames.valueSource,
        classNamesProp.valueSelector,
        classNamesProp.valueSource
      ),
      value: clsx(suppressStandardClassnames || standardClassnames.value, classNamesProp.value),
      cloneRule: clsx(
        suppressStandardClassnames || standardClassnames.cloneRule,
        classNamesProp.actionElement,
        classNamesProp.cloneRule
      ),
      lockRule: clsx(
        suppressStandardClassnames || standardClassnames.lockRule,
        classNamesProp.actionElement,
        classNamesProp.lockRule
      ),
      removeRule: clsx(
        suppressStandardClassnames || standardClassnames.removeRule,
        classNamesProp.actionElement,
        classNamesProp.removeRule
      ),
      valueListItem: clsx(
        suppressStandardClassnames || standardClassnames.valueListItem,
        classNamesProp.valueListItem
      ),
    }),
    [
      classNamesProp.shiftActions,
      classNamesProp.dragHandle,
      classNamesProp.valueSelector,
      classNamesProp.fields,
      classNamesProp.operators,
      classNamesProp.valueSource,
      classNamesProp.value,
      classNamesProp.actionElement,
      classNamesProp.cloneRule,
      classNamesProp.lockRule,
      classNamesProp.removeRule,
      classNamesProp.valueListItem,
      suppressStandardClassnames,
    ]
  );

  const generateOnChangeHandler = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prop: Exclude<keyof RuleType, 'id' | 'path'>) => (value: any, _context?: any) => {
      if (!disabled) {
        onPropChange(prop, value, path);
      }
    },
    [disabled, onPropChange, path]
  );

  const cloneRule: ActionElementEventHandler = useCallback(() => {
    if (!disabled) {
      const newPath = [...getParentPath(path), path.at(-1)! + 1];
      moveRule(path, newPath, true);
    }
  }, [disabled, moveRule, path]);

  const toggleLockRule = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_event?: any, _context?: any) => {
      onPropChange('disabled', !disabled, path);
    },
    [disabled, onPropChange, path]
  );

  const removeRule = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_event?: any, _context?: any) => {
      if (!disabled) {
        onRuleRemove(path);
      }
    },
    [disabled, onRuleRemove, path]
  );

  const shiftRuleUp = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event?: MouseEvent, _context?: any) => {
      if (!disabled && !shiftUpDisabled) {
        moveRule(path, 'up', event?.altKey);
      }
    },
    [disabled, moveRule, path, shiftUpDisabled]
  );

  const shiftRuleDown = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event?: MouseEvent, _context?: any) => {
      if (!disabled && !shiftDownDisabled) {
        moveRule(path, 'down', event?.altKey);
      }
    },
    [disabled, moveRule, path, shiftDownDisabled]
  );

  const fieldData: FullField = useMemo(
    () => fieldMap?.[rule.field] ?? { name: rule.field, value: rule.field, label: rule.field },
    [fieldMap, rule.field]
  );
  const inputType = useMemo(
    () => fieldData.inputType ?? getInputType(rule.field, rule.operator, { fieldData }),
    [fieldData, getInputType, rule.field, rule.operator]
  );
  const operators = useMemo(
    () => getOperators(rule.field, { fieldData }),
    [fieldData, getOperators, rule.field]
  );
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
        : (fieldData.valueSources ?? getValueSources(rule.field, rule.operator, { fieldData })),
    [fieldData, getValueSources, rule.field, rule.operator]
  );
  const valueEditorType = useMemo(
    () =>
      rule.valueSource === 'field'
        ? 'select'
        : getValueEditorType(rule.field, rule.operator, { fieldData }),
    [fieldData, getValueEditorType, rule.field, rule.operator, rule.valueSource]
  );
  const valueEditorSeparator = useMemo(
    () => getValueEditorSeparator(rule.field, rule.operator, { fieldData }),
    [fieldData, getValueEditorSeparator, rule.field, rule.operator]
  );
  const values = useMemo(
    () =>
      rule.valueSource === 'field'
        ? filterFieldsByComparator(fieldData, fields, rule.operator)
        : (fieldData.values ?? getValues(rule.field, rule.operator, { fieldData })),
    [fieldData, fields, getValues, rule.field, rule.operator, rule.valueSource]
  );
  const valueSourceOptions = useMemo(
    () => valueSources.map(vs => ({ name: vs, value: vs, label: vs })) as ValueSourceOptions,
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

  const outerClassName = useMemo(
    () =>
      clsx(
        getRuleClassname(rule, { fieldData }),
        fieldBasedClassName,
        operatorBasedClassName,
        suppressStandardClassnames || standardClassnames.rule,
        classNamesProp.rule,
        // custom conditional classes
        disabled && classNamesProp.disabled,
        isDragging && classNamesProp.dndDragging,
        isOver && classNamesProp.dndOver,
        isOver && dropEffect === 'copy' && classNamesProp.dndCopy,
        // standard conditional classes
        suppressStandardClassnames || {
          [standardClassnames.disabled]: disabled,
          [standardClassnames.dndDragging]: isDragging,
          [standardClassnames.dndOver]: isOver,
          [standardClassnames.dndCopy]: isOver && dropEffect === 'copy',
        },
        validationClassName
      ),
    [
      classNamesProp.disabled,
      classNamesProp.dndCopy,
      classNamesProp.dndDragging,
      classNamesProp.dndOver,
      classNamesProp.rule,
      disabled,
      dropEffect,
      fieldBasedClassName,
      fieldData,
      getRuleClassname,
      isDragging,
      isOver,
      operatorBasedClassName,
      rule,
      suppressStandardClassnames,
      validationClassName,
    ]
  );

  return {
    ...props,
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
    shiftRuleUp,
    shiftRuleDown,
    toggleLockRule,
    validationResult,
    valueEditorSeparator,
    valueEditorType,
    values,
    valueSourceOptions,
    valueSources,
  };
};
