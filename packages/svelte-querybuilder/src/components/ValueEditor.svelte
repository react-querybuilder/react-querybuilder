<script lang="ts">
  import type { ValueEditorProps } from '../types';
  import { clsx, isOptionGroupArray } from '@react-querybuilder/core';

  let {
    className,
    handleOnChange,
    field,
    operator,
    value,
    valueSource,
    fieldData,
    type = 'text',
    inputType,
    values = [],
    disabled = false,
    listsAsArrays = false,
    parseNumbers = false,
    testID,
    level,
    path,
    ...otherProps
  }: ValueEditorProps = $props();

  const isGrouped = $derived(isOptionGroupArray(values));

  function onChange(e: Event) {
    if (disabled) return;

    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

    if (type === 'checkbox') {
      const checkboxTarget = target as HTMLInputElement;
      handleOnChange?.(checkboxTarget.checked);
    } else if (type === 'multiselect') {
      const selectTarget = target as HTMLSelectElement;
      const selected = Array.from(selectTarget.selectedOptions).map(opt => opt.value);
      handleOnChange?.(listsAsArrays ? selected : selected.join(','));
    } else if (type === 'select' || type === 'radio') {
      // oxlint-disable-next-line typescript/no-explicit-any
      let val: any = target.value;
      if (parseNumbers && !Number.isNaN(Number(val))) {
        val = Number.parseFloat(val);
      }
      handleOnChange?.(val);
    } else {
      // oxlint-disable-next-line typescript/no-explicit-any
      let val: any = target.value;
      if (parseNumbers && !Number.isNaN(Number(val)) && val !== '') {
        val = Number.parseFloat(val);
      }
      handleOnChange?.(val);
    }
  }

  const selectedValues = $derived(
    type === 'multiselect' && typeof value === 'string'
      ? value.split(',').map(v => v.trim())
      : type === 'multiselect' && Array.isArray(value)
        ? value
        : []
  );
</script>

{#if type === 'select' || type === 'multiselect'}
  <select
    class={clsx(className, { disabled })}
    value={type === 'select' ? value : undefined}
    multiple={type === 'multiselect'}
    disabled={disabled}
    data-testid={testID}
    data-level={level}
    data-path={JSON.stringify(path)}
    onchange={onChange}
    {...otherProps}
  >
    {#if isGrouped}
      {#each values as group}
        <optgroup label={group.label}>
          {#each group.options as option}
            <option
              value={option.name}
              disabled={option.disabled}
              selected={type === 'multiselect' ? selectedValues.includes(option.name) : undefined}
            >
              {option.label}
            </option>
          {/each}
        </optgroup>
      {/each}
    {:else}
      {#each values as option}
        <option
          value={option.name}
          disabled={option.disabled}
          selected={type === 'multiselect' ? selectedValues.includes(option.name) : undefined}
        >
          {option.label}
        </option>
      {/each}
    {/if}
  </select>
{:else if type === 'textarea'}
  <textarea
    class={clsx(className, { disabled })}
    value={value}
    disabled={disabled}
    data-testid={testID}
    data-level={level}
    data-path={JSON.stringify(path)}
    onchange={onChange}
    oninput={onChange}
    {...otherProps}
  ></textarea>
{:else if type === 'checkbox'}
  <input
    type="checkbox"
    class={clsx(className, { disabled })}
    checked={!!value}
    disabled={disabled}
    data-testid={testID}
    data-level={level}
    data-path={JSON.stringify(path)}
    onchange={onChange}
    {...otherProps}
  />
{:else if type === 'radio'}
  {#if isGrouped}
    {#each values as group}
      <div class="option-group">
        <div class="option-group-label">{group.label}</div>
        {#each group.options as option}
          <label class={clsx(className, 'radio', { disabled })}>
            <input
              type="radio"
              value={option.name}
              checked={value === option.name}
              disabled={disabled || option.disabled}
              data-testid={testID}
              data-level={level}
              data-path={JSON.stringify(path)}
              onchange={onChange}
              {...otherProps}
            />
            {option.label}
          </label>
        {/each}
      </div>
    {/each}
  {:else}
    {#each values as option}
      <label class={clsx(className, 'radio', { disabled })}>
        <input
          type="radio"
          value={option.name}
          checked={value === option.name}
          disabled={disabled || option.disabled}
          data-testid={testID}
          data-level={level}
          data-path={JSON.stringify(path)}
          onchange={onChange}
          {...otherProps}
        />
        {option.label}
      </label>
    {/each}
  {/if}
{:else}
  <input
    type={inputType ?? type}
    class={clsx(className, { disabled })}
    value={value}
    disabled={disabled}
    data-testid={testID}
    data-level={level}
    data-path={JSON.stringify(path)}
    onchange={onChange}
    oninput={onChange}
    {...otherProps}
  />
{/if}
