import { Select } from '@chakra-ui/react';
import type { ComponentPropsWithoutRef } from 'react';
import * as React from 'react';
import type { VersatileSelectorProps } from 'react-querybuilder';
import { toOptions } from './utils';

export type ChakraValueSelectorProps = VersatileSelectorProps &
  ComponentPropsWithoutRef<typeof Select>;

export const ChakraValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title,
  disabled,
  // Props that should not be in extraProps
  testID: _testID,
  rule: _rule,
  rules: _rules,
  level: _level,
  path: _path,
  context: _context,
  validation: _validation,
  operator: _operator,
  field: _field,
  fieldData: _fieldData,
  multiple: _multiple,
  listsAsArrays: _listsAsArrays,
  schema: _schema,
  ...extraProps
}: ChakraValueSelectorProps): React.JSX.Element => (
  <Select
    className={className}
    title={title}
    value={value}
    disabled={disabled}
    onChange={e => handleOnChange(e.target.value)}
    {...extraProps}>
    {toOptions(options)}
  </Select>
);
