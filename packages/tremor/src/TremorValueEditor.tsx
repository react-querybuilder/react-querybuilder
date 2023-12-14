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
import {
  ValueEditor,
  getFirstOption,
  standardClassnames,
  useValueEditor,
} from 'react-querybuilder';
import { TremorValueSelector } from './TremorValueSelector';

const dateFormat = 'YYYY-MM-DD';
// const dateTimeLocalFormat = `${dateFormat}THH:mm:ss`;

const ClearableValueSelector = (props: VersatileSelectorProps) => {
  return <TremorValueSelector {...props} enableClear />;
};

export const TremorValueEditor = (allProps: ValueEditorProps) => {
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
    parseNumbers,
    separator,
    valueSource: _vs,
    disabled,
    testID,
    selectorComponent: SelectorComponent = ClearableValueSelector,
    validation: _validation,
    ...props
  } = allProps;

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

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const placeHolderText = fieldData?.placeholder ?? '';
  const inputTypeCoerced = (
    ['in', 'notIn'].includes(operator) ? 'text' : inputType || 'text'
  ) as TextInputProps['type'];

  if (
    (operator === 'between' || operator === 'notBetween') &&
    (type === 'select' || type === 'text') &&
    // Date and time ranges are handled differently in Tremor--see below
    (inputTypeCoerced as string) !== 'date'
  ) {
    const editors = ['from', 'to'].map((key, i) => {
      if (type === 'text') {
        return (
          <TextInput
            key={key}
            type={inputTypeCoerced}
            placeholder={placeHolderText}
            value={valueAsArray[i] ?? ''}
            className={`${standardClassnames.valueListItem} input`}
            disabled={disabled}
            onValueChange={v => multiValueHandler(v, i)}
          />
        );
      }
      return (
        <SelectorComponent
          {...props}
          key={key}
          className={standardClassnames.valueListItem}
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
      return (
        <SelectorComponent
          {...props}
          title={title}
          className={className}
          handleOnChange={handleOnChange}
          options={values}
          value={value}
          disabled={disabled}
          multiple={type === 'multiselect'}
          listsAsArrays={listsAsArrays}
        />
      );

    case 'textarea':
      return (
        <Textarea
          className={className}
          value={value}
          title={title}
          placeholder={placeHolderText}
          disabled={disabled}
          onValueChange={handleOnChange}
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
        />
      );

    case 'checkbox':
    case 'radio':
      return (
        <ValueEditor
          {...{
            fieldData,
            operator,
            value,
            handleOnChange,
            title,
            className,
            type,
            inputType,
            values,
            listsAsArrays,
            parseNumbers,
            separator,
            valueSource: _vs,
            disabled,
            testID,
          }}
          {...props}
        />
      );
  }

  if ((inputTypeCoerced as string) === 'date') {
    if (operator === 'between' || operator === 'notBetween') {
      const twoDateArray = [null, null].map((defaultValue, i) => {
        if (!valueAsArray[i]) return defaultValue;
        let date = dayjs(valueAsArray[i]);
        if (!date.isValid()) {
          date = dayjs(`${dayjs().format('YYYY-MM-DD')}T${valueAsArray[i]}`);
        }
        return date.isValid() ? date.toDate() : defaultValue;
      }) as [DatePickerValue, DatePickerValue];

      return (
        <DateRangePicker
          data-testid={testID}
          value={{ from: twoDateArray[0], to: twoDateArray[1] }}
          className={className}
          disabled={disabled}
          placeholder={placeHolderText}
          enableSelect={false}
          onValueChange={dates => {
            const dateArray = [dates.from, dates.to].map(d =>
              d ? dayjs(d).format(dateFormat) : ''
            );
            handleOnChange(listsAsArrays ? dateArray : dateArray.join(','));
          }}
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
        value={!!value && dayjs(value).isValid() ? dayjs(value).toDate() : undefined}
        onValueChange={d =>
          handleOnChange(d ? dayjs(d).format(dateFormat) : /* istanbul ignore next */ '')
        }
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
      onValueChange={handleOnChange}
    />
  );
};

TremorValueEditor.displayName = 'TremorValueEditor';
