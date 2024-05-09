import * as React from 'react';
import type { NotToggleProps } from 'react-querybuilder';

export const BulmaNotToggle = ({
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
