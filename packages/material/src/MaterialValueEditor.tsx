import type { ValueEditorProps } from 'react-querybuilder';
import {
  joinWith,
  standardClassnames,
  toArray,
  useValueEditor,
  ValueEditor,
} from 'react-querybuilder';
import { MaterialValueSelector } from './MaterialValueSelector';
import type { RQBMaterialComponents } from './types';
import { useMuiComponents } from './useMuiComponents';

type MaterialValueEditorProps = ValueEditorProps & {
  muiComponents?: Partial<RQBMaterialComponents>;
};

type MaterialValueEditorComponents = Pick<
  RQBMaterialComponents,
  | 'Checkbox'
  | 'FormControl'
  | 'FormControlLabel'
  | 'Input'
  | 'Radio'
  | 'RadioGroup'
  | 'Switch'
  | 'TextareaAutosize'
  // These are needed for MaterialValueSelector
  | 'Select'
  | 'ListSubheader'
  | 'MenuItem'
>;

const muiComponentNames: (keyof RQBMaterialComponents)[] = [
  'Checkbox',
  'FormControl',
  'FormControlLabel',
  'Input',
  'Radio',
  'RadioGroup',
  'Switch',
  'TextareaAutosize',
  // These are needed for MaterialValueSelector
  'Select',
  'ListSubheader',
  'MenuItem',
];

export const MaterialValueEditor = ({
  field,
  fieldData,
  operator,
  value,
  handleOnChange,
  title,
  className,
  type,
  path,
  level,
  inputType,
  values = [],
  listsAsArrays,
  valueSource,
  disabled,
  testID,
  muiComponents,
  ...props
}: MaterialValueEditorProps) => {
  const muiComponentsInternal = useMuiComponents(muiComponentNames, muiComponents);
  useValueEditor({ handleOnChange, inputType, operator, value });

  const key = muiComponentsInternal ? 'mui' : 'no-mui';
  if (!muiComponentsInternal) {
    return (
      <ValueEditor
        key={key}
        field={field}
        fieldData={fieldData}
        operator={operator}
        value={value}
        handleOnChange={handleOnChange}
        title={title}
        className={className}
        type={type}
        path={path}
        level={level}
        inputType={inputType}
        values={values}
        listsAsArrays={listsAsArrays}
        valueSource={valueSource}
        disabled={disabled}
        testID={testID}
      />
    );
  }

  const {
    Checkbox,
    FormControl,
    FormControlLabel,
    Input,
    Radio,
    RadioGroup,
    Switch,
    TextareaAutosize,
  } = muiComponentsInternal as MaterialValueEditorComponents;

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const placeHolderText = fieldData?.placeholder ?? '';
  const inputTypeCoerced = ['between', 'notBetween', 'in', 'notIn'].includes(operator)
    ? 'text'
    : inputType || 'text';

  if ((operator === 'between' || operator === 'notBetween') && type === 'select') {
    const valArray = toArray(value);
    const selector1handler = (v: string) => {
      const val = [v, valArray[1] ?? values[0]?.name, ...valArray.slice(2)];
      handleOnChange(listsAsArrays ? val : joinWith(val, ','));
    };
    const selector2handler = (v: string) => {
      const val = [valArray[0], v, ...valArray.slice(2)];
      handleOnChange(listsAsArrays ? val : joinWith(val, ','));
    };
    return (
      <span key={key} data-testid={testID} className={className} title={title}>
        <MaterialValueSelector
          {...props}
          muiComponents={muiComponents}
          path={path}
          level={level}
          className={standardClassnames.valueListItem}
          handleOnChange={selector1handler}
          disabled={disabled}
          value={valArray[0]}
          options={values}
          listsAsArrays={listsAsArrays}
        />
        <MaterialValueSelector
          {...props}
          muiComponents={muiComponents}
          path={path}
          level={level}
          className={standardClassnames.valueListItem}
          handleOnChange={selector2handler}
          disabled={disabled}
          value={valArray[1] ?? ''}
          options={values}
          listsAsArrays={listsAsArrays}
        />
      </span>
    );
  }

  switch (type) {
    case 'select':
    case 'multiselect':
      return (
        <MaterialValueSelector
          {...props}
          muiComponents={muiComponents}
          key={key}
          path={path}
          level={level}
          className={className}
          handleOnChange={handleOnChange}
          options={values}
          value={value}
          disabled={disabled}
          title={title}
          multiple={type === 'multiselect'}
          listsAsArrays={listsAsArrays}
        />
      );

    case 'textarea':
      return (
        <TextareaAutosize
          key={key}
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
          key={key}
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
          key={key}
          className={className}
          title={title}
          onChange={e => handleOnChange(e.target.checked)}
          checked={!!value}
          disabled={disabled}
        />
      );

    case 'radio':
      return (
        <FormControl
          key={key}
          className={className}
          title={title}
          component="fieldset"
          disabled={disabled}>
          <RadioGroup value={value} onChange={e => handleOnChange(e.target.value)}>
            {values.map(v => (
              <FormControlLabel
                disabled={disabled}
                key={v.name}
                value={v.name}
                control={<Radio />}
                label={v.label}
              />
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
      key={key}
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
