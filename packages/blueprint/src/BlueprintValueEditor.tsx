import {
  Checkbox,
  FormGroup,
  InputGroup,
  NumericInput,
  Radio,
  Switch,
  TextArea,
} from '@blueprintjs/core';
import { DateInput3, DateRangeInput3, TimePrecision } from '@blueprintjs/datetime2';
import dayjs from 'dayjs';
import * as React from 'react';
import type { ValueEditorProps } from 'react-querybuilder';
import { getFirstOption, standardClassnames, useValueEditor } from 'react-querybuilder';
import { BlueprintValueSelector } from './BlueprintValueSelector';

const dateFormat = 'YYYY-MM-DD';
const dateTimeLocalFormat = `${dateFormat}THH:mm:ss`;

const minDate = dayjs().subtract(100, 'years').toDate();
const maxDate = dayjs().add(100, 'years').toDate();
const formatDate = (includeTimestamp?: boolean) => (d: Date) => {
  const s = dayjs(d);
  return s.isValid() ? s.format(includeTimestamp ? dateTimeLocalFormat : dateFormat) : '';
};
const parseDate = (s: string) => {
  const d = dayjs(s);
  return d.isValid() ? d.toDate() : null;
};

export const BlueprintValueEditor = ({
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
  selectorComponent: SelectorComponent = BlueprintValueSelector,
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
    // Date ranges are handled differently in Blueprint--see below
    inputTypeCoerced !== 'date' &&
    inputTypeCoerced !== 'datetime-local'
  ) {
    const editors = ['from', 'to'].map((key, i) => {
      if (inputTypeCoerced === 'number') {
        return (
          <NumericInput
            key={key}
            placeholder={placeHolderText}
            value={valueAsArray[i]}
            className={`${standardClassnames.valueListItem} input`}
            disabled={disabled}
            onChange={v => multiValueHandler(v, i)}
          />
        );
      }
      if (type === 'text') {
        return (
          <InputGroup
            key={key}
            type={inputTypeCoerced}
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
        <TextArea
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
          onChange={e => handleOnChange((e.target as HTMLInputElement).checked)}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          className={className}
          title={title}
          checked={value}
          disabled={disabled}
          onChange={e => handleOnChange((e.target as HTMLInputElement).checked)}
        />
      );

    case 'radio':
      return (
        <FormGroup className={className}>
          {values.map(v => (
            <Radio key={v.name} value={v.name} label={v.label} disabled={disabled} />
          ))}
        </FormGroup>
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
      }) as [Date, Date];

      return (
        <DateRangeInput3
          data-testid={testID}
          timePrecision={inputTypeCoerced === 'datetime-local' ? TimePrecision.MINUTE : undefined}
          minDate={minDate}
          maxDate={maxDate}
          value={twoDateArray}
          className={className}
          disabled={disabled}
          placeholder={placeHolderText}
          formatDate={formatDate(inputTypeCoerced === 'datetime-local')}
          parseDate={parseDate}
          onChange={dates => {
            const dateArray = dates.map(d => (d ? dayjs(d).format(dateFormat) : ''));
            handleOnChange(listsAsArrays ? dateArray : dateArray.join(','));
          }}
        />
      );
    }

    if (inputTypeCoerced === 'datetime-local') {
      return (
        <DateInput3
          data-testid={testID}
          timePrecision={TimePrecision.MINUTE}
          minDate={minDate}
          maxDate={maxDate}
          value={value}
          className={className}
          disabled={disabled}
          placeholder={placeHolderText}
          formatDate={formatDate(inputTypeCoerced === 'datetime-local')}
          parseDate={parseDate}
          onChange={d =>
            handleOnChange(d ? dayjs(d).format(dateTimeLocalFormat) : /* istanbul ignore next */ '')
          }
        />
      );
    }

    return (
      <DateInput3
        data-testid={testID}
        minDate={minDate}
        maxDate={maxDate}
        value={value}
        className={className}
        disabled={disabled}
        placeholder={placeHolderText}
        formatDate={formatDate()}
        parseDate={parseDate}
        onChange={d =>
          handleOnChange(d ? dayjs(d).format(dateFormat) : /* istanbul ignore next */ '')
        }
      />
    );
  }

  if (inputTypeCoerced === 'number') {
    return (
      <NumericInput
        data-testid={testID}
        title={title}
        className={className}
        placeholder={placeHolderText}
        disabled={disabled}
        value={value}
        onChange={v => handleOnChange(v)}
      />
    );
  }

  return (
    <InputGroup
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

BlueprintValueEditor.displayName = 'BlueprintValueEditor';
