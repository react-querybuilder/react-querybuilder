import { useRef } from 'react';
import type { NotToggleProps } from 'react-querybuilder';

const BootstrapNotToggle = ({
  className,
  handleOnChange,
  title,
  label,
  checked,
  disabled,
}: NotToggleProps) => {
  const id = useRef(`notToggle-${Math.random()}`);

  return (
    <div className={`form-check-inline form-switch ${className}`}>
      <input
        id={id.current}
        className="form-check-input"
        type="checkbox"
        onChange={e => handleOnChange(e.target.checked)}
        checked={!!checked}
        disabled={disabled}
      />
      <label title={title} htmlFor={id.current} className="form-check-label">
        {label}
      </label>
    </div>
  );
};

BootstrapNotToggle.displayName = 'BootstrapNotToggle';

export default BootstrapNotToggle;
