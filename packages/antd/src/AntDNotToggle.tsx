import { Switch } from 'antd';
import type { ComponentPropsWithoutRef } from 'react';
import type { NotToggleProps } from 'react-querybuilder';

type AntDNotToggleProps = NotToggleProps & ComponentPropsWithoutRef<typeof Switch>;

export const AntDNotToggle = ({
  className,
  handleOnChange,
  label,
  checked,
  title,
  disabled,
  ...extraProps
}: AntDNotToggleProps) => (
  <Switch
    title={title}
    className={className}
    onChange={v => handleOnChange(v)}
    checked={!!checked}
    disabled={disabled}
    checkedChildren={label}
    unCheckedChildren="="
    {...extraProps}
  />
);

AntDNotToggle.displayName = 'AntDNotToggle';
