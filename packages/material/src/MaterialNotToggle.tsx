import { FormControlLabel, Switch } from '@mui/material';
import type { NotToggleProps } from 'react-querybuilder';

const MaterialNotToggle = ({
  className,
  handleOnChange,
  label,
  checked,
  title,
  disabled,
}: NotToggleProps) => (
  <FormControlLabel
    className={className}
    title={title}
    disabled={disabled}
    control={<Switch checked={!!checked} onChange={e => handleOnChange(e.target.checked)} />}
    label={label ?? /* istanbul ignore next */ ''}
  />
);

MaterialNotToggle.displayName = 'MaterialNotToggle';

export default MaterialNotToggle;
