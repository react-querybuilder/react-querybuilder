import type { MouseEvent } from 'react';
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { standardClassnames, TestID } from '../defaults';
import { useDeprecatedProps } from '../hooks/useDeprecatedProps';
import { useReactDndWarning } from '../hooks/useReactDndWarning';
import { useStopEventPropagation } from '../hooks/useStopEventPropagation';
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
  ValueChangeEventHandler,
  ValueEditorType,
  ValueSourceOptions,
  ValueSources,
} from '../types';
import {
  filterFieldsByComparator,
  getOption,
  getParentPath,
  getValidationClassNames,
  isFlexibleOptionArray,
  isFlexibleOptionGroupArray,
  toFullOptionList,
} from '../utils';
import { clsx } from '../utils/clsx';

/**
 * Default component to display {@link RuleType} objects. This is
 * actually a small wrapper around {@link RuleComponents}.
 *
 * @group Components
 */
export const Rule: React.MemoExoticComponent<(r: RuleProps) => React.JSX.Element> = React.memo(
  function Rule(props: RuleProps): React.JSX.Element {
    const r = useRule(props);

    const cloneRule = useStopEventPropagation(r.cloneRule);
    const toggleLockRule = useStopEventPropagation(r.toggleLockRule);
    const removeRule = useStopEventPropagation(r.removeRule);
    const shiftRuleUp = useStopEventPropagation(r.shiftRuleUp);
    const shiftRuleDown = useStopEventPropagation(r.shiftRuleDown);

    return (
      <div
        ref={r.dndRef}
        data-testid={TestID.rule}
        data-dragmonitorid={r.dragMonitorId}
        data-dropmonitorid={r.dropMonitorId}
        className={r.outerClassName}
        data-rule-id={r.id}
        data-level={r.path.length}
        data-path={JSON.stringify(r.path)}>
        <RuleComponents
          {...r}
          cloneRule={cloneRule}
          toggleLockRule={toggleLockRule}
          removeRule={removeRule}
          shiftRuleUp={shiftRuleUp}
          shiftRuleDown={shiftRuleDown}
        />
      </div>
    );
  }
);

/**
 * Renders a `React.Fragment` containing an array of form controls for managing a {@link RuleType}.
 *
 * @group Components
 */
