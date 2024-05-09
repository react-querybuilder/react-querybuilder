import * as React from 'react';
import { TestID } from '../defaults';
import { useRule, useStopEventPropagation } from '../hooks';
import type { RuleProps } from '../types';

/**
 * Default component to display {@link RuleType} objects. This is
 * actually a small wrapper around {@link RuleComponents}.
 */
export const Rule = React.memo((props: RuleProps) => {
  const r = useRule(props);

  r.cloneRule = useStopEventPropagation(r.cloneRule);
  r.toggleLockRule = useStopEventPropagation(r.toggleLockRule);
  r.removeRule = useStopEventPropagation(r.removeRule);
  r.shiftRuleUp = useStopEventPropagation(r.shiftRuleUp);
  r.shiftRuleDown = useStopEventPropagation(r.shiftRuleDown);

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
      <RuleComponents {...r} />
    </div>
  );
});

/**
 * Renders a `React.Fragment` containing an array of form controls for managing
 * a {@link RuleType}.
 */
export const RuleComponents = React.memo((r: RuleProps & ReturnType<typeof useRule>) => {
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
        testID={TestID.fields}
        options={r.schema.fields}
        title={r.translations.fields.title}
        value={r.rule.field}
        operator={r.rule.operator}
        className={r.classNames.fields}
        handleOnChange={r.generateOnChangeHandler('field')}
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
            testID={TestID.operators}
            field={r.rule.field}
            fieldData={r.fieldData}
            title={r.translations.operators.title}
            options={r.operators}
            value={r.rule.operator}
            className={r.classNames.operators}
            handleOnChange={r.generateOnChangeHandler('operator')}
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
                    testID={TestID.valueSourceSelector}
                    field={r.rule.field}
                    fieldData={r.fieldData}
                    title={r.translations.valueSourceSelector.title}
                    options={r.valueSourceOptions}
                    value={r.rule.valueSource ?? 'value'}
                    className={r.classNames.valueSource}
                    handleOnChange={r.generateOnChangeHandler('valueSource')}
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
                  handleOnChange={r.generateOnChangeHandler('value')}
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
