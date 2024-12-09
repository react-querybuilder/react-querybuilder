import type { DatePickerValue, TextInputProps } from '@tremor/react';
import {
  DatePicker,
  DateRangePicker,
  NumberInput,
  Switch,
  TextInput,
  Textarea,
} from '@tremor/react';
import dayjs from 'dayjs';
import * as React from 'react';
import type { ValueEditorProps, VersatileSelectorProps } from 'react-querybuilder';
import { ValueEditor, useValueEditor } from 'react-querybuilder';
import { TremorValueSelector } from './TremorValueSelector';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TremorValueEditorProps = ValueEditorProps & { extraProps?: Record<string, any> };

const dateFormat = 'YYYY-MM-DD';
// const dateTimeLocalFormat = `${dateFormat}THH:mm:ss`;

const ClearableValueSelector = (props: VersatileSelectorProps) => (
  <TremorValueSelector {...props} enableClear />
);

export const TremorValueEditor = (allProps: TremorValueEditorProps): React.JSX.Element | null => {
  const {
    fieldData,
    operator,
    value,
    handleOnChange,
    title,
    className,
    type,
    values: _v,
    listsAsArrays,
    parseNumbers: _parseNumbers,
    separator,
    valueSource: _vs,
    disabled,
    testID,
    selectorComponent = ClearableValueSelector,
    inputType: _inputType,
    validation: _validation,
    extraProps,
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
    // Date and time ranges are handled differently in Tremor--see below
    (inputTypeCoerced as string) !== 'date'
  ) {
    if (type === 'text') {
      const editors = ['from', 'to'].map((key, i) => {
        return (
          <TextInput
            key={key}
            type={inputTypeCoerced as TextInputProps['type']}
            placeholder={placeHolderText}
            value={valueAsArray[i] ?? ''}
            className={`${valueListItemClassName} input`}
            disabled={disabled}
            onValueChange={v => multiValueHandler(v, i)}
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

    return <ValueEditor {...allProps} skipHook selectorComponent={selectorComponent} />;
  }

  switch (type) {
    case 'select':
    case 'multiselect':
      return <ValueEditor {...allProps} skipHook selectorComponent={selectorComponent} />;

    case 'textarea':
      return (
        <Textarea
          className={className}
          value={value}
          title={title}
          placeholder={placeHolderText}
          disabled={disabled}
          onValueChange={handleOnChange}
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
          onChange={handleOnChange}
          {...extraProps}
        />
      );

    case 'checkbox':
    case 'radio':
      return <ValueEditor {...allProps} skipHook />;
  }

  if ((inputTypeCoerced as string) === 'date') {
    if (operator === 'between' || operator === 'notBetween') {
      const twoDateArray = [null, null].map((defaultValue, i) => {
        if (!valueAsArray[i]) return defaultValue;
        let date = dayjs(valueAsArray[i]);
        if (!date.isValid()) {
          date = dayjs(`${dayjs().format('YYYY-MM-DD')}`);
        }
        return date.toDate();
      }) as [DatePickerValue, DatePickerValue];

      return (
        <DateRangePicker
          data-testid={testID}
          value={{ from: twoDateArray[0], to: twoDateArray[1] }}
          className={className}
          disabled={disabled}
          placeholder={placeHolderText}
          enableSelect={false}
          enableClear
          onValueChange={dates => {
            const dateArray = [dates.from, dates.to].map(d =>
              d ? dayjs(d).format(dateFormat) : ''
            );
            handleOnChange(listsAsArrays ? dateArray : dateArray.join(','));
          }}
          {...extraProps}
        />
      );
    }

    return (
      <DatePicker
        data-testid={testID}
        title={title}
        className={className}
        placeholder={placeHolderText}
        disabled={disabled}
        enableClear
        value={!!value && dayjs(value).isValid() ? dayjs(value).toDate() : undefined}
        onValueChange={d =>
          handleOnChange(d ? dayjs(d).format(dateFormat) : /* istanbul ignore next */ '')
        }
        {...extraProps}
      />
    );
  }

  if ((inputTypeCoerced as string) === 'number') {
    return (
      <NumberInput
        data-testid={testID}
        title={title}
        className={className}
        placeholder={placeHolderText}
        disabled={disabled}
        value={value}
        onValueChange={handleOnChange}
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
      type={inputTypeCoerced as TextInputProps['type']}
      disabled={disabled}
      value={value}
      onValueChange={handleOnChange}
      {...extraProps}
    />
  );
};
