import { FormControl, Select } from '@mui/material';
import type { ValueSelectorProps } from 'react-querybuilder';
import { toOptions } from './utils';

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
      {toOptions(options)}
    </Select>
  </FormControl>
);

MaterialValueSelector.displayName = 'MaterialValueSelector';

export default MaterialValueSelector;
