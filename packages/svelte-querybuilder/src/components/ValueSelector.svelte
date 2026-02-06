<script lang="ts">
  import type { ValueSelectorProps } from '../types';
  import { clsx, isOptionGroupArray } from '@react-querybuilder/core';

  let {
    className,
    handleOnChange,
    options,
    value,
    title,
    disabled = false,
    multiple = false,
    listsAsArrays = false,
    testID,
    level,
    path,
    ...otherProps
  }: ValueSelectorProps = $props();

  const isGrouped = $derived(isOptionGroupArray(options));

  function onChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    if (!disabled && handleOnChange) {
      if (multiple) {
        const selected = Array.from(target.selectedOptions).map(opt => opt.value);
        handleOnChange(listsAsArrays ? selected : selected.join(','));
      } else {
        handleOnChange(target.value);
      }
    }
  }

  // Compute selected values for multiselect
  const selectedValues = $derived(
    multiple && typeof value === 'string' 
      ? value.split(',').map(v => v.trim()) 
      : multiple && Array.isArray(value)
        ? value
        : []
  );
</script>

<select
  class={clsx(className, { disabled })}
  title={title}
  disabled={disabled}
  multiple={multiple}
  data-testid={testID}
  data-level={level}
  data-path={JSON.stringify(path)}
  onchange={onChange}
  {...otherProps}
>
  {#if isGrouped}
    {#each options as group}
      <optgroup label={group.label}>
        {#each group.options as option}
          <option
            value={option.name}
            disabled={option.disabled}
            selected={multiple ? selectedValues.includes(option.name) : value === option.name}
          >
            {option.label}
          </option>
        {/each}
      </optgroup>
    {/each}
  {:else}
    {#each options as option}
      <option
        value={option.name}
        disabled={option.disabled}
        selected={multiple ? selectedValues.includes(option.name) : value === option.name}
      >
        {option.label}
      </option>
    {/each}
  {/if}
</select>
