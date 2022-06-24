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
  listsAsArrays,
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
