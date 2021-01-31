import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { NotToggleProps } from '../../src/types';

const MaterialNotToggle = ({ className, handleOnChange, checked }: NotToggleProps) => {
  return (
    <FormControlLabel
      className={className}
      control={<Checkbox checked={!!checked} onChange={(e) => handleOnChange(e.target.checked)} />}
      label="Not"
    />
  );
};

MaterialNotToggle.displayName = 'MaterialNotToggle';

export default MaterialNotToggle;
