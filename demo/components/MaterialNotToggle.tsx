import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import type { NotToggleProps } from '../../src/types';

const MaterialNotToggle = ({
  className,
  handleOnChange,
  label,
  checked,
  title
}: NotToggleProps) => (
  <FormControlLabel
    className={className}
    title={title}
    control={<Switch checked={!!checked} onChange={(e) => handleOnChange(e.target.checked)} />}
    label={label}
  />
);

MaterialNotToggle.displayName = 'MaterialNotToggle';

export default MaterialNotToggle;
