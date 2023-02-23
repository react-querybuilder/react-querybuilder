import type { DropdownProps, SelectProps } from '@fluentui/react-components';
import { Dropdown, Select } from '@fluentui/react-components';
import type { VersatileSelectorProps } from '@react-querybuilder/ts';
import { toArray, toOptions, useValueSelector } from 'react-querybuilder';
import { toDropdownOptions } from './utils';

type FluentValueSelectorProps = VersatileSelectorProps & SelectProps & DropdownProps;

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
  ...otherProps
}: FluentValueSelectorProps) => {
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
      onOptionSelect={(_e, data) => onChange(data.selectedOptions)}>
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

FluentValueSelector.displayName = 'FluentValueSelector';
