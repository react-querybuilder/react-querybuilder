import type { ValueEditorProps } from '@react-querybuilder/ts';
import { useContext } from 'react';
import {
  getFirstOption,
  standardClassnames,
  useValueEditor,
  ValueEditor,
} from 'react-querybuilder';
import { MaterialValueSelector } from './MaterialValueSelector';
import { RQBMaterialContext } from './RQBMaterialContext';
import type { RQBMaterialComponents } from './types';

type MaterialValueEditorProps = ValueEditorProps & {
  muiComponents?: RQBMaterialComponents;
};

export const MaterialValueEditor = (props: MaterialValueEditorProps) => {
  const { muiComponents: muiComponentsProp, ...propsForValueEditor } = props;
  const {
    field: _f,
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
    parseNumbers,
    separator,
    valueSource: _vs,
    disabled,
    testID,
    selectorComponent: SelectorComponent = MaterialValueSelector,
    ...propsForValueSelector
  } = propsForValueEditor;
  const muiComponents = useContext(RQBMaterialContext) || muiComponentsProp;
  const { valueAsArray, multiValueHandler } = useValueEditor({
    handleOnChange,
    inputType,
    operator,
    value,
    type,
    listsAsArrays,
    parseNumbers,
    values,
  });

  const masterKey = muiComponents ? 'mui' : 'no-mui';
  if (!muiComponents) {
    return <ValueEditor skipHook key={masterKey} {...propsForValueEditor} />;
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
  } = muiComponents;

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const placeHolderText = fieldData?.placeholder ?? '';
  const inputTypeCoerced = ['in', 'notIn'].includes(operator) ? 'text' : inputType || 'text';

  if (
    (operator === 'between' || operator === 'notBetween') &&
    (type === 'select' || type === 'text')
  ) {
    const editors = ['from', 'to'].map((key, i) => {
      if (type === 'text') {
        return (
          <Input
            key={key}
            type={inputTypeCoerced}
            className={standardClassnames.valueListItem}
            value={valueAsArray[i] ?? ''}
            disabled={disabled}
            placeholder={placeHolderText}
            onChange={e => multiValueHandler(e.target.value, i)}
          />
        );
      }
      return (
        <SelectorComponent
          key={key}
          {...propsForValueSelector}
          path={path}
          level={level}
          className={standardClassnames.valueListItem}
          handleOnChange={v => multiValueHandler(v, i)}
          muiComponents={muiComponents}
          disabled={disabled}
          value={valueAsArray[i] ?? getFirstOption(values)}
          options={values}
          listsAsArrays={listsAsArrays}
        />
      );
    });
    return (
      <span key={masterKey} data-testid={testID} className={className} title={title}>
        {editors[0]}
        {separator}
        {editors[1]}
      </span>
    );
  }

  switch (type) {
    case 'select':
    case 'multiselect':
      return (
        <SelectorComponent
          {...propsForValueSelector}
          muiComponents={muiComponents}
          key={masterKey}
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
          key={masterKey}
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
          key={masterKey}
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
          key={masterKey}
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
          key={masterKey}
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
      key={masterKey}
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
