import * as React from 'react';
import type { ValueSelectorProps } from 'react-querybuilder';
import { useSelectElementChangeHandler, useValueSelector } from 'react-querybuilder';
import { toOptions } from './utils';

export const BulmaValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title,
  disabled,
  multiple,
  listsAsArrays,
}: ValueSelectorProps) => {
  const { onChange, val } = useValueSelector({ handleOnChange, listsAsArrays, multiple, value });

  const selectElementChangeHandler = useSelectElementChangeHandler({ multiple, onChange });

  return (
    <div title={title} className={`${className} select${multiple ? ' is-multiple' : ''}`}>
      <select
        value={val}
        multiple={multiple}
        disabled={disabled}
        onChange={selectElementChangeHandler}>
        {toOptions(options)}
      </select>
    </div>
  );
};

BulmaValueSelector.displayName = 'BulmaValueSelector';
