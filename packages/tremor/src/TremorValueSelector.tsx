import type { MultiSelectProps, SelectProps } from '@tremor/react';
import { MultiSelect, Select } from '@tremor/react';
import * as React from 'react';
import type { VersatileSelectorProps } from 'react-querybuilder';
import { toArray, useValueSelector } from 'react-querybuilder';
import { toSelectItems } from './utils';

export type TremorValueSelectorProps = VersatileSelectorProps &
  Omit<SelectProps & MultiSelectProps, 'children' | 'value'> & {
    value?: any;
  };

export const TremorValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title,
  disabled,
  multiple,
  listsAsArrays,
  testID,
  placeholder,
  fieldData: _fieldData,
  path: _path,
  level: _level,
  context: _context,
  validation: _validation,
  schema: _schema,
  rule: _rule,
  rules: _rules,
  ...otherProps
}: TremorValueSelectorProps) => {
  const { onChange, val } = useValueSelector({ handleOnChange, listsAsArrays, multiple, value });

  return multiple ? (
    <MultiSelect
      data-testid={testID}
      title={title}
      className={className}
      disabled={disabled}
      value={toArray(val)}
      placeholder={placeholder}
      onValueChange={v => onChange(v)}>
      {toSelectItems(options, true)}
    </MultiSelect>
  ) : (
    <Select
      {...otherProps}
      data-testid={testID}
      title={title}
      className={className}
      value={value}
      disabled={disabled}
      onValueChange={v => onChange(v)}>
      {toSelectItems(options, false)}
    </Select>
  );
};

TremorValueSelector.displayName = 'TremorValueSelector';
