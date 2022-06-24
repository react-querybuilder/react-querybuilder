import FormControl from '@mui/material/FormControl';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import { useMemo, type ComponentPropsWithoutRef } from 'react';
import type { VersatileSelectorProps } from 'react-querybuilder';
import { toOptions } from './utils';

type MaterialValueSelectorProps = VersatileSelectorProps & ComponentPropsWithoutRef<typeof Select>;

export const MaterialValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  disabled,
  title,
  multiple,
  listsAsArrays,
  // Props that should not be in extraProps
  testID: _testID,
  rules: _rules,
  level: _level,
  path: _path,
  context: _context,
  validation: _validation,
  operator: _operator,
  field: _field,
  fieldData: _fieldData,
  ...extraProps
}: MaterialValueSelectorProps) => {
  const onChange = useMemo(
    () =>
      multiple
        ? ({ target: { value: v } }: SelectChangeEvent<string | string[]>) =>
            handleOnChange(
              Array.isArray(v) ? (listsAsArrays ? v : v.join(',')) : /* istanbul ignore next */ v
            )
        : ({ target: { value: v } }: SelectChangeEvent<string>) => handleOnChange(v),
    [handleOnChange, listsAsArrays, multiple]
  );

  const val = multiple ? (Array.isArray(value) ? value : value?.split(',')) : value;

  return (
    <FormControl variant="standard" className={className} title={title} disabled={disabled}>
      <Select
        value={val}
        // @ts-expect-error onChange cannot accept string[]
        onChange={onChange}
        multiple={!!multiple}
        {...extraProps}>
        {toOptions(options)}
      </Select>
    </FormControl>
  );
};

MaterialValueSelector.displayName = 'MaterialValueSelector';
