import type { SwitchProps } from '@fluentui/react-components';
import { Switch } from '@fluentui/react-components';
import * as React from 'react';
import type { NotToggleProps } from 'react-querybuilder';

/**
 * @group Props
 */
export interface FluentNotToggleProps extends NotToggleProps, Omit<Partial<SwitchProps>, 'label'> {}

/**
 * @group Components
 */
export const FluentNotToggle = ({
  className,
  handleOnChange,
  label,
  checked,
  title,
  disabled,
  testID,
  path: _path,
  level: _level,
  context: _context,
  validation: _validation,
  schema: _schema,
  ruleGroup: _ruleGroup,
  ...otherProps
}: FluentNotToggleProps): React.JSX.Element => (
  <Switch
    {...otherProps}
    data-testid={testID}
    label={`${label as string}`}
    className={className}
    title={title}
    disabled={disabled}
    checked={checked}
    onChange={e => handleOnChange(e.target.checked)}
  />
);
