import FormControl from '@mui/material/FormControl';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import { useMemo } from 'react';
import type { ValueSelectorProps } from 'react-querybuilder';
import { toOptions } from './utils';

export const MaterialValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  disabled,
  title,
  multiple,
}: ValueSelectorProps) => {
  const onChange = useMemo(() => {
    if (multiple) {
      return ({ target: { value: v } }: SelectChangeEvent<string | string[]>) =>
        handleOnChange(Array.isArray(v) ? v.join(',') : /* istanbul ignore next */ v);
    }
    return ({ target: { value: v } }: SelectChangeEvent<string>) => handleOnChange(v);
  }, [handleOnChange, multiple]);

  const val = multiple ? (Array.isArray(value) ? value : value?.split(',')) : value;

  return (
    <FormControl variant="standard" className={className} title={title} disabled={disabled}>
      <Select value={val as any} onChange={onChange} multiple={!!multiple}>
        {toOptions(options)}
      </Select>
    </FormControl>
  );
};

MaterialValueSelector.displayName = 'MaterialValueSelector';
