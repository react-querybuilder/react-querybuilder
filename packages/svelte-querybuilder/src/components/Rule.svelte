<script lang="ts">
  import type { RuleProps } from '../types';
  import { clsx, getOption, getFirstOption } from '@react-querybuilder/core';

  let {
    rule,
    path,
    schema,
    actions,
    level = 0,
    disabled = false,
    shiftUpDisabled = false,
    shiftDownDisabled = false,
    context
  }: RuleProps = $props();

  // Get field data
  const fieldData = $derived(
    schema.fields.find(f => f.name === rule.field) ?? schema.fields[0]
  );

  // Get operators for this field
  const operators = $derived(
    fieldData?.operators ?? schema.operators
  );

  // Get operator data
  const operatorData = $derived(
    getOption(operators, rule.operator)
  );

  // Determine value editor type
  const valueEditorType = $derived(
    fieldData?.valueEditorType ?? operatorData?.valueEditorType ?? 'text'
  );

  // Determine input type
  const inputType = $derived(
    fieldData?.inputType ?? operatorData?.inputType ?? 'text'
  );

  // Get values list
  const values = $derived(fieldData?.values ?? []);

  // Generate test IDs
  const testID = $derived(`rule-${path.join('-')}`);

  // Action handlers
  function handleFieldChange(newField: string) {
    actions.onPropChange('field', newField, path);
    
    if (schema.resetOnFieldChange) {
      const newFieldData = schema.fields.find(f => f.name === newField);
      const newOperators = newFieldData?.operators ?? schema.operators;
      const defaultOp = schema.autoSelectOperator 
        ? getFirstOption(newOperators)?.name ?? '='
        : '';
      actions.onPropChange('operator', defaultOp, path);
      actions.onPropChange('value', '', path);
    }
  }

  function handleOperatorChange(newOperator: string) {
    actions.onPropChange('operator', newOperator, path);
    
    if (schema.resetOnOperatorChange) {
      actions.onPropChange('value', '', path);
    }
  }

  function handleValueChange(newValue: unknown) {
    actions.onPropChange('value', newValue, path);
  }

  function handleRemove() {
    actions.onRuleRemove(path);
  }

  function handleClone() {
    const parentPath = path.slice(0, -1);
    const clonedRule = JSON.parse(JSON.stringify(rule));
    actions.onRuleAdd(parentPath, clonedRule);
  }

  function handleLock() {
    actions.onPropChange('disabled', !rule.disabled, path);
  }

  function handleMute() {
    actions.onPropChange('muted', !rule.muted, path);
  }

  function handleShiftUp() {
    const parentPath = path.slice(0, -1);
    const index = path[path.length - 1];
    if (index > 0) {
      const newPath = [...parentPath, index - 1];
      actions.moveRule(path, newPath);
    }
  }

  function handleShiftDown() {
    const parentPath = path.slice(0, -1);
    const index = path[path.length - 1];
    // Note: We'd need parent group context to know max index
    // For now, just attempt the move
    const newPath = [...parentPath, index + 1];
    actions.moveRule(path, newPath);
  }

  const isDisabled = $derived(disabled || rule.disabled);
  const isMuted = $derived(rule.muted);

  const ruleClassName = $derived(
    clsx(
      schema.classNames.rule,
      isDisabled && schema.classNames.disabled,
      isMuted && schema.classNames.muted
    )
  );

  const FieldSelector = $derived(schema.controls.fieldSelector);
  const OperatorSelector = $derived(schema.controls.operatorSelector);
  const ValueEditor = $derived(schema.controls.valueEditor);
  const ActionElement = $derived(schema.controls.actionElement);
  const ShiftActions = $derived(schema.controls.shiftActions);
</script>

<div
  class={ruleClassName}
  data-testid={testID}
  data-level={level}
  data-path={JSON.stringify(path)}
  data-rule-id={rule.id}
>

  {#if schema.showShiftActions}
    <ShiftActions
      shiftUp={handleShiftUp}
      shiftDown={handleShiftDown}
      shiftUpDisabled={shiftUpDisabled}
      shiftDownDisabled={shiftDownDisabled}
      disabled={isDisabled}
      className={schema.classNames.shiftActions}
      testID={`${testID}-shift`}
      level={level}
      path={path}
      schema={schema}
      context={context}
    />
  {/if}

  <FieldSelector
    options={schema.fields}
    value={rule.field}
    handleOnChange={handleFieldChange}
    disabled={isDisabled}
    className={schema.classNames.fields}
    testID={`${testID}-field`}
    level={level}
    path={path}
    schema={schema}
    context={context}
  />

  <OperatorSelector
    options={operators}
    value={rule.operator}
    handleOnChange={handleOperatorChange}
    disabled={isDisabled}
    className={schema.classNames.operators}
    testID={`${testID}-operator`}
    level={level}
    path={path}
    schema={schema}
    context={context}
  />

  <ValueEditor
    field={rule.field}
    operator={rule.operator}
    value={rule.value}
    valueSource={rule.valueSource ?? 'value'}
    fieldData={fieldData}
    type={valueEditorType}
    inputType={inputType}
    values={values}
    handleOnChange={handleValueChange}
    disabled={isDisabled}
    listsAsArrays={schema.listsAsArrays}
    parseNumbers={schema.parseNumbers}
    className={schema.classNames.value}
    testID={`${testID}-value`}
    level={level}
    path={path}
    schema={schema}
    context={context}
  />

    {#if schema.showCloneButtons}
      <ActionElement
        label={schema.translations.cloneRule?.label ?? '⧉'}
        title={schema.translations.cloneRule?.title ?? 'Clone rule'}
        handleOnClick={handleClone}
        disabled={isDisabled}
        className={schema.classNames.cloneRule}
        testID={`${testID}-clone`}
        level={level}
        path={path}
        schema={schema}
        context={context}
        ruleOrGroup={rule}
      />
    {/if}

    {#if schema.showLockButtons}
      <ActionElement
        label={rule.disabled ? (schema.translations.lockRuleDisabled?.label ?? '🔒') : (schema.translations.lockRule?.label ?? '🔓')}
        title={rule.disabled ? (schema.translations.lockRuleDisabled?.title ?? 'Unlock rule') : (schema.translations.lockRule?.title ?? 'Lock rule')}
        handleOnClick={handleLock}
        disabled={false}
        className={schema.classNames.lockRule}
        testID={`${testID}-lock`}
        level={level}
        path={path}
        schema={schema}
        context={context}
        ruleOrGroup={rule}
      />
    {/if}

    {#if schema.showMuteButtons}
      <ActionElement
        label={rule.muted ? (schema.translations.unmuteRule?.label ?? '🔊') : (schema.translations.muteRule?.label ?? '🔇')}
        title={rule.muted ? (schema.translations.unmuteRule?.title ?? 'Unmute rule') : (schema.translations.muteRule?.title ?? 'Mute rule')}
        handleOnClick={handleMute}
        disabled={isDisabled}
        className={schema.classNames.muteRule}
        testID={`${testID}-mute`}
        level={level}
        path={path}
        schema={schema}
        context={context}
        ruleOrGroup={rule}
      />
    {/if}

    <ActionElement
      label={schema.translations.removeRule?.label ?? '✕'}
      title={schema.translations.removeRule?.title ?? 'Remove rule'}
      handleOnClick={handleRemove}
      disabled={isDisabled}
      className={schema.classNames.removeRule}
      testID={`${testID}-remove`}
      level={level}
      path={path}
      schema={schema}
      context={context}
      ruleOrGroup={rule}
    />
</div>
