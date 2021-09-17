import { Checkbox } from 'antd';
import { NotToggleProps } from '../../src/types';

const AntDNotToggle = ({ className, handleOnChange, label, checked }: NotToggleProps) => {
  return (
    <Checkbox
      className={className}
      onChange={(e) => handleOnChange(e.target.checked)}
      checked={!!checked}
    >
      {label}
    </Checkbox>
  );
};

AntDNotToggle.displayName = 'AntDNotToggle';

export default AntDNotToggle;
