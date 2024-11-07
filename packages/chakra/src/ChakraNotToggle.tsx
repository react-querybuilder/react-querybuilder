import type { ComponentPropsWithoutRef } from 'react';
import * as React from 'react';
import type { NotToggleProps } from 'react-querybuilder';
import { Switch } from './snippets/switch';

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
}: ChakraNotToggleProps): React.JSX.Element => (
  <Switch
    title={title}
    className={className}
    disabled={disabled}
    checked={checked}
    onCheckedChange={(e: { checked: boolean }) => handleOnChange(e.checked)}
    {...extraProps}>
    {label}
  </Switch>
);
