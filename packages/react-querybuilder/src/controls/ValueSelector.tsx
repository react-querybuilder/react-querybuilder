import { useMemo, type ChangeEvent } from 'react';
import type { ValueSelectorProps } from '../types';
import { toOptions } from '../utils';

export const ValueSelector = ({
  className,
  handleOnChange,
  options,
  title,
  value,
  multiple,
  disabled,
  testID,
}: ValueSelectorProps) => {
  const onChange = useMemo(() => {
    if (multiple) {
      return (e: ChangeEvent<HTMLSelectElement>) =>
        handleOnChange(
          [...e.target.options]
            .filter(o => o.selected)
            .map(o => o.value)
            .join(',')
        );
    }
    return (e: ChangeEvent<HTMLSelectElement>) => handleOnChange(e.target.value);
  }, [handleOnChange, multiple]);

  return (
    <select
      data-testid={testID}
      className={className}
      value={multiple && value ? value.split(',') : value}
      title={title}
      disabled={disabled}
      multiple={!!multiple}
      onChange={onChange}>
      {toOptions(options)}
    </select>
  );
};

ValueSelector.displayName = 'ValueSelector';
