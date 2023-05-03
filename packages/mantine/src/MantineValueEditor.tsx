import { Checkbox, Radio, Switch, Textarea, TextInput } from '@mantine/core';
import { DatePicker, DateRangePicker, TimeInput, TimeRangeInput } from '@mantine/dates';
import dayjs from 'dayjs';
import * as React from 'react';
import type { ValueEditorProps } from 'react-querybuilder';
import { getFirstOption, standardClassnames, useValueEditor } from 'react-querybuilder';
import { MantineValueSelector } from './MantineValueSelector';

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
    inputTypeCoerced !== 'date' &&
    inputTypeCoerced !== 'datetime-local' &&
    inputTypeCoerced !== 'time'
  ) {
    const editors = ['from', 'to'].map((key, i) => {
      if (type === 'text') {
        return (
          <TextInput
            key={key}
            type={inputType || 'text'}
            placeholder={placeHolderText}
            value={valueAsArray[i] ?? ''}
            className={`${standardClassnames.valueListItem} input`}
            disabled={disabled}
            onChange={e => multiValueHandler(e.target.value, i)}
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
          onChange={e => handleOnChange(e.target.value)}
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
        />
      );

    case 'radio':
      return (
        <Radio.Group className={className} title={title} value={value} onChange={handleOnChange}>
          {values.map(v => (
            <Radio key={v.name} value={v.name} label={v.label} disabled={disabled} />
          ))}
        </Radio.Group>
      );
  }

  if (
    inputTypeCoerced === 'date' ||
    inputTypeCoerced === 'datetime-local' ||
    inputTypeCoerced === 'time'
  ) {
    const dateFormat = `YYYY-MM-DD${inputTypeCoerced === 'datetime-local' ? 'THH:mm:ss' : ''}`;

    if (operator === 'between' || operator === 'notBetween') {
      const twoDateArray = [null, null].map((_d, i) => {
        if (!valueAsArray[i]) return null;
        let date = dayjs(valueAsArray[i]);
        if (!date.isValid()) {
          date = dayjs(`${dayjs().format('YYYY-MM-DD')}T${valueAsArray[i]}`);
        }
        return date.isValid() ? date.toDate() : null;
      }) as [Date | null, Date | null];

      switch (inputTypeCoerced) {
        case 'date':
        case 'datetime-local':
          return (
            <DateRangePicker
              data-testid={testID}
              value={twoDateArray}
              className={className}
              disabled={disabled}
              placeholder={placeHolderText}
              onChange={dates => {
                const dateArray = dates
                  .map(d => dayjs(d))
                  .map(d => (d.isValid() ? d.format(dateFormat) : null));
                handleOnChange(listsAsArrays ? dateArray : dateArray.join(','));
              }}
            />
          );

        case 'time':
          return (
            <TimeRangeInput
              data-testid={testID}
              value={twoDateArray}
              className={className}
              disabled={disabled}
              placeholder={placeHolderText}
              onChange={dates => {
                const dateArray = dates
                  .map(d => (d ? dayjs(d) : null))
                  .map(d => (d && d.isValid() ? d.format('HH:mm:ss') : null));
                handleOnChange(listsAsArrays ? dateArray : dateArray.join(','));
              }}
            />
          );
      }
    }

    switch (inputTypeCoerced) {
      case 'date':
      case 'datetime-local':
        return (
          <DatePicker
            data-testid={testID}
            value={value && dayjs(value).isValid() ? dayjs(value).toDate() : null}
            className={className}
            disabled={disabled}
            placeholder={placeHolderText}
            onChange={d => handleOnChange(dayjs(d).isValid() ? dayjs(d).format(dateFormat) : '')}
          />
        );

      case 'time':
        return (
          <TimeInput
            data-testid={testID}
            value={
              value
                ? dayjs(`${dayjs().format('YYYY-MM-DD')}T${value}`).isValid()
                  ? dayjs(`${dayjs().format('YYYY-MM-DD')}T${value}`).toDate()
                  : dayjs(value).isValid()
                  ? dayjs(value).toDate()
                  : null
                : null
            }
            className={className}
            disabled={disabled}
            placeholder={placeHolderText}
            onChange={d => handleOnChange(dayjs(d).format('HH:mm:ss'))}
          />
        );
    }
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
    />
  );
};

MantineValueEditor.displayName = 'MantineValueEditor';
