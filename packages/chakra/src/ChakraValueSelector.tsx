import { Select } from '@chakra-ui/react';
import type { ComponentPropsWithoutRef } from 'react';
import type { VersatileSelectorProps } from 'react-querybuilder';
import { toOptions } from './utils';

type ChakraValueSelectorProps = VersatileSelectorProps & ComponentPropsWithoutRef<typeof Select>;

export const ChakraValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title,
  disabled,
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
  multiple: _multiple,
  ...extraProps
}: ChakraValueSelectorProps) => (
  <Select
    className={className}
    title={title}
    value={value}
    size="xs"
    variant="filled"
    disabled={disabled}
    onChange={e => handleOnChange(e.target.value)}
    {...extraProps}>
    {toOptions(options)}
  </Select>
);

ChakraValueSelector.displayName = 'ChakraValueSelector';
