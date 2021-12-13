import { Select } from '@chakra-ui/react';
import type { ValueSelectorProps } from 'react-querybuilder';

const ChakraValueSelector = ({
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
    {options.map(option => {
      const key = `key-${option.id ?? option.name}`;
      return (
        <option key={key} value={option.name}>
          {option.label}
        </option>
      );
    })}
  </Select>
);

ChakraValueSelector.displayName = 'ChakraValueSelector';

export default ChakraValueSelector;
