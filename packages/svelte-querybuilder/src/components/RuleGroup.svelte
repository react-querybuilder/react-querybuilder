<script lang="ts">
  import type { RuleGroupProps } from '../types';
  import { clsx, isRuleGroup } from '@react-querybuilder/core';
  import Rule from './Rule.svelte';
  import Self from './RuleGroup.svelte';

  let {
    ruleGroup,
    path,
    schema,
    actions,
    level = 0,
    disabled = false,
    shiftUpDisabled = false,
    shiftDownDisabled = false,
    context
  }: RuleGroupProps = $props();

  const testID = $derived(`ruleGroup-${path.join('-')}`);
  const isDisabled = $derived(disabled || ruleGroup.disabled);
  const isMuted = $derived(ruleGroup.muted);

  const groupClassName = $derived(
    clsx(
      schema.classNames.ruleGroup,
      isDisabled && schema.classNames.disabled,
      isMuted && schema.classNames.muted
    )
  );

  function handleCombinatorChange(newCombinator: string) {
    actions.onPropChange('combinator', newCombinator, path);
  }

  function handleNotToggleChange(checked: boolean) {
    actions.onPropChange('not', checked, path);
  }

  function handleAddRule() {
    actions.onRuleAdd(path);
  }

  function handleAddGroup() {
    actions.onGroupAdd(path);
  }

  function handleRemove() {
    if (level > 0) {
      actions.onGroupRemove(path);
    }
  }

  function handleClone() {
    const parentPath = path.slice(0, -1);
    const clonedGroup = JSON.parse(JSON.stringify(ruleGroup));
    actions.onGroupAdd(parentPath);
  }

  function handleLock() {
    actions.onPropChange('disabled', !ruleGroup.disabled, path);
  }

  function handleMute() {
    actions.onPropChange('muted', !ruleGroup.muted, path);
  }

  function handleShiftUp() {
    if (level === 0) return;
    const parentPath = path.slice(0, -1);
    const index = path[path.length - 1];
    if (index > 0) {
      const newPath = [...parentPath, index - 1];
      actions.moveRule(path, newPath);
    }
  }

  function handleShiftDown() {
    if (level === 0) return;
    const parentPath = path.slice(0, -1);
    const index = path[path.length - 1];
    const newPath = [...parentPath, index + 1];
    actions.moveRule(path, newPath);
  }

  const CombinatorSelector = $derived(schema.controls.combinatorSelector);
  const NotToggle = $derived(schema.controls.notToggle);
  const ActionElement = $derived(schema.controls.actionElement);
  const ShiftActions = $derived(schema.controls.shiftActions);
</script>

<div
  class={groupClassName}
  data-testid={testID}
  data-level={level}
  data-path={JSON.stringify(path)}
  data-rule-group-id={ruleGroup.id}
