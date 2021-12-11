import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Input,
  MenuItem,
  Radio,
  RadioGroup,
  Select
} from '@mui/material';
import { useEffect } from 'react';
import type { ValueEditorProps } from 'react-querybuilder';

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
      !['between', 'notBetween', 'in', 'notIn'].includes(operator) &&
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
  const inputTypeCoerced = ['between', 'notBetween', 'in', 'notIn'].includes(operator)
    ? 'text'
    : inputType || 'text';

  switch (type) {
    case 'select':
      return (
        <FormControl variant="standard" className={className}>
          <Select value={value} onChange={(e) => handleOnChange(e.target.value)}>
            {values &&
              values.map((v) => (
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
