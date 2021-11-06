import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Input from '@mui/material/Input';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import { useEffect } from 'react';
import type { ValueEditorProps } from '../../src/types';

const MaterialValueEditor = ({
  fieldData,
  operator,
  value,
  handleOnChange,
  title,
  className,
  type,
  inputType,
  values
}: ValueEditorProps) => {
  useEffect(() => {
    if (
      inputType === 'number' &&
      !['between', 'notBetween'].includes(operator) &&
      typeof value === 'string' &&
      value.includes(',')
    ) {
      handleOnChange('');
    }
  }, [inputType, operator, value, handleOnChange]);

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const placeHolderText = fieldData?.placeholder ?? '';
  const inputTypeCoerced = ['between', 'notBetween'].includes(operator)
    ? 'text'
    : inputType || 'text';

  switch (type) {
    case 'select':
      return (
        <FormControl className={className}>
          <Select value={value} onChange={(e) => handleOnChange(e.target.value)}>
            {values.map((v) => (
              <MenuItem key={v.name} value={v.name}>
                {v.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );

    case 'checkbox':
      return (
        <Checkbox
          className={className}
          onChange={(e) => handleOnChange(e.target.checked)}
          checked={!!value}
        />
      );

    case 'radio':
      return (
        <FormControl className={className} title={title} component="fieldset">
          <RadioGroup value={value} onChange={(e) => handleOnChange(e.target.value)}>
            {values!.map((v) => (
              <FormControlLabel key={v.name} value={v.name} control={<Radio />} label={v.label} />
            ))}
          </RadioGroup>
        </FormControl>
      );

    default:
      return (
        <Input
          type={inputTypeCoerced}
          value={value}
          title={title}
          className={className}
          placeholder={placeHolderText}
          onChange={(e) => handleOnChange(e.target.value)}
        />
      );
  }
};

MaterialValueEditor.displayName = 'MaterialValueEditor';

export default MaterialValueEditor;
