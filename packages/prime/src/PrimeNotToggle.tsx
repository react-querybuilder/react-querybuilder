import { InputSwitch } from 'primereact/inputswitch';
import type { ComponentPropsWithoutRef } from 'react';
import * as React from 'react';
import type { NotToggleProps } from 'react-querybuilder';

/**
 * @group Props
 */
export interface PrimeNotToggleProps
  extends
    NotToggleProps,
    Omit<ComponentPropsWithoutRef<typeof InputSwitch>, 'checked' | 'onChange'> {}

/**
 * @group Components
 */
export const PrimeNotToggle = ({
  className,
  handleOnChange,
  label,
  checked,
  title,
  disabled,
  // Props that should not be in extraProps
  path: _path,
  context: _context,
  validation: _validation,
  testID: _testID,
  schema: _schema,
  ruleGroup: _ruleGroup,
  ...extraProps
}: PrimeNotToggleProps): React.JSX.Element => (
  <label title={title} className={className}>
    <InputSwitch
      checked={!!checked}
      disabled={disabled}
      onChange={e => handleOnChange(e.value)}
      {...extraProps}
    />
    {label}
  </label>
);
