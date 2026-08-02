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
  RuleType,
  ValidationResult,
  ValueChangeEventHandler,
  ValueEditorType,
  ValueSourceFullOptions,
  ValueSources,
} from '@react-querybuilder/core';
import {
  deriveRuleClassNames,
  deriveRuleOuterClassName,
  getFieldData,
  getRuleInputType,
  getOption,
  getParametersAsList,
  getRuleValidationResult,
  getRuleValueEditorType,
  getRuleValues,
  getRuleValueSourceOptions,
  hideValueControlsForOperator,
  getParentPath,
  getValidationClassNames,
  isPojo,
  isRuleGroup,
  lc,
  rootPath,
  TestID,
} from '@react-querybuilder/core';
import type { MouseEvent } from 'react';
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import type { UseFields } from '../hooks';
import {
  useDeprecatedProps,
  useFields,
  useReactDndWarning,
  useStopEventPropagation,
} from '../hooks';
import type { RuleProps, ShiftActionsProps, TranslationsFull } from '../types';
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
    const { dndRef } = r;

    const cloneRule = useStopEventPropagation(r.cloneRule);
    const toggleLockRule = useStopEventPropagation(r.toggleLockRule);
    const toggleMuteRule = useStopEventPropagation(r.toggleMuteRule);
    const removeRule = useStopEventPropagation(r.removeRule);
    const shiftRuleUp = useStopEventPropagation(r.shiftRuleUp);
    const shiftRuleDown = useStopEventPropagation(r.shiftRuleDown);

    const actions = useMemo(
      () => ({
        cloneRule,
        toggleLockRule,
        toggleMuteRule,
        removeRule,
        shiftRuleUp,
        shiftRuleDown,
      }),
      [cloneRule, removeRule, shiftRuleDown, shiftRuleUp, toggleLockRule, toggleMuteRule]
    );

    return (
      <div
        ref={dndRef}
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
  groupComponentsWrapper?: React.ComponentType<{
    children: React.ReactNode;
    className: string;
  }>;
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
    dragRef,
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
        muteRuleAction: MuteRuleActionControlElement,
        removeRuleAction: RemoveRuleActionControlElement,
        ruleGroupBodyElements: RuleGroupBodyControlElements,
        ruleGroupHeaderElements: RuleGroupHeaderControlElements,
      },
    },
    groupComponentsWrapper: GroupComponentsWrapper = React.Fragment,
  } = r;

  const commonSubcomponentProps = useMemo(
    () => ({
      level: r.path.length,
      path: r.path,
      disabled: r.disabled,
      context: r.context,
      validation: r.validationResult,
      schema: r.schema,
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

  const shiftTitles = useMemo(
    (): ShiftActionsProps['titles'] =>
      r.schema.showShiftActions
        ? {
            shiftUp: r.translations.shiftActionUp.title,
            shiftDown: r.translations.shiftActionDown.title,
          }
        : undefined,
    [r.schema.showShiftActions, r.translations]
  );
  const shiftLabels = useMemo(
    (): ShiftActionsProps['labels'] =>
      r.schema.showShiftActions
        ? {
            shiftUp: r.translations.shiftActionUp.label,
            shiftDown: r.translations.shiftActionDown.label,
          }
        : undefined,
    [r.schema.showShiftActions, r.translations]
  );

  return (
    <React.Fragment>
      {r.schema.showShiftActions && (
        <ShiftActionsControlElement
          key={TestID.shiftActions}
          {...commonSubcomponentProps}
          testID={TestID.shiftActions}
          titles={shiftTitles}
          labels={shiftLabels}
          className={r.classNames.shiftActions}
          ruleOrGroup={r.rule}
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
          ref={dragRef}
          title={r.translations.dragHandle.title}
          label={r.translations.dragHandle.label}
          className={r.classNames.dragHandle}
          dragHandleAttributes={r.dragHandleAttributes}
          ruleOrGroup={r.rule}
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
      {(r.schema.autoSelectField || r.rule.field !== r.translations.fields.placeholderName) &&
        (r.subQuery ? (
          <MatchModeEditorControlElement
            key={TestID.matchModeEditor}
            {...commonSubcomponentProps}
            testID={TestID.matchModeEditor}
            field={r.rule.field}
            fieldData={r.fieldData}
            title={r.translations.matchMode.title}
            options={r.matchModes}
            thresholdPlaceholder={r.translations.matchThreshold.placeholderName}
            // TODO: Support `defaultMatchMode` at query or field level?
            match={
              r.rule.match ?? /* v8 ignore start -- @preserve */ defaultMatch
            } /* v8 ignore stop -- @preserve */
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
                  {!['null', 'notnull'].includes(lc(`${r.rule.operator}`)) &&
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
        ))}
      {r.subQuery && (
        <GroupComponentsWrapper className={r.subQuery.classNames.header}>
          <RuleGroupHeaderControlElements {...r.subQuery} />
        </GroupComponentsWrapper>
      )}
      {r.schema.showCloneButtons && (
        <CloneRuleActionControlElement
          key={TestID.cloneRule}
          {...commonSubcomponentProps}
          testID={TestID.cloneRule}
          label={r.translations.cloneRule.label}
          title={r.translations.cloneRule.title}
          className={r.classNames.cloneRule}
          ruleOrGroup={r.rule}
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
          ruleOrGroup={r.rule}
          handleOnClick={r.toggleLockRule}
          disabledTranslation={r.parentDisabled ? undefined : r.translations.lockRuleDisabled}
        />
      )}
      {r.schema.showMuteButtons && (
        <MuteRuleActionControlElement
          key={TestID.muteRule}
          {...commonSubcomponentProps}
          testID={TestID.muteRule}
          label={r.rule.muted ? r.translations.unmuteRule.label : r.translations.muteRule.label}
          title={r.rule.muted ? r.translations.unmuteRule.title : r.translations.muteRule.title}
          className={r.classNames.muteRule}
          ruleOrGroup={r.rule}
          handleOnClick={r.toggleMuteRule}
        />
      )}
      <RemoveRuleActionControlElement
        key={TestID.removeRule}
        {...commonSubcomponentProps}
        testID={TestID.removeRule}
        label={r.translations.removeRule.label}
        title={r.translations.removeRule.title}
        className={r.classNames.removeRule}
        ruleOrGroup={r.rule}
        handleOnClick={r.removeRule}
      />
      {r.subQuery && (
        <GroupComponentsWrapper className={r.subQuery.classNames.body}>
          <RuleGroupBodyControlElements {...r.subQuery} />
        </GroupComponentsWrapper>
      )}
    </React.Fragment>
  );
});

/**
 * @group Components
 */
export const RuleWithSubQueryGroupComponentsWrapper = (
  props: React.PropsWithChildren
): React.JSX.Element => <div {...props} />;

/**
 * @group Components
 */
export const RuleComponentsWithSubQuery: React.MemoExoticComponent<
  (r: RuleComponentsProps) => React.JSX.Element
> = React.memo(function RuleComponentsWithSubQuery(r: RuleComponentsProps) {
  const initialQuery = useMemo(() => r.schema.createRuleGroup() as RuleGroupType, [r.schema]);
  const subQB = useQueryBuilder({
    ...r.subQueryBuilderProps,
    enableDragAndDrop: false,
    disabled: r.disabled,
    fields: r.subproperties.fields,
    // Update the value on first render if the value is not a valid rule group
    enableMountQueryChange: !isRuleGroup(r.rule.value) || !r.rule.value.id,
    query: isRuleGroup(r.rule.value) ? (r.rule.value as RuleGroupType) : initialQuery,
    onQueryChange: r.onChangeValue,
  });
  const subQuery = useRuleGroup({
    ...subQB,
    ruleGroup: subQB.rootGroup,
    path: rootPath,
    disabled: r.disabled,
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
  const memoizedSubQuery = useMemo(
    () => ({
      ...subQuery,
      addGroup,
      addRule,
      cloneGroup,
      removeGroup,
      shiftGroupDown,
      shiftGroupUp,
      toggleLockGroup,
    }),
    [
      addGroup,
      addRule,
      cloneGroup,
      removeGroup,
      shiftGroupDown,
      shiftGroupUp,
      subQuery,
      toggleLockGroup,
    ]
  );

  return (
    <RuleComponents
      {...r}
      groupComponentsWrapper={r.groupComponentsWrapper ?? RuleWithSubQueryGroupComponentsWrapper}
      subQuery={memoizedSubQuery}
    />
  );
});

/* oxlint-disable typescript/no-explicit-any */
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
    muteRule: string;
    removeRule: string;
  };
  muted?: boolean;
  parentMuted?: boolean;
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
  toggleMuteRule: ActionElementEventHandler;
  validationResult: boolean | ValidationResult;
  valueEditorSeparator: React.ReactNode;
  valueEditorType: ValueEditorType;
  values: FlexibleOptionList<Option>;
  valueSourceOptions: ValueSourceFullOptions;
  valueSources: ValueSources;
}
/* oxlint-enable typescript/no-explicit-any */

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
      getParameters,
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
    parentMuted,
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
    dropNotAllowed = false,
  } = props;

  useDeprecatedProps('rule', !ruleProp);

  useReactDndWarning(enableDragAndDrop, !!(dragMonitorId || dropMonitorId || dndRef || dragRef));

  const disabled = !!parentDisabled || !!disabledProp;
  const muted = !!parentMuted || !!ruleProp?.muted;

  const rule = useMemo(
    () =>
      ruleProp ?? {
        id,
        field: fieldProp ?? /* v8 ignore start -- @preserve */ '' /* v8 ignore stop -- @preserve */,
        operator:
          operatorProp ?? /* v8 ignore start -- @preserve */ '' /* v8 ignore stop -- @preserve */,
        value: valueProp,
        valueSource: valueSourceProp,
      },
    [fieldProp, id, operatorProp, ruleProp, valueProp, valueSourceProp]
  );

  const classNames = useMemo(
    () => deriveRuleClassNames({ classNames: classNamesProp, suppressStandardClassnames }),
    [classNamesProp, suppressStandardClassnames]
  );

  const getChangeHandler = useCallback(
    // oxlint-disable-next-line typescript/no-explicit-any
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

  const toggleMuteRule: ActionElementEventHandler = useCallback(
    (_event, context) => onPropChange('muted', !rule.muted, path, context),
    [rule.muted, onPropChange, path]
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
    () => getFieldData(rule.field, fieldMap),
    [fieldMap, rule.field]
  );
  const inputType = useMemo(
    () => getRuleInputType(rule.field, rule.operator, fieldData, getInputType),
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
  const hideValueControls = hideValueControlsForOperator(operatorObject);
  const valueSourceOptions = useMemo(
    () =>
      getRuleValueSourceOptions(
        { field: rule.field, operator: rule.operator, valueSource: rule.valueSource },
        fieldData,
        getValueSources
      ),
    [fieldData, getValueSources, rule.field, rule.operator, rule.valueSource]
  );
  const valueSources = useMemo(
    () => valueSourceOptions.map(({ value }) => value) as ValueSources,
    [valueSourceOptions]
  );
  const parameters = useMemo(
    () => getParameters(rule.field, rule.operator, { fieldData }),
    [fieldData, getParameters, rule.field, rule.operator]
  );
  const parametersAsList = useMemo(() => getParametersAsList(parameters), [parameters]);
  const valueEditorType = useMemo(
    () =>
      getRuleValueEditorType(
        { field: rule.field, operator: rule.operator, valueSource: rule.valueSource },
        fieldData,
        parametersAsList,
        getValueEditorType
      ),
    [fieldData, getValueEditorType, parametersAsList, rule.field, rule.operator, rule.valueSource]
  );
  const valueEditorSeparator = useMemo(
    () => getValueEditorSeparator(rule.field, rule.operator, { fieldData }),
    [fieldData, getValueEditorSeparator, rule.field, rule.operator]
  );
  const values = useMemo(
    () =>
      getRuleValues(
        { field: rule.field, operator: rule.operator, valueSource: rule.valueSource },
        fieldData,
        fields,
        parametersAsList,
        getValues
      ),
    [fieldData, fields, getValues, parametersAsList, rule.field, rule.operator, rule.valueSource]
  );
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
      getRuleValidationResult(
        rule,
        fieldData,
        validationMap,
        id ?? /* v8 ignore start -- @preserve */ '' /* v8 ignore stop -- @preserve */
      ),
    [fieldData, id, rule, validationMap]
  );
  const validationClassName = useMemo(
    () => getValidationClassNames(validationResult),
    [validationResult]
  );
  const fieldBasedClassName = fieldData?.className ?? '';
  const operatorBasedClassName = operatorObject?.className ?? '';
  const hasSubQuery = matchModes.length > 0;

  const outerClassName = useMemo(
    () =>
      deriveRuleOuterClassName({
        classNames: classNamesProp,
        suppressStandardClassnames,
        leadingClassNames: [
          getRuleClassname(rule, { fieldData }),
          fieldBasedClassName,
          operatorBasedClassName,
        ],
        disabled,
        muted,
        isDragging,
        isOver,
        dropEffect,
        groupItems,
        dropNotAllowed,
        hasSubQuery,
        validationClassName,
      }),
    [
      classNamesProp,
      disabled,
      dropEffect,
      dropNotAllowed,
      muted,
      fieldBasedClassName,
      fieldData,
      getRuleClassname,
      groupItems,
      hasSubQuery,
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
    muted,
    operators,
    outerClassName,
    removeRule,
    rule,
    shiftRuleUp,
    shiftRuleDown,
    subproperties,
    subQueryBuilderProps,
    toggleLockRule,
    toggleMuteRule,
    validationResult,
    valueEditorSeparator,
    valueEditorType,
    values,
    valueSourceOptions,
    valueSources,
  };
};
