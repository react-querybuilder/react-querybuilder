<script lang="ts">
  import type { NotToggleProps } from '../types';
  import { clsx } from '@react-querybuilder/core';

  let {
    className,
    handleOnChange,
    label,
    title,
    checked = false,
    disabled = false,
    testID,
    level,
    path,
    ...otherProps
  }: NotToggleProps = $props();

  function onChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (!disabled && handleOnChange) {
      handleOnChange(target.checked);
    }
  }
</script>

<label
  class={clsx(className, { disabled })}
  title={title}
  data-testid={testID}
  data-level={level}
  data-path={JSON.stringify(path)}
>
  <input
    type="checkbox"
    checked={checked}
    disabled={disabled}
    onchange={onChange}
    {...otherProps}
  />
  {label}
</label>
