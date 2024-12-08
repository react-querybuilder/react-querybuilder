import { Checkbox, NumberInput, Radio, Switch, Textarea, TextInput } from '@mantine/core';
import type { DatesRangeValue, DateValue } from '@mantine/dates';
import { DatePickerInput, DateTimePicker } from '@mantine/dates';
import dayjs from 'dayjs';
import * as React from 'react';
import type { ValueEditorProps } from 'react-querybuilder';
import { getFirstOption, useValueEditor, ValueEditor } from 'react-querybuilder';
import { toNumberInputValue } from './utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MantineValueEditorProps = ValueEditorProps & { extraProps?: Record<string, any> };

const dateFormat = 'YYYY-MM-DD';
const dateTimeLocalFormat = `${dateFormat}THH:mm:ss`;

export const MantineValueEditor = (allProps: MantineValueEditorProps): React.JSX.Element | null => {
  const {
    fieldData,
    operator,
    value,
    handleOnChange,
    title,
    className,
    type,
    values = [],
    listsAsArrays,
    separator,
    valueSource: _vs,
    disabled,
    testID,
    selectorComponent: SelectorComponent = allProps.schema.controls.valueSelector,
    validation: _validation,
    extraProps,
    inputType: _inputType,
    parseNumbers: _parseNumbers,
    ...propsForValueSelector
  } = allProps;

  const { valueAsArray, multiValueHandler, valueListItemClassName, inputTypeCoerced } =
    useValueEditor(allProps);

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const placeHolderText = fieldData?.placeholder ?? '';

  if (
    (operator === 'between' || operator === 'notBetween') &&
    (type === 'select' || type === 'text') &&
    // Date and time ranges are handled differently in Mantine--see below
    inputTypeCoerced !== 'date'
  ) {
    const editors = ['from', 'to'].map((key, i) => {
      if (inputTypeCoerced === 'number') {
        return (
          <NumberInput
            key={key}
            placeholder={placeHolderText}
            value={toNumberInputValue(valueAsArray[i])}
            className={`${valueListItemClassName} input`}
            disabled={disabled}
            onChange={v => multiValueHandler(toNumberInputValue(v), i)}
            {...extraProps}
          />
        );
      }
      if (inputTypeCoerced === 'datetime-local') {
        const dateTime = dayjs(valueAsArray[i]);
        const dateTimeValue = dateTime.isValid() ? dateTime.toDate() : null;
        return (
          <DateTimePicker
            key={key}
            value={dateTimeValue}
            className={valueListItemClassName}
            disabled={disabled}
            withSeconds
            onChange={d =>
              multiValueHandler(
                d ? dayjs(d).format(dateTimeLocalFormat) : /* istanbul ignore next */ '',
                i
              )
            }
            {...extraProps}
          />
        );
      }
      if (type === 'text') {
        return (
          <TextInput
            key={key}
            type={inputTypeCoerced}
            placeholder={placeHolderText}
            value={valueAsArray[i] ?? ''}
            className={`${valueListItemClassName} input`}
            disabled={disabled}
            onChange={e => multiValueHandler(e.target.value, i)}
            {...extraProps}
          />
        );
      }
      return (
        <SelectorComponent
          key={key}
          {...propsForValueSelector}
          className={valueListItemClassName}
          handleOnChange={v => multiValueHandler(v, i)}
          disabled={disabled}
          value={valueAsArray[i] ?? getFirstOption(values)}
          options={values}
          listsAsArrays={listsAsArrays}
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

  switch (type) {
    case 'select':
    case 'multiselect':
      return <ValueEditor {...allProps} skipHook />;

    case 'textarea':
      return (
        <Textarea
          className={className}
          value={value}
          title={title}
          placeholder={placeHolderText}
          disabled={disabled}
          onChange={e => handleOnChange(e.target.value)}
          {...extraProps}
        />
      );

    case 'switch':
      return (
        <Switch
          className={className}
          title={title}
          checked={value}
          disabled={disabled}
          onChange={e => handleOnChange(e.target.checked)}
          {...extraProps}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          className={className}
          title={title}
          checked={value}
          disabled={disabled}
          onChange={e => handleOnChange(e.target.checked)}
          {...extraProps}
        />
      );

    case 'radio':
      return (
        <Radio.Group
          className={className}
          title={title}
          value={value}
          onChange={handleOnChange}
          {...extraProps}>
          {values.map(v => (
            <Radio key={v.name} value={v.name} label={v.label} disabled={disabled} />
          ))}
        </Radio.Group>
      );
  }

  if (inputTypeCoerced === 'date' || inputTypeCoerced === 'datetime-local') {
    if (operator === 'between' || operator === 'notBetween') {
      const twoDateArray = [null, null].map((defaultValue, i) => {
        if (!valueAsArray[i]) return defaultValue;
        let date = dayjs(valueAsArray[i]);
        if (!date.isValid()) {
          date = dayjs(`${dayjs().format('YYYY-MM-DD')}T${valueAsArray[i]}`);
        }
        return date.isValid() ? date.toDate() : defaultValue;
      }) as [DateValue, DateValue];

      return (
        <DatePickerInput
          data-testid={testID}
          type="range"
          value={twoDateArray}
          className={className}
          disabled={disabled}
          onChange={(dates: DatesRangeValue) => {
            const dateArray = dates.map(d => (d ? dayjs(d).format(dateFormat) : ''));
            handleOnChange(listsAsArrays ? dateArray : dateArray.join(','));
          }}
          {...extraProps}
        />
      );
    }

    if (inputTypeCoerced === 'datetime-local') {
      return (
        <DateTimePicker
          data-testid={testID}
          value={!!value && dayjs(value).isValid() ? dayjs(value).toDate() : null}
          className={className}
          disabled={disabled}
          withSeconds
          onChange={d =>
            handleOnChange(d ? dayjs(d).format(dateTimeLocalFormat) : /* istanbul ignore next */ '')
          }
          {...extraProps}
        />
      );
    }

    return (
      <DatePickerInput
        data-testid={testID}
        type="default"
        value={!!value && dayjs(value).isValid() ? dayjs(value).toDate() : null}
        className={className}
        disabled={disabled}
        onChange={d =>
          handleOnChange(d ? dayjs(d).format(dateFormat) : /* istanbul ignore next */ '')
        }
        {...extraProps}
      />
    );
  }

  if (inputTypeCoerced === 'number') {
    return (
      <NumberInput
        data-testid={testID}
        title={title}
        className={className}
        placeholder={placeHolderText}
        disabled={disabled}
        value={toNumberInputValue(value)}
        onChange={v => handleOnChange(toNumberInputValue(v))}
        {...extraProps}
      />
    );
  }

  return (
    <TextInput
      data-testid={testID}
      title={title}
      className={className}
      placeholder={placeHolderText}
      type={inputTypeCoerced}
      disabled={disabled}
      value={value}
      onChange={e => handleOnChange(e.target.value)}
      {...extraProps}
    />
  );
};
