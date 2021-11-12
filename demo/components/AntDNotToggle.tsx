import { Switch } from 'antd';
import type { NotToggleProps } from '../../src/types';

const AntDNotToggle = ({ className, handleOnChange, label, checked, title }: NotToggleProps) => (
  <Switch
    title={title}
    className={className}
    onChange={(checked) => handleOnChange(checked)}
    checked={!!checked}
    checkedChildren={label}
    unCheckedChildren="="
  />
);

AntDNotToggle.displayName = 'AntDNotToggle';

export default AntDNotToggle;
