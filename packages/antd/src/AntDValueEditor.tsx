import { Checkbox, Input, Radio, Switch } from 'antd';
import generatePicker from 'antd/es/date-picker/generatePicker/index.js';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import * as React from 'react';
import type { ValueEditorProps } from 'react-querybuilder';
import { getFirstOption, joinWith, standardClassnames, useValueEditor } from 'react-querybuilder';
import dayjsGenerateConfig from './dayjs';

type AntDValueEditorProps = ValueEditorProps & { extraProps?: Record<string, any> };

const DatePicker = generatePicker(dayjsGenerateConfig);

export const AntDValueEditor = (allProps: AntDValueEditorProps) => {
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
    selectorComponent: SelectorComponent = allProps.schema.controls.valueSelector,
    extraProps,
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
  const inputTypeCoerced = ['in', 'notIn'].includes(operator) ? 'text' : inputType || 'text';

  if (
    (operator === 'between' || operator === 'notBetween') &&
    (type === 'select' || type === 'text') &&
    // Date ranges are handled differently in AntD--see below
    inputTypeCoerced !== 'date' &&
    inputTypeCoerced !== 'datetime-local'
  ) {
    const editors = ['from', 'to'].map((key, i) => {
      if (type === 'text') {
        if (inputTypeCoerced === 'time') {
          return (
            <DatePicker.TimePicker
              key={key}
              value={valueAsArray[i] ? dayjs(valueAsArray[i], 'HH:mm:ss') : null}
              className={standardClassnames.valueListItem}
              disabled={disabled}
              placeholder={placeHolderText}
              onChange={d => multiValueHandler(d?.format('HH:mm:ss') ?? '', i)}
              {...extraProps}
            />
          );
        }
        return (
          <Input
            key={key}
            type={inputTypeCoerced}
            value={valueAsArray[i] ?? ''}
            className={standardClassnames.valueListItem}
            disabled={disabled}
            placeholder={placeHolderText}
            onChange={e => multiValueHandler(e.target.value, i)}
            {...extraProps}
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
          className={className}
          handleOnChange={handleOnChange}
          options={values}
          value={value}
          title={title}
          disabled={disabled}
          multiple={type === 'multiselect'}
          listsAsArrays={listsAsArrays}
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
        const dayjsArray = valueAsArray.slice(0, 2).map(dayjs) as [Dayjs, Dayjs];
        return (
          <DatePicker.RangePicker
            value={dayjsArray.every(d => d.isValid()) ? dayjsArray : undefined}
            showTime={inputTypeCoerced === 'datetime-local'}
            className={className}
            disabled={disabled}
            placeholder={[placeHolderText, placeHolderText]}
            // TODO: the function below is currently untested (see the
            // "should render a date range picker" test in ./AntD.test.tsx)
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

AntDValueEditor.displayName = 'AntDValueEditor';
