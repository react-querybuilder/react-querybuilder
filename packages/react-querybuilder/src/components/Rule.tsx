import type { MouseEvent } from 'react';
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { rootPath, standardClassnames, TestID } from '../defaults';
import type { UseFields } from '../hooks';
import { useFields } from '../hooks';
import { useDeprecatedProps } from '../hooks/useDeprecatedProps';
import { useReactDndWarning } from '../hooks/useReactDndWarning';
import { useStopEventPropagation } from '../hooks/useStopEventPropagation';
import type {
  ActionElementEventHandler,
  FlexibleOptionList,
  FullField,
  FullOperator,
  FullOption,
  InputType,
  MatchModeOptions,
  Option,
  OptionList,
  RuleGroupType,
  RuleProps,
  RuleType,
  TranslationsFull,
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
  isPojo,
  isRuleGroup,
  toFullOptionList,
} from '../utils';
import { clsx } from '../utils/clsx';
import { useQueryBuilder } from './QueryBuilder.useQueryBuilder';
import type { UseRuleGroup } from './RuleGroup';
import { useRuleGroup } from './RuleGroup';

const defaultMatch = { mode: 'all' } as const;

const defaultSubproperties: FullOption[] = [{ name: '', value: '', label: '' }];

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

    const actions = useMemo(
      () => ({
        cloneRule,
        toggleLockRule,
        removeRule,
        shiftRuleUp,
        shiftRuleDown,
      }),
      [cloneRule, removeRule, shiftRuleDown, shiftRuleUp, toggleLockRule]
    );

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
        {r.matchModes.length > 0 ? (
          <RuleComponentsWithSubQuery {...r} {...actions} />
        ) : (
          <RuleComponents {...r} {...actions} />
        )}
      </div>
    );
  }
);

interface RuleComponentsProps extends UseRule {
  subQuery?: UseRuleGroup;
}

/**
 * Renders a `React.Fragment` containing an array of form controls for managing a {@link RuleType}.
 *
 * @group Components
 */
export const RuleComponents: React.MemoExoticComponent<
  (r: RuleComponentsProps) => React.JSX.Element
