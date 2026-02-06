<script lang="ts">
  import type { ShiftActionsProps } from '../types';
  import { clsx } from '@react-querybuilder/core';

  let {
    className,
    shiftUp,
    shiftDown,
    shiftUpDisabled = false,
    shiftDownDisabled = false,
    disabled = false,
    labels,
    titles,
    testID,
    level,
    path,
    schema,
    ...otherProps
  }: ShiftActionsProps = $props();

  const shiftUpLabel = $derived(labels?.shiftUp ?? schema?.translations?.shiftActionUp?.label ?? '⬆');
  const shiftDownLabel = $derived(labels?.shiftDown ?? schema?.translations?.shiftActionDown?.label ?? '⬇');
  const shiftUpTitle = $derived(titles?.shiftUp ?? schema?.translations?.shiftActionUp?.title ?? 'Shift up');
  const shiftDownTitle = $derived(titles?.shiftDown ?? schema?.translations?.shiftActionDown?.title ?? 'Shift down');

  function onShiftUp(e: MouseEvent) {
    if (!disabled && !shiftUpDisabled && shiftUp) {
      shiftUp();
    }
  }

  function onShiftDown(e: MouseEvent) {
    if (!disabled && !shiftDownDisabled && shiftDown) {
      shiftDown();
    }
  }
</script>

<div
  class={clsx(className, disabled && schema?.classNames?.disabled)}
  data-testid={testID}
  data-level={level}
  data-path={JSON.stringify(path)}
  {...otherProps}
>
  <button
    type="button"
    class={clsx(schema?.classNames?.shiftActions, (disabled || shiftUpDisabled) && schema?.classNames?.disabled)}
    title={shiftUpTitle}
    disabled={disabled || shiftUpDisabled}
    onclick={onShiftUp}
  >
    {shiftUpLabel}
  </button>
  <button
    type="button"
    class={clsx(schema?.classNames?.shiftActions, (disabled || shiftDownDisabled) && schema?.classNames?.disabled)}
    title={shiftDownTitle}
    disabled={disabled || shiftDownDisabled}
    onclick={onShiftDown}
  >
    {shiftDownLabel}
  </button>
</div>
