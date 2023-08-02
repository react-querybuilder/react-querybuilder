import type { MultiSelectProps, SelectProps } from '@mantine/core';
import { MultiSelect, Select } from '@mantine/core';
import * as React from 'react';
import type { VersatileSelectorProps } from 'react-querybuilder';
import { useValueSelector } from 'react-querybuilder';
import { optionListMapNameToValue } from './utils';

export type MantineValueSelectorProps = VersatileSelectorProps & Partial<SelectProps>;

export const MantineValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title,
  disabled,
  multiple,
  listsAsArrays,
  testID,
  fieldData: _fieldData,
  path: _path,
  level: _level,
  context: _context,
  validation: _validation,
  schema: _schema,
  ...otherProps
}: MantineValueSelectorProps) => {
  const { onChange, val } = useValueSelector({ handleOnChange, listsAsArrays, multiple, value });

  const data = optionListMapNameToValue(options);

  const changeHandler = (v: string | string[] | null) => onChange(v ?? '');

  return multiple ? (
    <MultiSelect
      {...(otherProps as MultiSelectProps)}
      data-testid={testID}
      title={title}
      className={className}
      data={data}
      data-disabled={disabled}
      disabled={disabled}
      value={val as any[]}
      onChange={changeHandler}
    />
  ) : (
    <Select
      {...otherProps}
      data-testid={testID}
      title={title}
      className={className}
      value={val as string}
      data={data}
      data-disabled={disabled}
      disabled={disabled}
      onChange={changeHandler}
    />
  );
};

MantineValueSelector.displayName = 'MantineValueSelector';
