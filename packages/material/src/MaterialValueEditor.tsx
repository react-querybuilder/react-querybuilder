import * as React from 'react';
import { useContext, useMemo } from 'react';
import type { ValueEditorProps } from 'react-querybuilder';
import { getFirstOption, parseNumber, useValueEditor, ValueEditor } from 'react-querybuilder';
import type { MaterialValueSelector } from './MaterialValueSelector';
import type { RQBMaterialContextValue } from './RQBMaterialContext';
import { RQBMaterialContext } from './RQBMaterialContext';
import type { MuiAugmentation } from './types';

/**
 * @group Props
 */
export interface MaterialValueEditorProps extends ValueEditorProps, MuiAugmentation {
  extraProps?: Record<string, unknown>;
}

/**
 * @group Components
 */
export const MaterialValueEditor = (props: MaterialValueEditorProps): React.JSX.Element | null => {
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
    inputType,
    path,
    level,
    values = [],
    listsAsArrays,
    separator,
    valueSource: _vs,
    disabled,
    testID,
    selectorComponent: SelectorComponent = props.schema.controls
      .valueSelector as typeof MaterialValueSelector,
    showInputLabels: silProp,
    extraProps,
    parseNumbers: _parseNumbers,
    ...propsForValueSelector
  } = propsForValueEditor;
  const muiComponents =
    useContext(RQBMaterialContext) ?? (muiComponentsProp as RQBMaterialContextValue);

  const {
    valueAsArray,
    multiValueHandler,
    bigIntValueHandler,
    parseNumberMethod,
    valueListItemClassName,
    inputTypeCoerced,
  } = useValueEditor(propsForValueEditor);

  const masterKey = muiComponents ? 'mui' : 'no-mui';
  const {
    Checkbox,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Switch,
    TextareaAutosize,
    TextField,
    showInputLabels: silCtx,
  } = useMemo(() => (muiComponents ?? {}) as RQBMaterialContextValue, [muiComponents]);

  if (!muiComponents) {
    return <ValueEditor skipHook key={masterKey} {...propsForValueEditor} />;
  }

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const placeHolderText = fieldData?.placeholder ?? '';
  const showInputLabels = silProp || silCtx;

  if (
    (operator === 'between' || operator === 'notBetween') &&
    (type === 'select' || type === 'text')
  ) {
    const editors = ['From', 'To'].map((key, i) => {
      if (type === 'text') {
        return (
          <TextField
            key={key}
            variant="standard"
            type={inputTypeCoerced}
            className={valueListItemClassName}
            placeholder={placeHolderText}
            value={valueAsArray[i] ?? ''}
            disabled={disabled}
            label={showInputLabels ? key : undefined}
            onChange={e => multiValueHandler(e.target.value, i)}
            {...extraProps}
          />
        );
      }
      return (
        <SelectorComponent
          key={key}
          {...propsForValueSelector}
          title={showInputLabels ? key : undefined}
          path={path}
          level={level}
          className={valueListItemClassName}
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
      <FormControl
        key={masterKey}
        data-testid={testID}
        className={className}
        title={title}
        disabled={disabled}>
        {editors[0]}
        {separator}
        {editors[1]}
      </FormControl>
    );
  }

  switch (type) {
    case 'select':
    case 'multiselect':
      return (
        <SelectorComponent
          key={masterKey}
          {...propsForValueSelector}
          muiComponents={muiComponents}
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
          {...extraProps}
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
          {...extraProps}
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
          {...extraProps}
        />
      );

    case 'radio':
      return (
        <FormControl
          key={masterKey}
          className={className}
          title={title}
          component="fieldset"
          disabled={disabled}
          {...extraProps}>
          <RadioGroup value={value} onChange={e => handleOnChange(e.target.value)}>
            {values.map(v => (
              <FormControlLabel
                key={v.name}
                disabled={disabled}
                value={v.name}
                // oxlint-disable-next-line jsx-no-jsx-as-prop
                control={<Radio />}
                name={v.name}
                label={v.label}
              />
            ))}
          </RadioGroup>
        </FormControl>
      );
  }

  /**
   * TODO: Provide either (1) examples or (2) alternate exports that support `inputType`
   * "date", "datetime-local", and "time", with components from `@mui/x-date-pickers`
   * (`<DatePicker />`, `<DateTimePicker />`, and `<TimePicker />`, respecitively).
   */

  if (inputType === 'bigint') {
    return (
      <TextField
        key={masterKey}
        variant="standard"
        data-testid={testID}
        type={inputTypeCoerced}
        placeholder={placeHolderText}
        value={`${value}`}
        title={title}
        className={className}
        disabled={disabled}
        label={showInputLabels ? title : undefined}
        onChange={e => bigIntValueHandler(e.target.value)}
        {...extraProps}
      />
    );
  }

  return (
    <TextField
      key={masterKey}
      variant="standard"
      type={inputTypeCoerced}
      value={value}
      title={title}
      disabled={disabled}
      className={className}
      placeholder={placeHolderText}
      label={showInputLabels ? title : undefined}
      onChange={e =>
        handleOnChange(parseNumber(e.target.value, { parseNumbers: parseNumberMethod }))
      }
      {...extraProps}
    />
  );
};
