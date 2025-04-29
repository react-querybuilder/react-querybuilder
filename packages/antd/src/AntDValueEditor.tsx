import { Checkbox, Input, InputNumber, Radio, Switch } from 'antd';
import generatePicker from 'antd/es/date-picker/generatePicker/index.js';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import * as React from 'react';
import type { ValueEditorProps } from 'react-querybuilder';
import { joinWith, useValueEditor, ValueEditor } from 'react-querybuilder';
import dayjsGenerateConfig from './dayjs';

/**
 * @group Props
 */
export interface AntDValueEditorProps extends ValueEditorProps {
  extraProps?: Record<string, unknown>;
}

const DatePicker = generatePicker(dayjsGenerateConfig);

/**
 * @group Components
 */
export const AntDValueEditor = (allProps: AntDValueEditorProps): React.JSX.Element | null => {
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
    // Date ranges are handled differently in AntD--see below
    inputTypeCoerced !== 'date' &&
    inputTypeCoerced !== 'datetime-local'
  ) {
    if (type === 'text') {
      const editors = ['from', 'to'].map((key, i) => {
        if (inputTypeCoerced === 'time') {
          return (
            <DatePicker.TimePicker
              key={key}
              value={valueAsArray[i] ? dayjs(valueAsArray[i], 'HH:mm:ss') : null}
              className={valueListItemClassName}
              disabled={disabled}
              placeholder={placeHolderText}
              onChange={d => multiValueHandler(d?.format('HH:mm:ss') ?? '', i)}
              {...extraProps}
            />
          );
        } else if (inputTypeCoerced === 'number') {
          return (
            <InputNumber
              key={key}
              type={inputTypeCoerced}
              value={valueAsArray[i] ?? ''}
              className={valueListItemClassName}
              disabled={disabled}
              placeholder={placeHolderText}
              onChange={v => multiValueHandler(v, i)}
              {...extraProps}
            />
          );
        }
        return (
          <Input
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
        <Input.TextArea
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
        <Switch
          checked={!!value}
          title={title}
          className={className}
          disabled={disabled}
          onChange={v => handleOnChange(v)}
          {...extraProps}
        />
      );

    case 'checkbox':
      return (
        <span title={title} className={className}>
          <Checkbox
            type="checkbox"
            disabled={disabled}
            onChange={e => handleOnChange(e.target.checked)}
            checked={!!value}
            {...extraProps}
          />
        </span>
      );

    case 'radio':
      return (
        <span className={className} title={title}>
          {values.map(v => (
            <Radio
              key={v.name}
              value={v.name}
              checked={value === v.name}
              disabled={disabled}
              onChange={e => handleOnChange(e.target.value)}
              {...extraProps}>
              {v.label}
            </Radio>
          ))}
        </span>
      );
  }

  switch (inputTypeCoerced) {
    case 'date':
    case 'datetime-local': {
      if (operator === 'between' || operator === 'notBetween') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dayjsArray = valueAsArray.slice(0, 2).map((v: any) => dayjs(v)) as [Dayjs, Dayjs];
        return (
          <DatePicker.RangePicker
            value={dayjsArray.every(d => d.isValid()) ? dayjsArray : undefined}
            showTime={inputTypeCoerced === 'datetime-local'}
            className={className}
            disabled={disabled}
            placeholder={[placeHolderText, placeHolderText]}
            // TODO: the function below is currently untested (see the
            // "renders a date range picker" test in ./AntD.test.tsx)
            onChange={
              /* istanbul ignore next */
              dates => {
                const timeFormat = inputTypeCoerced === 'datetime-local' ? 'THH:mm:ss' : '';
                const format = `YYYY-MM-DD${timeFormat}`;
                const dateArray = dates?.map(d => (d?.isValid() ? d.format(format) : undefined));
                handleOnChange(
                  dateArray ? (listsAsArrays ? dateArray : joinWith(dateArray, ',')) : dates
                );
              }
            }
            {...extraProps}
          />
        );
      }

      const dateValue = dayjs(value);
      return (
        <DatePicker
          value={dateValue.isValid() ? dateValue : undefined}
          showTime={inputTypeCoerced === 'datetime-local'}
          className={className}
          disabled={disabled}
          placeholder={placeHolderText}
          onChange={(_d, dateString) => handleOnChange(dateString)}
          {...extraProps}
        />
      );
    }

    case 'time': {
      const dateValue = dayjs(value, 'HH:mm:ss');
      return (
        <DatePicker.TimePicker
          value={dateValue.isValid() ? dateValue : undefined}
          className={className}
          disabled={disabled}
          placeholder={placeHolderText}
          onChange={d => handleOnChange(d?.format('HH:mm:ss') ?? '')}
          {...extraProps}
        />
      );
    }

    case 'number': {
      return (
        <InputNumber
          type={inputTypeCoerced}
          value={value}
          title={title}
          className={className}
          disabled={disabled}
          placeholder={placeHolderText}
          onChange={handleOnChange}
          {...extraProps}
        />
      );
    }
  }

  return (
    <Input
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
