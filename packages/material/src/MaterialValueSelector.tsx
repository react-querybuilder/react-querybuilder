import FormControl from '@mui/material/FormControl';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { useMemo, type ComponentPropsWithoutRef } from 'react';
import { joinWith, splitBy, type VersatileSelectorProps } from 'react-querybuilder';
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
  const theme = useTheme();

  const onChange = useMemo(
    () =>
      multiple
        ? ({ target: { value: v } }: SelectChangeEvent<string | string[]>) =>
            handleOnChange(
              Array.isArray(v)
                ? listsAsArrays
                  ? v
                  : joinWith(v, ',')
                : /* istanbul ignore next */ v
            )
        : ({ target: { value: v } }: SelectChangeEvent<string>) => handleOnChange(v),
    [handleOnChange, listsAsArrays, multiple]
  );

  const val = multiple ? (Array.isArray(value) ? value : splitBy(value, ',')) : value;

  return (
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  );
};

MaterialValueSelector.displayName = 'MaterialValueSelector';
