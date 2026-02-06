<script lang="ts">
  import type { ActionElementProps } from '../types';
  import { clsx } from '@react-querybuilder/core';

  let {
    className,
    handleOnClick,
    label,
    title,
    disabled = false,
    testID,
    level,
    path,
    ...otherProps
  }: ActionElementProps = $props();

  function onClick(e: MouseEvent) {
    if (!disabled && handleOnClick) {
      handleOnClick(e);
    }
  }
</script>

<button
  type="button"
  class={clsx(className, { disabled })}
  title={title}
  disabled={disabled}
  data-testid={testID}
  data-level={level}
  data-path={JSON.stringify(path)}
  onclick={onClick}
  {...otherProps}
>
  {label}
</button>
