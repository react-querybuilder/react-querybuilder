import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { TestID, useRule } from 'react-querybuilder';
import type { RuleNativeProps, RuleStyles, RuleStyleSheets } from './types';

const baseStyles: RuleStyles = {
  rule: {
    flexDirection: 'row',
    paddingBottom: 10,
  },
  fieldSelector: {
    height: 30,
    width: 100,
  },
  fieldOption: {},
  operatorSelector: {
    height: 30,
    width: 100,
  },
  operatorOption: {},
  value: {
    borderWidth: 1,
    height: 30,
    minWidth: 100,
  },
};

export const RuleNative = (props: RuleNativeProps) => {
  const r = { ...props, ...useRule(props) };

  const {
    schema: {
      controls: {
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

  const styles = useMemo(
    (): RuleStyleSheets => ({
      rule: StyleSheet.flatten([baseStyles.rule, props.styles?.rule]),
      fieldSelector: StyleSheet.flatten([baseStyles.fieldSelector, props.styles?.fieldSelector]),
      fieldOption: StyleSheet.flatten([baseStyles.fieldOption, props.styles?.fieldOption]),
      operatorSelector: StyleSheet.flatten([
        baseStyles.operatorSelector,
        props.styles?.operatorSelector,
      ]),
      operatorOption: StyleSheet.flatten([baseStyles.operatorOption, props.styles?.operatorOption]),
      valueSourceSelector: StyleSheet.flatten([
        baseStyles.operatorSelector,
        props.styles?.operatorSelector,
      ]),
      valueSourceOption: StyleSheet.flatten([
        baseStyles.operatorOption,
        props.styles?.operatorOption,
      ]),
      value: StyleSheet.flatten([baseStyles.value, props.styles?.value]),
    }),
    [props.styles]
  );

  return (
    <View style={styles.rule}>
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
          handleOnClick={r.cloneRule}
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
          handleOnClick={r.toggleLockRule}
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
        handleOnClick={r.removeRule}
        level={r.path.length}
        path={r.path}
        disabled={r.disabled}
        context={r.context}
        validation={r.validationResult}
        ruleOrGroup={r.rule}
      />
    </View>
  );
};
