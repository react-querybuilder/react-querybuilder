import type { SwitchProps } from '@blueprintjs/core';
import { Switch } from '@blueprintjs/core';
import * as React from 'react';
import type { NotToggleProps } from 'react-querybuilder';

export type BlueprintNotToggleProps = NotToggleProps & Omit<Partial<SwitchProps>, 'label'>;

export const BlueprintNotToggle = ({
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
}: BlueprintNotToggleProps) => (
  <Switch
    {...otherProps}
    data-testid={testID}
    className={className}
    title={title}
    disabled={disabled}
    checked={checked}
    onChange={e => handleOnChange(e.target.checked)}>
    {label}
  </Switch>
);

BlueprintNotToggle.displayName = 'BlueprintNotToggle';
