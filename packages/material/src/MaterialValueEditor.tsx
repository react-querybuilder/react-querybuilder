import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Input from '@mui/material/Input';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Switch from '@mui/material/Switch';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { useValueEditor, type ValueEditorProps } from 'react-querybuilder';
import { MaterialValueSelector } from './MaterialValueSelector';

export const MaterialValueEditor = ({
  fieldData,
  operator,
  value,
  handleOnChange,
  title,
  className,
  type,
  inputType,
  values,
  valueSource: _vs,
  disabled,
  ...props
}: ValueEditorProps) => {
  useValueEditor({ handleOnChange, inputType, operator, value });

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const placeHolderText = fieldData?.placeholder ?? '';
  const inputTypeCoerced = ['between', 'notBetween', 'in', 'notIn'].includes(operator)
    ? 'text'
    : inputType || 'text';

  switch (type) {
    case 'select':
    case 'multiselect':
      return (
        <MaterialValueSelector
          {...props}
          className={className}
          handleOnChange={handleOnChange}
          options={values!}
          value={value}
          disabled={disabled}
          title={title}
          multiple={type === 'multiselect'}
        />
      );

    case 'textarea':
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

    case 'switch':
      return (
        <Switch
          checked={!!value}
          title={title}
          disabled={disabled}
          className={className}
          onChange={e => handleOnChange(e.target.checked)}
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

  /**
   * TODO: support `inputType`s of "date" (`<DatePicker />`), "datetime-local"
   * (`<DateTimePicker />`), and "time" (`<TimePicker />`) once the components are
   * out of the MUI "lab" and into MUI core. Add something like this to the README:
   *
   * > If you intend to use an inputType of "date", "datetime-local", or "time",
   * > wrap your `<QueryBuilder />` element in a `LocalizationProvider` (and install
   * > the date library associated with the selected `dateAdapter`) like this:
   * >
   * > <LocalizationProvider dateAdapter={AdapterDateFns}>
   * >   <QueryBuilder />
   * > </LocalizationProvider>
   */

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
