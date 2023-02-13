import type { SwitchProps } from '@mantine/core';
import { Switch } from '@mantine/core';
import type { NotToggleProps } from '@react-querybuilder/ts';

type MantineNotToggleProps = NotToggleProps & Partial<SwitchProps>;

export const MantineNotToggle = ({
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
  ...otherProps
}: MantineNotToggleProps) => (
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

MantineNotToggle.displayName = 'MantineNotToggle';
