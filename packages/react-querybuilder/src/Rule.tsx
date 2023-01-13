import type { RuleProps } from '@react-querybuilder/ts';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { TestID } from './defaults';
import { useRule } from './hooks';

export const Rule = (props: RuleProps) => {
  const r = { ...props, ...useRule(props) };

  const {
    schema: {
      controls: {
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

  const cloneRule = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    r.cloneRule();
  };

  const toggleLockRule = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    r.toggleLockRule();
  };

  const removeRule = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    r.removeRule();
  };

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
      />
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
          handleOnClick={cloneRule}
          level={r.path.length}
          path={r.path}
          disabled={r.disabled}
          context={r.context}
          validation={r.validationResult}
          ruleOrGroup={r.rule}
        />
      )}
      {r.schema.showLockButtons && (
        <LockRuleActionControlElement
          testID={TestID.lockRule}
          label={r.translations.lockRule.label}
          title={r.translations.lockRule.title}
          className={r.classNames.lockRule}
          handleOnClick={toggleLockRule}
          level={r.path.length}
          path={r.path}
          disabled={r.disabled}
          disabledTranslation={r.parentDisabled ? undefined : r.translations.lockRuleDisabled}
          context={r.context}
          validation={r.validationResult}
          ruleOrGroup={r.rule}
        />
      )}
      <RemoveRuleActionControlElement
        testID={TestID.removeRule}
        label={r.translations.removeRule.label}
        title={r.translations.removeRule.title}
        className={r.classNames.removeRule}
        handleOnClick={removeRule}
        level={r.path.length}
        path={r.path}
        disabled={r.disabled}
        context={r.context}
        validation={r.validationResult}
        ruleOrGroup={r.rule}
      />
    </div>
  );
};

Rule.displayName = 'Rule';
