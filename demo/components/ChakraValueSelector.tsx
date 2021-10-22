import { Select } from '@chakra-ui/react';
import { ValueSelectorProps } from '../../src/types';

const ChakraValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title
}: ValueSelectorProps) => (
  <Select
    className={className}
    title={title}
    value={value}
    size="xs"
    variant="filled"
    onChange={(e) => handleOnChange(e.target.value)}>
    {options.map((option) => {
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
