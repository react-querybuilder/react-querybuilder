import { Fieldset } from '@chakra-ui/react';
import type { ComponentPropsWithoutRef } from 'react';
import * as React from 'react';
import { useId } from 'react';
import type { NotToggleProps } from 'react-querybuilder';
import { Switch } from './snippets/switch';
import { Field } from './snippets/field';

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
}: ChakraNotToggleProps): React.JSX.Element => {
  const id = useId();

  return (
    <div style={{ display: 'inline-block' }}>
      <Fieldset.Root
        display="flex"
        alignItems="center"
        className={className}
        title={title}
        disabled={disabled}
      >
        <Fieldset.Content>
          <Switch
            id={id}
            checked={checked}
            disabled={disabled}
            onChange={e => handleOnChange(e.target.checked)}
            {...extraProps}
          />
          <Field marginBottom={0} htmlFor={id}>
            {label}
          </Field>
        </Fieldset.Content>
      </Fieldset.Root>
    </div>
  );
};
