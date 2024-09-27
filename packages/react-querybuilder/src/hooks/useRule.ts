import type { MouseEvent } from 'react';
import { useCallback, useMemo } from 'react';
import { standardClassnames } from '../defaults';
import { useDeprecatedProps, useReactDndWarning } from '../hooks';
import type {
  DropEffect,
  FlexibleOptionList,
  FullField,
  FullOperator,
  FullOption,
  InputType,
  Option,
  OptionGroup,
  Path,
  QueryActions,
  RuleProps,
  RuleType,
  Schema,
  Translations,
  ValidationResult,
  ValueEditorType,
  ValueSource,
  ValueSources,
} from '../types';
import {
  filterFieldsByComparator,
  getOption,
  getParentPath,
  getValidationClassNames,
} from '../utils';
import { clsx } from '../utils/clsx';

/**
 * Prepares all values and methods used by the {@link Rule} component.
 */
export const useRule = (
  props: RuleProps
): {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cloneRule: (_event?: any, _context?: any) => void;
  disabled: boolean;
  dndRef: React.Ref<HTMLDivElement>;
  dragMonitorId: string | symbol;
  dragRef: React.Ref<HTMLSpanElement>;
  dropMonitorId: string | symbol;
  fieldData: FullField<string, string, string, Option<string>, Option<string>>;
  generateOnChangeHandler: (
    prop: Exclude<keyof RuleType, 'id' | 'path'>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => (value: any, _context?: any) => void;
  hideValueControls: boolean;
  inputType: InputType | null;
  operators: FullOperator<string>[] | OptionGroup<FullOperator<string>>[];
  outerClassName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removeRule: (_event?: any, _context?: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rule: RuleType<string, string, any, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shiftRuleUp: (event?: MouseEvent, _context?: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shiftRuleDown: (event?: MouseEvent, _context?: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toggleLockRule: (_event?: any, _context?: any) => void;
  validationResult: boolean | ValidationResult;
  valueEditorSeparator: React.ReactNode;
  valueEditorType: ValueEditorType;
  values: FlexibleOptionList<Option<string>>;
  valueSourceOptions: {
    name: 'field' | 'value';
    value: 'field' | 'value';
    label: 'field' | 'value';
  }[];
  valueSources: ValueSources;
  field?: string;
  operator?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  valueSource?: ValueSource;
  id?: string;
  path: Path;
  parentDisabled?: boolean;
  translations: Translations;
  schema: Schema<FullOption<string>, string>;
  actions: QueryActions;
  shiftUpDisabled?: boolean;
  shiftDownDisabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
  isDragging?: boolean | undefined;
  isOver?: boolean | undefined;
  dropEffect?: DropEffect | undefined;
} => {
  const {
    id,
    path,
    rule: ruleProp,
    schema,
    actions: { moveRule, onPropChange, onRuleRemove },
    disabled: disabledProp,
    parentDisabled,
    shiftUpDisabled,
    shiftDownDisabled,
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

  useDeprecatedProps('rule', !ruleProp);

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
      fields: clsx(standardClassnames.fields, classNamesProp.valueSelector, classNamesProp.fields),
      operators: clsx(
        standardClassnames.operators,
        classNamesProp.valueSelector,
        classNamesProp.operators
      ),
      valueSource: clsx(
        standardClassnames.valueSource,
        classNamesProp.valueSelector,
        classNamesProp.valueSource
      ),
      value: clsx(standardClassnames.value, classNamesProp.value),
      cloneRule: clsx(
        standardClassnames.cloneRule,
        classNamesProp.actionElement,
        classNamesProp.cloneRule
      ),
      lockRule: clsx(
        standardClassnames.lockRule,
        classNamesProp.actionElement,
        classNamesProp.lockRule
      ),
      removeRule: clsx(
        standardClassnames.removeRule,
        classNamesProp.actionElement,
        classNamesProp.removeRule
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

  const cloneRule = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_event?: any, _context?: any) => {
      if (!disabled) {
        const newPath = [...getParentPath(path), path[path.length - 1] + 1];
        moveRule(path, newPath, true);
      }
    },
    [disabled, moveRule, path]
  );

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
    () => valueSources.map(vs => ({ name: vs, value: vs, label: vs })),
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
    getRuleClassname(rule, { fieldData }),
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
