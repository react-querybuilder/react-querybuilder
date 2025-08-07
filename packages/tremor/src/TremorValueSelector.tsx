import type { MultiSelectProps, SelectProps } from '@tremor/react';
import { MultiSelect, Select } from '@tremor/react';
import * as React from 'react';
import type { VersatileSelectorProps } from 'react-querybuilder';
import { toArray, useValueSelector } from 'react-querybuilder';
import { toSelectItems } from './utils';

/**
 * @group Props
 */
export interface TremorValueSelectorProps
  extends VersatileSelectorProps,
    Omit<SelectProps & MultiSelectProps, 'children' | 'value'> {
  // oxlint-disable-next-line typescript/no-explicit-any
  value?: any;
}

/**
 * @group Components
 */
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
  ruleGroup: _ruleGroup,
  rules: _rules,
  ...otherProps
}: TremorValueSelectorProps): React.JSX.Element => {
  const { onChange, val } = useValueSelector({ handleOnChange, listsAsArrays, multiple, value });

  const optionElements = React.useMemo(() => toSelectItems(options, multiple), [multiple, options]);

  const { enableClear: _ec, ...multiSelectOtherProps } = otherProps;

  return multiple ? (
    <MultiSelect
      {...multiSelectOtherProps}
      data-testid={testID}
      title={title}
      className={className}
      disabled={disabled}
      value={toArray(val)}
      placeholder={placeholder}
      onValueChange={onChange}>
      {optionElements}
    </MultiSelect>
  ) : (
    <Select
      enableClear={false} // Remove "clear" button by default
      {...otherProps}
      data-testid={testID}
      title={title}
      className={className}
      value={value}
      disabled={disabled}
      onValueChange={onChange}>
      {optionElements}
    </Select>
  );
};
