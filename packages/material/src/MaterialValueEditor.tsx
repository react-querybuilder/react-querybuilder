import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Input from '@mui/material/Input';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { useEffect } from 'react';
import type { ValueEditorProps } from 'react-querybuilder';
import MaterialValueSelector from './MaterialValueSelector';

const MaterialValueEditor = ({
  fieldData,
  operator,
  value,
  handleOnChange,
  title,
  className,
  type,
  inputType,
  values,
  disabled,
  ...props
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
        <MaterialValueSelector
          {...props}
          className={className}
          handleOnChange={handleOnChange}
          options={values!}
          value={value}
          disabled={disabled}
          title={title}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          className={className}
          title={title}
          onChange={e => handleOnChange(e.target.checked)}
          checked={!!value}
          disabled={disabled}
        />
      );

    case 'radio':
      return (
        <FormControl className={className} title={title} component="fieldset" disabled={disabled}>
          <RadioGroup value={value} onChange={e => handleOnChange(e.target.value)}>
            {values!.map(v => (
              <FormControlLabel key={v.name} value={v.name} control={<Radio />} label={v.label} />
            ))}
          </RadioGroup>
        </FormControl>
      );
  }

  if (inputTypeCoerced === 'textarea') {
    return (
      <TextareaAutosize
        value={value}
        title={title}
        disabled={disabled}
        className={className}
        placeholder={placeHolderText}
        onChange={e => handleOnChange(e.target.value)}
      />
    );
  }

  return (
    <Input
      type={inputTypeCoerced}
      value={value}
      title={title}
      disabled={disabled}
      className={className}
      placeholder={placeHolderText}
      onChange={e => handleOnChange(e.target.value)}
    />
  );
};

MaterialValueEditor.displayName = 'MaterialValueEditor';

export default MaterialValueEditor;
