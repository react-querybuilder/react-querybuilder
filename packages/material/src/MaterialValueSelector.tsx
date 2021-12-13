import { FormControl, MenuItem, Select } from '@mui/material';
import type { ValueSelectorProps } from 'react-querybuilder';

const MaterialValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  disabled,
  title,
}: ValueSelectorProps) => (
  <FormControl variant="standard" className={className} title={title} disabled={disabled}>
    <Select value={value} onChange={e => handleOnChange(e.target.value)}>
      {options.map(option => {
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
