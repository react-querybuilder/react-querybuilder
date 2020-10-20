import { Checkbox } from 'antd';
import React from 'react';
import { NotToggleProps } from '../../src/types';

const AntDNotToggle = ({ className, handleOnChange, checked }: NotToggleProps) => {
  return (
    <Checkbox
      className={className}
      onChange={(e) => handleOnChange(e.target.checked)}
      checked={!!checked}>
      Not
    </Checkbox>
  );
};

AntDNotToggle.displayName = 'AntDNotToggle';

export default AntDNotToggle;
