import type { NotToggleProps } from 'react-querybuilder';

const BulmaNotToggle = ({
  className,
  handleOnChange,
  label,
  checked,
  title,
  disabled,
}: NotToggleProps) => (
  <label className={`${className} checkbox`} title={title}>
    <input
      type="checkbox"
      disabled={disabled}
      checked={checked}
      onChange={e => handleOnChange(e.target.checked)}
    />
    {label}
  </label>
);

BulmaNotToggle.displayName = 'BulmaNotToggle';

export default BulmaNotToggle;
