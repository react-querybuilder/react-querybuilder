import { FormControl, FormLabel, Switch } from '@chakra-ui/react';
import { useRef } from 'react';
import type { NotToggleProps } from 'react-querybuilder';

const ChakraNotToggle = ({
  className,
  handleOnChange,
  label,
  checked,
  title,
  disabled,
}: NotToggleProps) => {
  const id = useRef(`notToggle-${Math.random()}`);

  return (
    <div style={{ display: 'inline-block' }}>
      <FormControl
        display="flex"
        alignItems="center"
        className={className}
        title={title}
        isDisabled={disabled}>
        <Switch
          id={id.current}
          size="sm"
          colorScheme="red"
          isChecked={checked}
          isDisabled={disabled}
          onChange={e => handleOnChange(e.target.checked)}
        />
        <FormLabel htmlFor={id.current}>{label}</FormLabel>
      </FormControl>
    </div>
  );
};

ChakraNotToggle.displayName = 'ChakraNotToggle';

export default ChakraNotToggle;
