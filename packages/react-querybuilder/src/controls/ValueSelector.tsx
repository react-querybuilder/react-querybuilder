import { useMemo, type ChangeEvent } from 'react';
import type { ValueSelectorProps } from '../types';
import { toArray, toOptions } from '../utils';

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
  const onChange = useMemo(
    () =>
      multiple
        ? (e: ChangeEvent<HTMLSelectElement>) => {
            const valArray = Array.from(e.target.selectedOptions).map(o => o.value);
            handleOnChange(listsAsArrays ? valArray : valArray.join(','));
          }
        : (e: ChangeEvent<HTMLSelectElement>) => handleOnChange(e.target.value),
    [handleOnChange, listsAsArrays, multiple]
  );

  return (
    <select
      data-testid={testID}
      className={className}
      value={multiple ? toArray(value) : value}
      title={title}
      disabled={disabled}
      multiple={!!multiple}
      onChange={onChange}>
      {toOptions(options)}
    </select>
  );
};

ValueSelector.displayName = 'ValueSelector';
