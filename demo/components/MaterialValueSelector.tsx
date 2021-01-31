import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { ValueSelectorProps } from '../../src/types';

const MaterialValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title
}: ValueSelectorProps) => (
  <FormControl className={className} title={title}>
    <Select value={value} onChange={(e) => handleOnChange(e.target.value)}>
      {options.map((option) => {
        const key = option.id ? `key-${option.id}` : `key-${option.name}`;
        return (
          <MenuItem key={key} value={option.name}>
            {option.label}
          </MenuItem>
        );
      })}
    </Select>
  </FormControl>
);

MaterialValueSelector.displayName = 'MaterialValueSelector';

export default MaterialValueSelector;
