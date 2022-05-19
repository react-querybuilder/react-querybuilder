import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import type { ComponentPropsWithoutRef } from 'react';
import type { NotToggleProps } from 'react-querybuilder';

type MaterialNotToggleProps = NotToggleProps & ComponentPropsWithoutRef<typeof Switch>;

export const MaterialNotToggle = ({
  className,
  handleOnChange,
  label,
  checked,
  title,
  disabled,
  ...extraProps
}: MaterialNotToggleProps) => (
  <FormControlLabel
    className={className}
    title={title}
    disabled={disabled}
    control={
      <Switch
        checked={!!checked}
        onChange={e => handleOnChange(e.target.checked)}
        {...extraProps}
      />
    }
    label={label ?? /* istanbul ignore next */ ''}
  />
);

MaterialNotToggle.displayName = 'MaterialNotToggle';
