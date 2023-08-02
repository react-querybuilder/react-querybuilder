import * as React from 'react';
import { useSelectElementChangeHandler, useValueSelector } from '../hooks';
import type { ValueSelectorProps } from '../types';
import { toOptions } from '../utils';

/**
 * Default `<select>` component used by {@link QueryBuilder}.
 */
export const ValueSelector = ({
  className,
  handleOnChange,
  options,
  title,
  value,
  multiple,
  listsAsArrays,
  disabled,
  testID,
}: ValueSelectorProps) => {
  const { onChange, val } = useValueSelector({ handleOnChange, listsAsArrays, multiple, value });

  const selectElementChangeHandler = useSelectElementChangeHandler({ multiple, onChange });

  return (
    <select
      data-testid={testID}
      className={className}
      value={val}
      title={title}
      disabled={disabled}
      multiple={!!multiple}
      onChange={selectElementChangeHandler}>
      {toOptions(options)}
    </select>
  );
};

ValueSelector.displayName = 'ValueSelector';
