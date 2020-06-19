import React from 'react';
import { NotToggleProps } from '../types';

const NotToggle: React.FC<NotToggleProps> = ({ className, handleOnChange, title, checked }) => {
  return (
    <label className={className} title={title}>
      <input
        type="checkbox"
        onChange={(e) => handleOnChange(e.target.checked)}
        checked={!!checked}
      />
      Not
    </label>
  );
};

NotToggle.displayName = 'NotToggle';

export default NotToggle;
