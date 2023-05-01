import { useId } from 'react';
import type { NotToggleProps } from 'react-querybuilder';

export const BootstrapNotToggle = ({
  className,
  handleOnChange,
  title,
  label,
  checked,
  disabled,
}: NotToggleProps) => {
  const id = useId();

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
