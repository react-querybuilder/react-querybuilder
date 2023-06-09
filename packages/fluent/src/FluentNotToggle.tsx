import type { SwitchProps } from '@fluentui/react-components';
import { Switch } from '@fluentui/react-components';
import * as React from 'react';
import type { NotToggleProps } from 'react-querybuilder';

type FluentNotToggleProps = NotToggleProps & Partial<SwitchProps>;

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
}: FluentNotToggleProps) => (
  <Switch
    {...otherProps}
    data-testid={testID}
    label={label}
    className={className}
    title={title}
    disabled={disabled}
    checked={checked}
    onChange={e => handleOnChange(e.target.checked)}
  />
);

FluentNotToggle.displayName = 'FluentNotToggle';
