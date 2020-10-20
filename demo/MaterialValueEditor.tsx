import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Select from '@material-ui/core/Select';
import React from 'react';
import { ValueEditorProps } from '../src/types';

const MaterialValueEditor = ({
  operator,
  value,
  handleOnChange,
  title,
  className,
  type,
  inputType,
  values
}: ValueEditorProps) => {
  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

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
          type={inputType || 'text'}
          value={value}
          title={title}
          className={className}
          onChange={(e) => handleOnChange(e.target.value)}
        />
      );
  }
};

MaterialValueEditor.displayName = 'MaterialValueEditor';

export default MaterialValueEditor;
