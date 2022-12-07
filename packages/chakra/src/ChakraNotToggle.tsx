import { FormControl, FormLabel, Switch } from '@chakra-ui/react';
import type { NotToggleProps } from '@react-querybuilder/ts';
import type { ComponentPropsWithoutRef } from 'react';
import { useId } from 'react';

type ChakraNotToggleProps = NotToggleProps & ComponentPropsWithoutRef<typeof Switch>;

export const ChakraNotToggle = ({
  className,
  handleOnChange,
  label,
  checked,
  title,
  disabled,
  // Props that should not be in extraProps
  path: _path,
  context: _context,
  validation: _validation,
  testID: _testID,
  ...extraProps
}: ChakraNotToggleProps) => {
  const id = useId();

  return (
    <div style={{ display: 'inline-block' }}>
      <FormControl
        display="flex"
        alignItems="center"
        className={className}
        title={title}
        isDisabled={disabled}>
        <Switch
          id={id}
          size="sm"
          colorScheme="red"
          isChecked={checked}
          isDisabled={disabled}
          onChange={e => handleOnChange(e.target.checked)}
          {...extraProps}
        />
        <FormLabel htmlFor={id}>{label}</FormLabel>
      </FormControl>
    </div>
  );
};

ChakraNotToggle.displayName = 'ChakraNotToggle';