>
  <!-- Header -->
  <div class={schema.classNames.header}>
    <div>
      <!-- Combinator Selector -->
      <CombinatorSelector
        options={schema.combinators}
        value={ruleGroup.combinator}
        handleOnChange={handleCombinatorChange}
        disabled={isDisabled}
        className={schema.classNames.combinators}
        testID={`${testID}-combinator`}
        level={level}
        path={path}
        schema={schema}
        context={context}
      />

      <!-- NOT Toggle -->
      {#if schema.showNotToggle}
        <NotToggle
          checked={!!ruleGroup.not}
          handleOnChange={handleNotToggleChange}
          disabled={isDisabled}
          label={schema.translations.notToggle?.label ?? 'NOT'}
          title={schema.translations.notToggle?.title ?? 'Invert this group'}
          className={schema.classNames.notToggle}
          testID={`${testID}-not`}
          level={level}
          path={path}
          schema={schema}
          context={context}
        />
      {/if}

      <!-- Group Actions -->
        <ActionElement
          label={schema.translations.addRule?.label ?? '+ Rule'}
          title={schema.translations.addRule?.title ?? 'Add rule'}
          handleOnClick={handleAddRule}
          disabled={isDisabled}
          className={schema.classNames.addRule}
          testID={`${testID}-addRule`}
          level={level}
          path={path}
          schema={schema}
          context={context}
          ruleOrGroup={ruleGroup}
        />

        <ActionElement
          label={schema.translations.addGroup?.label ?? '+ Group'}
          title={schema.translations.addGroup?.title ?? 'Add group'}
          handleOnClick={handleAddGroup}
          disabled={isDisabled}
          className={schema.classNames.addGroup}
          testID={`${testID}-addGroup`}
          level={level}
          path={path}
          schema={schema}
          context={context}
          ruleOrGroup={ruleGroup}
        />

        {#if schema.showCloneButtons && level > 0}
          <ActionElement
            label={schema.translations.cloneRuleGroup?.label ?? '⧉'}
            title={schema.translations.cloneRuleGroup?.title ?? 'Clone group'}
            handleOnClick={handleClone}
            disabled={isDisabled}
            className={schema.classNames.cloneGroup}
            testID={`${testID}-clone`}
            level={level}
            path={path}
            schema={schema}
            context={context}
            ruleOrGroup={ruleGroup}
          />
        {/if}

        {#if schema.showLockButtons}
          <ActionElement
            label={ruleGroup.disabled ? (schema.translations.lockGroupDisabled?.label ?? '🔒') : (schema.translations.lockGroup?.label ?? '🔓')}
            title={ruleGroup.disabled ? (schema.translations.lockGroupDisabled?.title ?? 'Unlock group') : (schema.translations.lockGroup?.title ?? 'Lock group')}
            handleOnClick={handleLock}
            disabled={false}
            className={schema.classNames.lockGroup}
            testID={`${testID}-lock`}
            level={level}
            path={path}
            schema={schema}
            context={context}
            ruleOrGroup={ruleGroup}
          />
        {/if}

        {#if schema.showMuteButtons}
          <ActionElement
            label={ruleGroup.muted ? (schema.translations.unmuteGroup?.label ?? '🔊') : (schema.translations.muteGroup?.label ?? '🔇')}
            title={ruleGroup.muted ? (schema.translations.unmuteGroup?.title ?? 'Unmute group') : (schema.translations.muteGroup?.title ?? 'Mute group')}
            handleOnClick={handleMute}
            disabled={isDisabled}
            className={schema.classNames.muteGroup}
            testID={`${testID}-mute`}
            level={level}
            path={path}
            schema={schema}
            context={context}
            ruleOrGroup={ruleGroup}
          />
        {/if}

        {#if level > 0}
          <ActionElement
            label={schema.translations.removeGroup?.label ?? '✕'}
            title={schema.translations.removeGroup?.title ?? 'Remove group'}
            handleOnClick={handleRemove}
            disabled={isDisabled}
            className={schema.classNames.removeGroup}
            testID={`${testID}-remove`}
            level={level}
            path={path}
            schema={schema}
            context={context}
            ruleOrGroup={ruleGroup}
          />
        {/if}

        {#if schema.showShiftActions && level > 0}
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
    </div>
  </div>

  <!-- Body -->
  <div class={schema.classNames.body}>
    {#each ruleGroup.rules as ruleOrGroup, index}
      {@const rulePath = [...path, index]}
      {@const childShiftUpDisabled = index === 0}
      {@const childShiftDownDisabled = path.length === 0 && index === ruleGroup.rules.length - 1}
      
      {#if schema.showCombinatorsBetweenRules && index > 0}
        <div class={schema.classNames.betweenRules}>
          <CombinatorSelector
            options={schema.combinators}
            value={ruleGroup.combinator}
            handleOnChange={handleCombinatorChange}
            disabled={isDisabled}
            className={clsx(schema.classNames.combinators, schema.classNames.betweenRules)}
            testID={`${testID}-inlineCombinator-${index}`}
            level={level}
            path={path}
            schema={schema}
            context={context}
          />
        </div>
      {/if}

      {#if isRuleGroup(ruleOrGroup)}
        <Self
          ruleGroup={ruleOrGroup}
          path={rulePath}
          schema={schema}
          actions={actions}
          level={level + 1}
          disabled={isDisabled}
          shiftUpDisabled={childShiftUpDisabled}
          shiftDownDisabled={childShiftDownDisabled}
          context={context}
        />
      {:else}
        <Rule
          rule={ruleOrGroup}
          path={rulePath}
          schema={schema}
          actions={actions}
          level={level + 1}
          disabled={isDisabled}
          shiftUpDisabled={childShiftUpDisabled}
          shiftDownDisabled={childShiftDownDisabled}
          context={context}
        />
      {/if}
    {/each}
  </div>
</div>
