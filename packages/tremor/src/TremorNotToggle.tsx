import type { SwitchProps } from '@tremor/react';
import { Switch } from '@tremor/react';
import * as React from 'react';
import type { NotToggleProps } from 'react-querybuilder';

/**
 * @group Props
 */
export type TremorNotToggleProps = NotToggleProps & Omit<Partial<SwitchProps>, 'label'>;

/**
 * @group Components
 */
export const TremorNotToggle = ({
  className,
  handleOnChange,
  label,
  checked,
  title,
  disabled,
  testID,
  path: _path,
  level: _level,
  context: _context,
  validation: _validation,
  schema: _schema,
  ruleGroup: _ruleGroup,
  ...otherProps
}: TremorNotToggleProps): React.JSX.Element => {
  const id = React.useId();
  return (
    <div className={className} data-testid={testID}>
      <Switch
        {...otherProps}
        id={id}
        name={id}
        title={title}
        disabled={disabled}
        checked={checked}
        onChange={handleOnChange}
      />
      <label htmlFor={id} title={title}>
        {label}
      </label>
    </div>
  );
};
