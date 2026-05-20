import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton } from 'primereact/radiobutton';
import * as React from 'react';
import type { ValueEditorProps } from 'react-querybuilder';
import { joinWith, useValueEditor, ValueEditor } from 'react-querybuilder';

/**
 * @group Props
 */
export interface PrimeValueEditorProps extends ValueEditorProps {
  extraProps?: Record<string, unknown>;
}

// Format date as YYYY-MM-DD
const formatDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Format datetime as YYYY-MM-DD HH:mm:ss
const formatDateTime = (d: Date): string => {
  const date = formatDate(d);
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${date} ${h}:${min}:${s}`;
};

// Format time as HH:mm:ss
const formatTime = (d: Date): string => {
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${min}:${s}`;
};

// Parse date string to Date object
const parseDate = (v: string): Date | null => {
  if (!v) return null;
  const d = new Date(v);
  /* v8 ignore start -- @preserve */
  return Number.isNaN(d.getTime()) ? null : d;
  /* v8 ignore stop -- @preserve */
};

// Parse time string "HH:mm:ss" to Date object
const parseTime = (v: string): Date | null => {
  /* v8 ignore start -- @preserve */
  if (!v) return null;
  const parts = v.split(':');
  if (parts.length < 2) return null;
  const d = new Date();
  d.setHours(
    Number.parseInt(parts[0], 10),
    Number.parseInt(parts[1], 10),
    Number.parseInt(parts[2] ?? '0', 10),
    0
  );
  return Number.isNaN(d.getTime()) ? null : d;
  /* v8 ignore stop -- @preserve */
};

/**
 * @group Components
 */
