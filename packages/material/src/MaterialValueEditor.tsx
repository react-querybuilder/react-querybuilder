import { Checkbox, FormControl, FormControlLabel, Input, Radio, RadioGroup } from '@mui/material';
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

    default:
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
  }
};

MaterialValueEditor.displayName = 'MaterialValueEditor';

export default MaterialValueEditor;
