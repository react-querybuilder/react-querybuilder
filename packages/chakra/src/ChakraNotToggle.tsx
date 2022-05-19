import { FormControl, FormLabel, Switch } from '@chakra-ui/react';
import { useRef, type ComponentPropsWithoutRef } from 'react';
import type { NotToggleProps } from 'react-querybuilder';

type ChakraNotToggleProps = NotToggleProps & ComponentPropsWithoutRef<typeof Switch>;

export const ChakraNotToggle = ({
  className,
  handleOnChange,
  label,
  checked,
  title,
  disabled,
  ...extraProps
}: ChakraNotToggleProps) => {
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
          {...extraProps}
        />
        <FormLabel htmlFor={id.current}>{label}</FormLabel>
      </FormControl>
    </div>
  );
};

ChakraNotToggle.displayName = 'ChakraNotToggle';
