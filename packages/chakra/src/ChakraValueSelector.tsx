import { Select } from '@chakra-ui/react';
import type { ValueSelectorProps } from 'react-querybuilder';
import { toOptions } from './utils';

export const ChakraValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title,
  disabled,
}: ValueSelectorProps) => (
  <Select
    className={className}
    title={title}
    value={value}
    size="xs"
    variant="filled"
    disabled={disabled}
    onChange={e => handleOnChange(e.target.value)}>
    {toOptions(options)}
  </Select>
);

ChakraValueSelector.displayName = 'ChakraValueSelector';
