import { useState } from 'react';
import type { NotToggleProps } from 'react-querybuilder';

const BootstrapNotToggle = ({
  className,
  handleOnChange,
  title,
  label,
  checked,
  disabled,
}: NotToggleProps) => {
  const [id] = useState(`notToggle-${Math.random()}`);

  return (
    <div className={`form-check-inline form-switch ${className}`}>
      <input
        id={id}
        className="form-check-input"
        type="checkbox"
        onChange={e => handleOnChange(e.target.checked)}
        checked={!!checked}
        disabled={disabled}
      />
      <label title={title} htmlFor={id} className="form-check-label">
        {label}
      </label>
    </div>
  );
};

BootstrapNotToggle.displayName = 'BootstrapNotToggle';

export default BootstrapNotToggle;
