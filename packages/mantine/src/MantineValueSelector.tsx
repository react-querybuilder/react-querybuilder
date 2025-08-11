import type { MultiSelectProps, SelectProps } from '@mantine/core';
import { MultiSelect, Select } from '@mantine/core';
import * as React from 'react';
import type { VersatileSelectorProps } from 'react-querybuilder';
import { useValueSelector } from 'react-querybuilder';
import { optionListToComboboxData } from './utils';

/**
 * @group Props
 */
export type MantineValueSelectorProps = VersatileSelectorProps & Partial<SelectProps>;

/**
 * @group Components
 */
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
  field: _field,
  fieldData: _fieldData,
  rule: _rule,
  ruleGroup: _ruleGroup,
  rules: _rules,
  path: _path,
  level: _level,
  context: _context,
  validation: _validation,
  schema: _schema,
  ...otherProps
}: MantineValueSelectorProps): React.JSX.Element => {
  const { onChange, val } = useValueSelector({ handleOnChange, listsAsArrays, multiple, value });

  const data = React.useMemo(() => optionListToComboboxData(options), [options]);

  const changeHandler = (v: string | string[] | null) =>
    onChange(v ?? val ?? /* istanbul ignore next */ '');

  return multiple ? (
    <MultiSelect
      comboboxProps={{ withinPortal: false }}
      {...(otherProps as MultiSelectProps)}
      data-testid={testID}
      title={title}
      className={className}
      data={data}
      disabled={disabled}
      value={val as string[]}
      onChange={changeHandler}
    />
  ) : (
    <Select
      comboboxProps={{ withinPortal: false }}
      {...otherProps}
      data-testid={testID}
      title={title}
      className={className}
      value={val as string}
      data={data}
      disabled={disabled}
      onChange={changeHandler}
    />
  );
};
