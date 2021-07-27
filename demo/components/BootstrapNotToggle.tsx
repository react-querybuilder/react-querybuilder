import { NotToggleProps } from '../../src/types';

const BootstrapNotToggle = ({
  className,
  handleOnChange,
  title,
  label,
  checked
}: NotToggleProps) => (
  <div className={`form-check-inline ${className}`}>
    <input
      id="notToggle"
      className="form-check-input"
      type="checkbox"
      onChange={(e) => handleOnChange(e.target.checked)}
      checked={!!checked}
    />
    <label title={title} htmlFor="notToggle">
      {label}
    </label>
  </div>
);

BootstrapNotToggle.displayName = 'BootstrapNotToggle';

export default BootstrapNotToggle;
