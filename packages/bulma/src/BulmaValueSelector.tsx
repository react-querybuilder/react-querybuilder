import type { ChangeEvent } from 'react';
import { useMemo } from 'react';
import type { ValueSelectorProps } from 'react-querybuilder';
import { joinWith, splitBy } from 'react-querybuilder';
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
            handleOnChange(listsAsArrays ? valArray : joinWith(valArray, ','));
          }
        : (e: ChangeEvent<HTMLSelectElement>) => handleOnChange(e.target.value),
    [handleOnChange, listsAsArrays, multiple]
  );

  const val = multiple ? (Array.isArray(value) ? value : splitBy(value, ',')) : value;

  return (
    <div title={title} className={`${className} select is-small`}>
      <select value={val} multiple={!!multiple} disabled={disabled} onChange={onChange}>
        {toOptions(options)}
      </select>
    </div>
  );
};

BulmaValueSelector.displayName = 'BulmaValueSelector';