export const RuleComponents: React.MemoExoticComponent<(r: UseRule) => React.JSX.Element> =
  React.memo(function RuleComponents(r: UseRule) {
    const {
      schema: {
        controls: {
          shiftActions: ShiftActionsControlElement,
          dragHandle: DragHandleControlElement,
          fieldSelector: FieldSelectorControlElement,
          operatorSelector: OperatorSelectorControlElement,
          valueSourceSelector: ValueSourceSelectorControlElement,
          valueEditor: ValueEditorControlElement,
          cloneRuleAction: CloneRuleActionControlElement,
          lockRuleAction: LockRuleActionControlElement,
          removeRuleAction: RemoveRuleActionControlElement,
        },
      },
    } = r;

    return (
      <>
        {r.schema.showShiftActions && (
          <ShiftActionsControlElement
            key={TestID.shiftActions}
            testID={TestID.shiftActions}
            level={r.path.length}
            path={r.path}
            titles={{
              shiftUp: r.translations.shiftActionUp.title,
              shiftDown: r.translations.shiftActionDown.title,
            }}
            labels={{
              shiftUp: r.translations.shiftActionUp.label,
              shiftDown: r.translations.shiftActionDown.label,
            }}
            className={r.classNames.shiftActions}
            disabled={r.disabled}
            shiftUp={r.shiftRuleUp}
            shiftDown={r.shiftRuleDown}
            shiftUpDisabled={r.shiftUpDisabled}
            shiftDownDisabled={r.shiftDownDisabled}
            context={r.context}
            validation={r.validationResult}
            schema={r.schema}
            ruleOrGroup={r.rule}
          />
        )}
        {r.schema.enableDragAndDrop && (
          <DragHandleControlElement
            key={TestID.dragHandle}
            testID={TestID.dragHandle}
            ref={r.dragRef}
            level={r.path.length}
            path={r.path}
            title={r.translations.dragHandle.title}
            label={r.translations.dragHandle.label}
            className={r.classNames.dragHandle}
            disabled={r.disabled}
            context={r.context}
            validation={r.validationResult}
            schema={r.schema}
            ruleOrGroup={r.rule}
          />
        )}
        <FieldSelectorControlElement
          key={TestID.fields}
          testID={TestID.fields}
          options={r.schema.fields}
          title={r.translations.fields.title}
          value={r.rule.field}
          operator={r.rule.operator}
          className={r.classNames.fields}
          handleOnChange={r.onChangeField}
          level={r.path.length}
          path={r.path}
          disabled={r.disabled}
          context={r.context}
          validation={r.validationResult}
          schema={r.schema}
          rule={r.rule}
        />
        {(r.schema.autoSelectField || r.rule.field !== r.translations.fields.placeholderName) && (
          <>
            <OperatorSelectorControlElement
              key={TestID.operators}
              testID={TestID.operators}
              field={r.rule.field}
              fieldData={r.fieldData}
              title={r.translations.operators.title}
              options={r.operators}
              value={r.rule.operator}
              className={r.classNames.operators}
              handleOnChange={r.onChangeOperator}
              level={r.path.length}
              path={r.path}
              disabled={r.disabled}
              context={r.context}
              validation={r.validationResult}
              schema={r.schema}
              rule={r.rule}
            />
            {(r.schema.autoSelectOperator ||
              r.rule.operator !== r.translations.operators.placeholderName) &&
              !r.hideValueControls && (
                <>
                  {!['null', 'notNull'].includes(r.rule.operator) && r.valueSources.length > 1 && (
                    <ValueSourceSelectorControlElement
                      key={TestID.valueSourceSelector}
                      testID={TestID.valueSourceSelector}
                      field={r.rule.field}
                      fieldData={r.fieldData}
                      title={r.translations.valueSourceSelector.title}
                      options={r.valueSourceOptions}
                      value={r.rule.valueSource ?? 'value'}
                      className={r.classNames.valueSource}
                      handleOnChange={r.onChangeValueSource}
                      level={r.path.length}
                      path={r.path}
                      disabled={r.disabled}
                      context={r.context}
                      validation={r.validationResult}
                      schema={r.schema}
                      rule={r.rule}
                    />
                  )}
                  <ValueEditorControlElement
                    key={TestID.valueEditor}
                    testID={TestID.valueEditor}
                    field={r.rule.field}
                    fieldData={r.fieldData}
                    title={r.translations.value.title}
                    operator={r.rule.operator}
                    value={r.rule.value}
                    valueSource={r.rule.valueSource ?? 'value'}
                    type={r.valueEditorType}
                    inputType={r.inputType}
                    values={r.values}
                    listsAsArrays={r.schema.listsAsArrays}
                    parseNumbers={r.schema.parseNumbers}
                    separator={r.valueEditorSeparator}
                    className={r.classNames.value}
                    handleOnChange={r.onChangeValue}
                    level={r.path.length}
                    path={r.path}
                    disabled={r.disabled}
                    context={r.context}
                    validation={r.validationResult}
                    schema={r.schema}
                    rule={r.rule}
                  />
                </>
              )}
          </>
        )}
        {r.schema.showCloneButtons && (
          <CloneRuleActionControlElement
            key={TestID.cloneRule}
            testID={TestID.cloneRule}
            label={r.translations.cloneRule.label}
            title={r.translations.cloneRule.title}
            className={r.classNames.cloneRule}
            handleOnClick={r.cloneRule}
            level={r.path.length}
            path={r.path}
            disabled={r.disabled}
            context={r.context}
            validation={r.validationResult}
            ruleOrGroup={r.rule}
            schema={r.schema}
          />
        )}
        {r.schema.showLockButtons && (
          <LockRuleActionControlElement
            key={TestID.lockRule}
            testID={TestID.lockRule}
            label={r.translations.lockRule.label}
            title={r.translations.lockRule.title}
            className={r.classNames.lockRule}
            handleOnClick={r.toggleLockRule}
            level={r.path.length}
            path={r.path}
            disabled={r.disabled}
            disabledTranslation={r.parentDisabled ? undefined : r.translations.lockRuleDisabled}
            context={r.context}
            validation={r.validationResult}
            ruleOrGroup={r.rule}
            schema={r.schema}
          />
        )}
        <RemoveRuleActionControlElement
          key={TestID.removeRule}
          testID={TestID.removeRule}
          label={r.translations.removeRule.label}
          title={r.translations.removeRule.title}
          className={r.classNames.removeRule}
          handleOnClick={r.removeRule}
          level={r.path.length}
          path={r.path}
          disabled={r.disabled}
          context={r.context}
          validation={r.validationResult}
          ruleOrGroup={r.rule}
          schema={r.schema}
        />
      </>
    );
  });

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UseRule extends RuleProps {
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
  ) => ValueChangeEventHandler;
  onChangeValueSource: ValueChangeEventHandler;
  onChangeField: ValueChangeEventHandler;
  onChangeOperator: ValueChangeEventHandler;
  onChangeValue: ValueChangeEventHandler;
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
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Prepares all values and methods used by the {@link Rule} component.
 *
 * @group Hooks
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
    groupItems = false,
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

  const getChangeHandler = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prop: Exclude<keyof RuleType, 'id' | 'path'>) => (value: any, context?: any) => {
      if (!disabled) {
        onPropChange(prop, value, path, context);
      }
    },
    [disabled, onPropChange, path]
  );

  const onChangeField = useMemo(() => getChangeHandler('field'), [getChangeHandler]);
  const onChangeOperator = useMemo(() => getChangeHandler('operator'), [getChangeHandler]);
  const onChangeValueSource = useMemo(() => getChangeHandler('valueSource'), [getChangeHandler]);
  const onChangeValue = useMemo(() => getChangeHandler('value'), [getChangeHandler]);

  const cloneRule: ActionElementEventHandler = useCallback(
    (_event, context) => {
      if (!disabled) {
        const newPath = [...getParentPath(path), path.at(-1)! + 1];
        moveRule(path, newPath, true, context);
      }
    },
    [disabled, moveRule, path]
  );

  const toggleLockRule: ActionElementEventHandler = useCallback(
    (_event, context) => onPropChange('disabled', !disabled, path, context),
    [disabled, onPropChange, path]
  );

  const removeRule: ActionElementEventHandler = useCallback(
    (_event, _context) => {
      if (!disabled) {
        onRuleRemove(path);
      }
    },
    [disabled, onRuleRemove, path]
  );

  const shiftRuleUp: ActionElementEventHandler = useCallback(
    (event, context) => {
      if (!disabled && !shiftUpDisabled) {
        moveRule(path, 'up', (event as MouseEvent)?.altKey, context);
      }
    },
    [disabled, moveRule, path, shiftUpDisabled]
  );

  const shiftRuleDown: ActionElementEventHandler = useCallback(
    (event, context) => {
      if (!disabled && !shiftDownDisabled) {
        moveRule(path, 'down', (event as MouseEvent)?.altKey, context);
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
  const values = useMemo(() => {
    const v =
      rule.valueSource === 'field'
        ? filterFieldsByComparator(fieldData, fields, rule.operator)
        : getValues(rule.field, rule.operator, { fieldData });
    return isFlexibleOptionArray(v) || isFlexibleOptionGroupArray(v) ? toFullOptionList(v) : v;
  }, [fieldData, fields, getValues, rule.field, rule.operator, rule.valueSource]);
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
        isOver && groupItems && classNamesProp.dndGroup,
        // standard conditional classes
        suppressStandardClassnames || {
          [standardClassnames.disabled]: disabled,
          [standardClassnames.dndDragging]: isDragging,
          [standardClassnames.dndOver]: isOver,
          [standardClassnames.dndCopy]: isOver && dropEffect === 'copy',
          [standardClassnames.dndGroup]: isOver && groupItems,
        },
        validationClassName
      ),
    [
      classNamesProp.disabled,
      classNamesProp.dndCopy,
      classNamesProp.dndDragging,
      classNamesProp.dndGroup,
      classNamesProp.dndOver,
      classNamesProp.rule,
      disabled,
      dropEffect,
      fieldBasedClassName,
      fieldData,
      getRuleClassname,
      groupItems,
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
    generateOnChangeHandler: getChangeHandler,
    onChangeField,
    onChangeOperator,
    onChangeValueSource,
    onChangeValue,
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
