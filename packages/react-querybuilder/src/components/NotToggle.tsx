import type { NotToggleProps } from '@react-querybuilder/ts';

export const NotToggle = ({
  className,
  handleOnChange,
  title,
  label,
  checked,
  disabled,
  testID,
}: NotToggleProps) => (
  <label data-testid={testID} className={className} title={title}>
    <input
      type="checkbox"
      onChange={e => handleOnChange(e.target.checked)}
      checked={!!checked}
      disabled={disabled}
    />
    {label}
  </label>
);

NotToggle.displayName = 'NotToggle';
