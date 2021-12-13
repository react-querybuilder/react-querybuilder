import { Switch } from 'antd';
import type { NotToggleProps } from 'react-querybuilder';

const AntDNotToggle = ({
  className,
  handleOnChange,
  label,
  checked,
  title,
  disabled
}: NotToggleProps) => (
  <Switch
    title={title}
    className={className}
    onChange={(checked) => handleOnChange(checked)}
    checked={!!checked}
    disabled={disabled}
    checkedChildren={label}
    unCheckedChildren="="
  />
);

AntDNotToggle.displayName = 'AntDNotToggle';

export default AntDNotToggle;
