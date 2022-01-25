import { Switch } from 'antd';
import type { NotToggleProps } from 'react-querybuilder';

export const AntDNotToggle = ({
  className,
  handleOnChange,
  label,
  checked,
  title,
  disabled,
}: NotToggleProps) => (
  <Switch
    title={title}
    className={className}
    onChange={v => handleOnChange(v)}
    checked={!!checked}
    disabled={disabled}
    checkedChildren={label}
    unCheckedChildren="="
  />
);

AntDNotToggle.displayName = 'AntDNotToggle';
