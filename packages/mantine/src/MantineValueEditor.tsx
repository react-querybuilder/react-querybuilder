import { Checkbox, NumberInput, Radio, Switch, Textarea, TextInput } from '@mantine/core';
import { DatePickerInput, DateTimePicker } from '@mantine/dates';
import dayjs from 'dayjs';
import type { ValueEditorProps } from 'react-querybuilder';
import { getFirstOption, standardClassnames, useValueEditor } from 'react-querybuilder';
import { MantineValueSelector } from './MantineValueSelector';

const dateFormat = 'YYYY-MM-DD';
const dateTimeLocalFormat = `${dateFormat}THH:mm:ss`;

export const MantineValueEditor = ({
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
  selectorComponent: SelectorComponent = MantineValueSelector,
  validation: _validation,
  ...props
}: ValueEditorProps) => {
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
  const inputTypeCoerced = ['in', 'notIn'].includes(operator) ? 'text' : inputType || 'text';

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
            type={inputTypeCoerced || 'text'}
            placeholder={placeHolderText}
            value={valueAsArray[i] ?? ''}
            className={`${standardClassnames.valueListItem} input`}
            data-disabled={disabled}
            disabled={disabled}
            onChange={v => multiValueHandler(v, i)}
          />
        );
      }
      if (inputTypeCoerced === 'datetime-local') {
        return (
          <DateTimePicker
            key={key}
            value={
              valueAsArray[i] && dayjs(valueAsArray[i]).isValid()
                ? dayjs(valueAsArray[i]).toDate()
                : null
            }
            className={standardClassnames.valueListItem}
            data-disabled={disabled}
            disabled={disabled}
            placeholder={placeHolderText}
            onChange={d =>
              handleOnChange(dayjs(d).isValid() ? dayjs(d).format(dateTimeLocalFormat) : '')
            }
          />
          //   onChange={v => multiValueHandler(v, i)}
        );
      }
      if (type === 'text') {
        return (
          <TextInput
            key={key}
            type={inputTypeCoerced || 'text'}
            placeholder={placeHolderText}
            value={valueAsArray[i] ?? ''}
            className={`${standardClassnames.valueListItem} input`}
            data-disabled={disabled}
            disabled={disabled}
            onChange={e => multiValueHandler(e.target.value, i)}
          />
        );
      }
      return (
        <SelectorComponent
          key={key}
          {...props}
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
          data-disabled={disabled}
          disabled={disabled}
          onChange={e => handleOnChange(e.target.value)}
        />
      );

    case 'switch':
      return (
        <Switch
          className={className}
          title={title}
          checked={value}
          data-disabled={disabled}
          disabled={disabled}
          onChange={e => handleOnChange(e.target.checked)}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          className={className}
          title={title}
          checked={value}
          data-disabled={disabled}
          disabled={disabled}
          onChange={e => handleOnChange(e.target.checked)}
        />
      );

    case 'radio':
      return (
        <Radio.Group className={className} title={title} value={value} onChange={handleOnChange}>
          {values.map(v => (
            <Radio
              key={v.name}
              value={v.name}
              label={v.label}
              data-disabled={disabled}
              disabled={disabled}
            />
          ))}
        </Radio.Group>
      );
  }

  if (inputTypeCoerced === 'date' || inputTypeCoerced === 'datetime-local') {
    if (operator === 'between' || operator === 'notBetween') {
      const twoDateArray = [null, null].map((_d, i) => {
        if (!valueAsArray[i]) return null;
        let date = dayjs(valueAsArray[i]);
        if (!date.isValid()) {
          date = dayjs(`${dayjs().format('YYYY-MM-DD')}T${valueAsArray[i]}`);
        }
        return date.isValid() ? date.toDate() : null;
      }) as [Date | null, Date | null];

      return (
        <DatePickerInput
          data-testid={testID}
          type="range"
          value={twoDateArray}
          className={className}
          data-disabled={disabled}
          disabled={disabled}
          placeholder={placeHolderText}
          onChange={dates => {
            const dateArray = dates
              .map(d => dayjs(d))
              .map(d =>
                d.isValid()
                  ? d.format(
                      inputTypeCoerced === 'datetime-local' ? dateTimeLocalFormat : dateFormat
                    )
                  : null
              );
            handleOnChange(listsAsArrays ? dateArray : dateArray.join(','));
          }}
        />
      );
    }

    if (inputTypeCoerced === 'datetime-local') {
      return (
        <DateTimePicker
          data-testid={testID}
          value={value && dayjs(value).isValid() ? dayjs(value).toDate() : null}
          className={className}
          data-disabled={disabled}
          disabled={disabled}
          placeholder={placeHolderText}
          onChange={d =>
            handleOnChange(dayjs(d).isValid() ? dayjs(d).format(dateTimeLocalFormat) : '')
          }
        />
      );
    }

    return (
      <DatePickerInput
        data-testid={testID}
        type="default"
        value={value && dayjs(value).isValid() ? dayjs(value).toDate() : null}
        className={className}
        data-disabled={disabled}
        disabled={disabled}
        placeholder={placeHolderText}
        onChange={d => handleOnChange(dayjs(d).isValid() ? dayjs(d).format(dateFormat) : '')}
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
        type={inputTypeCoerced}
        data-disabled={disabled}
        disabled={disabled}
        value={value}
        onChange={v => handleOnChange(v)}
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
      data-disabled={disabled}
      disabled={disabled}
      value={value}
      onChange={e => handleOnChange(e.target.value)}
    />
  );
};

MantineValueEditor.displayName = 'MantineValueEditor';
