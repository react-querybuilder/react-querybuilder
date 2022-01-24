import { Checkbox, DatePicker, Input, Radio, TimePicker } from 'antd';
import moment from 'moment';
import { useEffect } from 'react';
import type { ValueEditorProps } from 'react-querybuilder';
import AntDValueSelector from './AntDValueSelector';

const AntDValueEditor = ({
  fieldData,
  operator,
  value,
  handleOnChange,
  title,
  className,
  type,
  inputType,
  values,
  disabled,
  ...props
}: ValueEditorProps) => {
  useEffect(() => {
    if (
      inputType === 'number' &&
      !['between', 'notBetween', 'in', 'notIn'].includes(operator) &&
      typeof value === 'string' &&
      value.includes(',')
    ) {
      handleOnChange('');
    }
  }, [inputType, operator, value, handleOnChange]);

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const placeHolderText = fieldData?.placeholder ?? '';
  const inputTypeCoerced =
    ['between', 'notBetween', 'in', 'notIn'].includes(operator) &&
    // This next line is not in the default ValueEditor -- we can use
    // antd's RangePicker to handle "between" and "notBetween".
    !['date', 'datetime-local'].includes(`${inputType}`)
      ? 'text'
      : inputType || 'text';

  switch (type) {
    case 'select':
      return (
        <AntDValueSelector
          {...props}
          className={className}
          handleOnChange={handleOnChange}
          options={values!}
          value={value}
          title={title}
          disabled={disabled}
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
          />
        </span>
      );

    case 'radio':
      return (
        <span className={className} title={title}>
          {values!.map(v => (
            <Radio
              key={v.name}
              value={v.name}
              checked={value === v.name}
              disabled={disabled}
              onChange={e => handleOnChange(e.target.value)}>
              {v.label}
            </Radio>
          ))}
        </span>
      );
  }

  switch (inputTypeCoerced) {
    case 'textarea':
      return (
        <Input.TextArea
          value={value}
          title={title}
          className={className}
          disabled={disabled}
          placeholder={placeHolderText}
          onChange={e => handleOnChange(e.target.value)}
        />
      );

    case 'date':
    case 'datetime-local':
      return operator === 'between' || operator === 'notBetween' ? (
        <DatePicker.RangePicker
          value={
            typeof value === 'string' && /^[^,]+,[^,]+$/.test(value)
              ? (value.split(',').map(v => moment(v)) as [moment.Moment, moment.Moment])
              : undefined
          }
          showTime={inputTypeCoerced === 'datetime-local'}
          className={className}
          disabled={disabled}
          placeholder={[placeHolderText, placeHolderText]}
          onChange={dates =>
            handleOnChange(dates?.map(d => d?.format(moment.HTML5_FMT.DATE)).join(','))
          }
        />
      ) : (
        <DatePicker
          value={value ? moment(value) : null}
          showTime={inputTypeCoerced === 'datetime-local'}
          className={className}
          disabled={disabled}
          placeholder={placeHolderText}
          onChange={(_d, dateString) => handleOnChange(dateString)}
        />
      );

    case 'time':
      return (
        <TimePicker
          value={value ? moment(value, 'HH:mm') : null}
          className={className}
          disabled={disabled}
          placeholder={placeHolderText}
          onChange={d => handleOnChange(d?.format('HH:mm') ?? '')}
        />
      );
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
    />
  );
};

AntDValueEditor.displayName = 'AntDValueEditor';

export default AntDValueEditor;
