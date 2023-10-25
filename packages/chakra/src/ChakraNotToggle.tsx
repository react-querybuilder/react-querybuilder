import { FormControl, FormLabel, Switch } from '@chakra-ui/react';
import type { ComponentPropsWithoutRef } from 'react';
import * as React from 'react';
import { useId } from 'react';
import type { NotToggleProps } from 'react-querybuilder';

export type ChakraNotToggleProps = NotToggleProps & ComponentPropsWithoutRef<typeof Switch>;

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
  schema: _schema,
  ruleGroup: _ruleGroup,
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
          isChecked={checked}
          isDisabled={disabled}
          onChange={e => handleOnChange(e.target.checked)}
          {...extraProps}
        />
        <FormLabel htmlFor={id} marginBottom={0}>
          {label}
        </FormLabel>
      </FormControl>
    </div>
  );
};

ChakraNotToggle.displayName = 'ChakraNotToggle';
