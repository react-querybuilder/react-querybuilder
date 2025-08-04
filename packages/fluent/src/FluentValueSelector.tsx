import type { DropdownProps, OptionOnSelectData, SelectProps } from '@fluentui/react-components';
import { Dropdown, Select } from '@fluentui/react-components';
import * as React from 'react';
import type { VersatileSelectorProps } from 'react-querybuilder';
import { toArray, toOptions, useValueSelector } from 'react-querybuilder';
import { toDropdownOptions } from './utils';

/**
 * @group Props
 */
export type FluentValueSelectorProps = VersatileSelectorProps & SelectProps & DropdownProps;

/**
 * @group Components
 */
export const FluentValueSelector = ({
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
  ruleGroup: _ruleGroup,
  rules: _rules,
  ...otherProps
}: FluentValueSelectorProps): React.JSX.Element => {
  const { onChange, val } = useValueSelector({ handleOnChange, listsAsArrays, multiple, value });

  return multiple ? (
    <Dropdown
      data-testid={testID}
      title={title}
      className={className}
      disabled={disabled}
      multiselect
      value={toArray(val).join(', ')}
      placeholder={placeholder}
      selectedOptions={toArray(val)}
      onOptionSelect={(_e: unknown, data: OptionOnSelectData) => onChange(data.selectedOptions)}>
      {toDropdownOptions(options)}
    </Dropdown>
  ) : (
    <Select
      {...otherProps}
      data-testid={testID}
      title={title}
      className={className}
      value={val}
      disabled={disabled}
      multiple={!!multiple}
      onChange={(_e, data) => onChange(data.value)}>
      {toOptions(options)}
    </Select>
  );
};