export const PrimeValueEditor = (allProps: PrimeValueEditorProps): React.JSX.Element | null => {
  const {
    fieldData,
    operator,
    value,
    handleOnChange,
    title,
    className,
    type,
    inputType,
    values = [],
    listsAsArrays,
    separator,
    valueSource: _vs,
    disabled,
    testID,
    selectorComponent: SelectorComponent = allProps.schema.controls.valueSelector,
    extraProps,
    parseNumbers: _parseNumbers,
    ...propsForValueSelector
  } = allProps;

  const {
    valueAsArray,
    multiValueHandler,
    bigIntValueHandler,
    valueListItemClassName,
    inputTypeCoerced,
  } = useValueEditor(allProps);

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const placeHolderText = fieldData?.placeholder ?? '';

  if (
    (operator === 'between' || operator === 'notBetween') &&
    (type === 'select' || type === 'text') &&
    inputTypeCoerced !== 'date' &&
    inputTypeCoerced !== 'datetime-local'
  ) {
    if (type === 'text') {
      const editors = ['from', 'to'].map((key, i) => {
        if (inputTypeCoerced === 'time') {
          return (
            <Calendar
              key={key}
              timeOnly
              value={parseTime(valueAsArray[i])}
              className={valueListItemClassName}
              disabled={disabled}
              placeholder={placeHolderText}
              onChange={e => {
                const d = e.value as Date | null;
                /* v8 ignore start -- @preserve */
                multiValueHandler(d ? formatTime(d) : '', i);
                /* v8 ignore stop -- @preserve */
              }}
              {...extraProps}
            />
          );
        }
        return (
          <InputText
            key={key}
            type={inputTypeCoerced}
            value={valueAsArray[i] ?? ''}
            className={valueListItemClassName}
            disabled={disabled}
            placeholder={placeHolderText}
            onChange={e => multiValueHandler(e.target.value, i)}
            {...extraProps}
          />
        );
      });
      return (
        <span data-testid={testID} className={className} title={title}>
          {editors[0]}
          {separator}
          {editors[1]}
        </span>
      );
    }

    return <ValueEditor {...allProps} skipHook />;
  }

  switch (type) {
    case 'select':
    case 'multiselect':
      return (
        <SelectorComponent
          {...propsForValueSelector}
          className={className}
          title={title}
          value={value}
          disabled={disabled}
          listsAsArrays={listsAsArrays}
          multiple={type === 'multiselect'}
          handleOnChange={handleOnChange}
          options={values}
          {...extraProps}
        />
      );

    case 'textarea':
      return (
        <InputTextarea
          value={value}
          title={title}
          className={className}
          disabled={disabled}
          placeholder={placeHolderText}
          onChange={e => handleOnChange(e.target.value)}
          {...extraProps}
        />
      );

    case 'switch':
      return (
        <InputSwitch
          checked={!!value}
          title={title}
          className={className}
          disabled={disabled}
          onChange={e => handleOnChange(e.value)}
          {...extraProps}
        />
      );

    case 'checkbox':
      return (
        <span title={title} className={className}>
          <Checkbox
            disabled={disabled}
            onChange={e => handleOnChange(e.checked)}
            checked={!!value}
            {...extraProps}
          />
        </span>
      );

    case 'radio':
      return (
        <span className={className} title={title}>
          {values.map(v => (
            <span key={v.name}>
              <RadioButton
                inputId={v.name}
                value={v.name}
                checked={value === v.name}
                disabled={disabled}
                onChange={e => handleOnChange(e.value)}
                {...extraProps}
              />
              <label htmlFor={v.name}>{v.label}</label>
            </span>
          ))}
        </span>
      );
  }

  switch (inputTypeCoerced) {
    case 'date':
    case 'datetime-local': {
      if (operator === 'between' || operator === 'notBetween') {
        const dateArray = valueAsArray.slice(0, 2).map((v: string) => parseDate(v));
        /* v8 ignore start -- @preserve */
        const rangeValue = dateArray[0] && dateArray[1] ? (dateArray as [Date, Date]) : null;
        /* v8 ignore stop -- @preserve */
        return (
          <Calendar
            selectionMode="range"
            value={rangeValue}
            showTime={inputTypeCoerced === 'datetime-local'}
            className={className}
            disabled={disabled}
            placeholder={placeHolderText}
            onChange={e => {
              /* v8 ignore start -- @preserve */
              const dates = e.value as Date[] | null;
              if (dates && dates.length === 2 && dates[0] && dates[1]) {
                const fmt = inputTypeCoerced === 'datetime-local' ? formatDateTime : formatDate;
                const formatted = dates.map(d => fmt(d));
                handleOnChange(listsAsArrays ? formatted : joinWith(formatted, ','));
              }
              /* v8 ignore stop -- @preserve */
            }}
            {...extraProps}
          />
        );
      }

      const dateValue = parseDate(value);
      return (
        <Calendar
          value={dateValue}
          showTime={inputTypeCoerced === 'datetime-local'}
          className={className}
          disabled={disabled}
          placeholder={placeHolderText}
          onChange={e => {
            const d = e.value as Date | null;
            /* v8 ignore else -- @preserve */
            if (d) {
              handleOnChange(
                inputTypeCoerced === 'datetime-local' ? formatDateTime(d) : formatDate(d)
              );
            }
          }}
          {...extraProps}
        />
      );
    }

    case 'time': {
      const timeValue = parseTime(value);
      return (
        <Calendar
          timeOnly
          value={timeValue}
          className={className}
          disabled={disabled}
          placeholder={placeHolderText}
          onChange={e => {
            const d = e.value as Date | null;
            handleOnChange(
              d ? formatTime(d) : /* v8 ignore start -- @preserve */ ''
              /* v8 ignore stop -- @preserve */
            );
          }}
          {...extraProps}
        />
      );
    }
  }

  if (inputType === 'bigint') {
    return (
      <InputText
        data-testid={testID}
        type={inputTypeCoerced}
        placeholder={placeHolderText}
        value={`${value}`}
        title={title}
        className={className}
        disabled={disabled}
        onChange={e => bigIntValueHandler(e.target.value)}
        {...extraProps}
      />
    );
  }

  return (
    <InputText
      type={inputTypeCoerced}
      value={value}
      title={title}
      className={className}
      disabled={disabled}
      placeholder={placeHolderText}
      onChange={e => handleOnChange(e.target.value)}
      {...extraProps}
    />
  );
};
