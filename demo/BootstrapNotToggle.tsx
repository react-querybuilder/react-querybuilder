import React from 'react';
import { NotToggleProps } from '../src/types';

const BootstrapNotToggle = ({ className, handleOnChange, title, checked }: NotToggleProps) => (
  <div className="form-check-inline">
    <input
      id="notToggle"
      className="form-check-input"
      type="checkbox"
      onChange={(e) => handleOnChange(e.target.checked)}
      checked={!!checked}
    />
    <label className={className} title={title} htmlFor="notToggle">
      Not
    </label>
  </div>
);

BootstrapNotToggle.displayName = 'BootstrapNotToggle';

export default BootstrapNotToggle;
