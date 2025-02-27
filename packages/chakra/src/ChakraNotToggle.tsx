import * as React from 'react';
import type { NotToggleProps } from 'react-querybuilder';
import type { SwitchProps } from './snippets/switch';
import { Switch } from './snippets/switch';

/**
 * @group Props
 */
export type ChakraNotToggleProps = NotToggleProps & Omit<SwitchProps, 'label'>;

/**
 * @group Components
 */
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