> = React.memo(function RuleComponents(r: RuleComponentsProps) {
  const {
    schema: {
      controls: {
        shiftActions: ShiftActionsControlElement,
        dragHandle: DragHandleControlElement,
        fieldSelector: FieldSelectorControlElement,
        matchModeEditor: MatchModeEditorControlElement,
        operatorSelector: OperatorSelectorControlElement,
        valueSourceSelector: ValueSourceSelectorControlElement,
        valueEditor: ValueEditorControlElement,
        cloneRuleAction: CloneRuleActionControlElement,
        lockRuleAction: LockRuleActionControlElement,
        removeRuleAction: RemoveRuleActionControlElement,
        ruleGroupBodyElements: RuleGroupBodyControlElements,
        ruleGroupHeaderElements: RuleGroupHeaderControlElements,
      },
    },
  } = r;

  const commonSubcomponentProps = useMemo(
    () => ({
      level: r.path.length,
      path: r.path,
      disabled: r.disabled,
      context: r.context,
      validation: r.validationResult,
      schema: r.schema,
      ruleOrGroup: r.rule,
      rule: r.rule,
    }),
    [r.path, r.disabled, r.context, r.validationResult, r.schema, r.rule]
  );

  const showFieldSelector = useMemo(
    () =>
      !(
        r.schema.fields.length === 1 &&
        isPojo(r.schema.fields[0]) &&
        'value' in r.schema.fields[0] &&
        r.schema.fields[0].value === ''
      ),
    [r.schema.fields]
  );

  return (
    <React.Fragment>
      {r.schema.showShiftActions && (
        <ShiftActionsControlElement
          key={TestID.shiftActions}
          {...commonSubcomponentProps}
          testID={TestID.shiftActions}
          titles={{
            shiftUp: r.translations.shiftActionUp.title,
            shiftDown: r.translations.shiftActionDown.title,
          }}
          labels={{
            shiftUp: r.translations.shiftActionUp.label,
            shiftDown: r.translations.shiftActionDown.label,
          }}
          className={r.classNames.shiftActions}
          shiftUp={r.shiftRuleUp}
          shiftDown={r.shiftRuleDown}
          shiftUpDisabled={r.shiftUpDisabled}
          shiftDownDisabled={r.shiftDownDisabled}
        />
      )}
      {r.schema.enableDragAndDrop && (
        <DragHandleControlElement
          key={TestID.dragHandle}
          {...commonSubcomponentProps}
          testID={TestID.dragHandle}
          ref={r.dragRef}
          title={r.translations.dragHandle.title}
          label={r.translations.dragHandle.label}
          className={r.classNames.dragHandle}
        />
      )}
      {showFieldSelector && (
        <FieldSelectorControlElement
          key={TestID.fields}
          {...commonSubcomponentProps}
          testID={TestID.fields}
          options={r.schema.fields}
          title={r.translations.fields.title}
          value={r.rule.field}
          operator={r.rule.operator}
          className={r.classNames.fields}
          handleOnChange={r.onChangeField}
        />
      )}
      {(r.schema.autoSelectField || r.rule.field !== r.translations.fields.placeholderName) && (
        <React.Fragment>
          {r.subQuery ? (
            <MatchModeEditorControlElement
              key={TestID.matchModeEditor}
              {...commonSubcomponentProps}
              testID={TestID.matchModeEditor}
              field={r.rule.field}
              fieldData={r.fieldData}
              title={r.translations.matchMode.title}
              options={r.matchModes}
              // TODO: Support `defaultMatchMode` at query or field level?
              match={r.rule.match ?? defaultMatch}
              className={r.classNames.matchMode}
              classNames={r.classNames}
              handleOnChange={r.onChangeMatchMode}
            />
          ) : (
            <React.Fragment>
              <OperatorSelectorControlElement
                key={TestID.operators}
                {...commonSubcomponentProps}
                testID={TestID.operators}
                field={r.rule.field}
                fieldData={r.fieldData}
                title={r.translations.operators.title}
                options={r.operators}
                value={r.rule.operator}
                className={r.classNames.operators}
                handleOnChange={r.onChangeOperator}
              />
              {(r.schema.autoSelectOperator ||
                r.rule.operator !== r.translations.operators.placeholderName) &&
                !r.hideValueControls && (
                  <React.Fragment>
                    {!['null', 'notnull'].includes(`${r.rule.operator}`.toLowerCase()) &&
                      r.valueSources.length > 1 && (
                        <ValueSourceSelectorControlElement
                          key={TestID.valueSourceSelector}
                          {...commonSubcomponentProps}
                          testID={TestID.valueSourceSelector}
                          field={r.rule.field}
                          fieldData={r.fieldData}
                          title={r.translations.valueSourceSelector.title}
                          options={r.valueSourceOptions}
                          value={r.rule.valueSource ?? 'value'}
                          className={r.classNames.valueSource}
                          handleOnChange={r.onChangeValueSource}
                        />
                      )}
                    <ValueEditorControlElement
                      key={TestID.valueEditor}
                      {...commonSubcomponentProps}
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
                    />
                  </React.Fragment>
                )}
            </React.Fragment>
          )}
        </React.Fragment>
      )}
      {r.schema.showCloneButtons && (
        <CloneRuleActionControlElement
          key={TestID.cloneRule}
          {...commonSubcomponentProps}
          testID={TestID.cloneRule}
          label={r.translations.cloneRule.label}
          title={r.translations.cloneRule.title}
          className={r.classNames.cloneRule}
          handleOnClick={r.cloneRule}
        />
      )}
      {r.schema.showLockButtons && (
        <LockRuleActionControlElement
          key={TestID.lockRule}
          {...commonSubcomponentProps}
          testID={TestID.lockRule}
          label={r.translations.lockRule.label}
          title={r.translations.lockRule.title}
          className={r.classNames.lockRule}
          handleOnClick={r.toggleLockRule}
          disabledTranslation={r.parentDisabled ? undefined : r.translations.lockRuleDisabled}
        />
      )}
      {r.subQuery && (
        <div className={r.subQuery.classNames.header}>
          <RuleGroupHeaderControlElements {...r.subQuery} />
        </div>
      )}
      <RemoveRuleActionControlElement
        key={TestID.removeRule}
        {...commonSubcomponentProps}
        testID={TestID.removeRule}
        label={r.translations.removeRule.label}
        title={r.translations.removeRule.title}
        className={r.classNames.removeRule}
        handleOnClick={r.removeRule}
      />
      {r.subQuery && (
        <div className={r.subQuery.classNames.body}>
          <RuleGroupBodyControlElements {...r.subQuery} />
        </div>
      )}
    </React.Fragment>
  );
});

const RuleComponentsWithSubQuery: React.MemoExoticComponent<
  (r: RuleComponentsProps) => React.JSX.Element
