import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import type { NotToggleProps } from '../../src/types';

const MaterialNotToggle = ({
  className,
  handleOnChange,
  label,
  checked,
  title
}: NotToggleProps) => {
  return (
    <FormControlLabel
      className={className}
      title={title}
      control={<Checkbox checked={!!checked} onChange={(e) => handleOnChange(e.target.checked)} />}
      label={label}
    />
  );
};

MaterialNotToggle.displayName = 'MaterialNotToggle';

export default MaterialNotToggle;
