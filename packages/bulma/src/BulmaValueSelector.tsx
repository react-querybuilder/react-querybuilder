import { useMemo, type ChangeEvent } from 'react';
import { joinWith, splitBy, type ValueSelectorProps } from 'react-querybuilder';
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

  return (
    <div title={title} className={`${className} select is-small`}>
      <select
        value={multiple && value ? splitBy(value, ',') : value}
        multiple={!!multiple}
        disabled={disabled}
        onChange={onChange}>
        {toOptions(options)}
      </select>
    </div>
  );
};

BulmaValueSelector.displayName = 'BulmaValueSelector';