> = React.memo(function RuleComponentsWithSubQuery(r: RuleComponentsProps) {
  const subQB = useQueryBuilder({
    ...r.subQueryBuilderProps,
    enableDragAndDrop: false,
    fields: r.subproperties.fields,
    // Update the value on first render if the value is not a valid rule group
    enableMountQueryChange: !isRuleGroup(r.rule.value) || !r.rule.value.id,
    query: isRuleGroup(r.rule.value)
      ? (r.rule.value as RuleGroupType)
      : (r.schema.createRuleGroup(r.schema.independentCombinators) as RuleGroupType),
    onQueryChange: (q: RuleGroupType) => r.onChangeValue(q),
  });
  const subQuery = useRuleGroup({
    ...subQB,
    ruleGroup: subQB.rootGroup,
    path: rootPath,
    parentDisabled: subQB.queryDisabled,
    id: subQB.rootGroup.id,
    shiftUpDisabled: true,
    shiftDownDisabled: true,
  });
  const addRule = useStopEventPropagation(subQuery.addRule);
  const addGroup = useStopEventPropagation(subQuery.addGroup);
  const cloneGroup = useStopEventPropagation(subQuery.cloneGroup);
  const toggleLockGroup = useStopEventPropagation(subQuery.toggleLockGroup);
  const removeGroup = useStopEventPropagation(subQuery.removeGroup);
  const shiftGroupUp = useStopEventPropagation(subQuery.shiftGroupUp);
  const shiftGroupDown = useStopEventPropagation(subQuery.shiftGroupDown);

  return (
    <RuleComponents
      {...r}
      subQuery={{
        ...subQuery,
        addRule,
        addGroup,
        cloneGroup,
        toggleLockGroup,
        removeGroup,
        shiftGroupUp,
        shiftGroupDown,
      }}
    />
  );
});

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UseRule extends RuleProps {
  classNames: {
    shiftActions: string;
    dragHandle: string;
    fields: string;
    matchMode: string;
    matchThreshold: string;
    operators: string;
    valueSource: string;
    value: string;
    cloneRule: string;
    lockRule: string;
    removeRule: string;
  };
  cloneRule: ActionElementEventHandler;
  fieldData: FullField<string, string, string, FullOption, FullOption>;
  generateOnChangeHandler: (
    prop: Exclude<keyof RuleType, 'id' | 'path'>
  ) => ValueChangeEventHandler;
  onChangeValueSource: ValueChangeEventHandler;
  onChangeField: ValueChangeEventHandler;
  onChangeMatchMode: ValueChangeEventHandler;
  onChangeOperator: ValueChangeEventHandler;
  onChangeValue: ValueChangeEventHandler;
  hideValueControls: boolean;
  inputType: InputType | null;
  matchModes: MatchModeOptions;
  operators: OptionList<FullOperator>;
  outerClassName: string;
  removeRule: ActionElementEventHandler;
  shiftRuleUp: (event?: MouseEvent, _context?: any) => void;
  shiftRuleDown: (event?: MouseEvent, _context?: any) => void;
  subproperties: UseFields<FullField>;
  subQueryBuilderProps: Record<string, unknown>;
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
      getMatchModes,
      getOperators,
      getSubQueryBuilderProps,
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
      matchMode: clsx(
        suppressStandardClassnames || standardClassnames.matchMode,
        classNamesProp.valueSelector,
        classNamesProp.matchMode
      ),
      matchThreshold: clsx(
        suppressStandardClassnames || standardClassnames.matchThreshold,
        classNamesProp.valueSelector,
        classNamesProp.matchThreshold
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
      classNamesProp.matchMode,
      classNamesProp.matchThreshold,
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
  const onChangeMatchMode = useMemo(() => getChangeHandler('match'), [getChangeHandler]);
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
  const matchModes = useMemo(
    () => getMatchModes(rule.field, { fieldData }),
    [fieldData, getMatchModes, rule.field]
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
  const valueSourceOptions = useMemo(
    () => valueSources.map(vs => ({ name: vs, value: vs, label: vs })) as ValueSourceOptions,
    [valueSources]
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
  const subQueryBuilderProps = useMemo(
    () => getSubQueryBuilderProps(rule.field, { fieldData }) as Record<string, unknown>,
    [fieldData, getSubQueryBuilderProps, rule.field]
  );
  const subproperties = useFields({
    translations: props.translations as TranslationsFull,
    fields: fieldData.subproperties ?? subQueryBuilderProps.fields ?? defaultSubproperties,
    autoSelectField: props.schema.autoSelectField || !!fieldData.subproperties,
  });

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
    onChangeMatchMode,
    onChangeOperator,
    onChangeValueSource,
    onChangeValue,
    hideValueControls,
    inputType,
    matchModes,
    operators,
    outerClassName,
    removeRule,
    rule,
    shiftRuleUp,
    shiftRuleDown,
    subproperties,
    subQueryBuilderProps,
    toggleLockRule,
    validationResult,
    valueEditorSeparator,
    valueEditorType,
    values,
    valueSourceOptions,
    valueSources,
  };
};
