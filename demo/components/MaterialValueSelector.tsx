import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { ValueSelectorProps } from '../../src/types';

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
        const key = `key-${option.id ?? option.name}`;
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
