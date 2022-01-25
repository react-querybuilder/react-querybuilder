import { useMemo, type ChangeEvent } from 'react';
import type { ValueSelectorProps } from 'react-querybuilder';
import { toOptions } from './utils';

export const BulmaValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title,
  disabled,
  multiple,
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
    <div title={title} className={`${className} select is-small`}>
      <select
        value={multiple && value ? value.split(',') : value}
        multiple={!!multiple}
        disabled={disabled}
        onChange={onChange}>
        {toOptions(options)}
      </select>
    </div>
  );
};

BulmaValueSelector.displayName = 'BulmaValueSelector';
