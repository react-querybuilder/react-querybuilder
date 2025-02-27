import * as React from 'react';
import type { NotToggleProps } from 'react-querybuilder';

/**
 * @group Components
 */
export const BulmaNotToggle = ({
  className,
  handleOnChange,
  label,
  checked,
  title,
  disabled,
}: NotToggleProps): React.JSX.Element => (
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
