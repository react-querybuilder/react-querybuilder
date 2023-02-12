import { Switch } from '@mantine/core';
import type { NotToggleProps } from '@react-querybuilder/ts';

export const MantineNotToggle = ({
  className,
  handleOnChange,
  label,
  checked,
  title,
  disabled,
}: NotToggleProps) => (
  <Switch
    label={label}
    className={className}
    title={title}
    disabled={disabled}
    checked={checked}
    onChange={e => handleOnChange(e.target.checked)}
  />
);

MantineNotToggle.displayName = 'MantineNotToggle';
