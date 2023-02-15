import { Checkbox, Input, Radio, Switch, TimePicker } from 'antd';
import generatePicker from 'antd/es/date-picker/generatePicker';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs';
import {
  getFirstOption,
  standardClassnames,
  toArray,
  useValueEditor,
  type ValueEditorProps,
} from 'react-querybuilder';
import { AntDValueSelector } from './AntDValueSelector';

const DatePicker = generatePicker(dayjsGenerateConfig);

export const AntDValueEditor = ({
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
  selectorComponent: SelectorComponent = AntDValueSelector,
  ...props
}: ValueEditorProps) => {
  const { valArray, betweenValueHandler } = useValueEditor({
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
            <TimePicker
              key={key}
              value={valArray[i] ? dayjs(valArray[i], 'HH:mm:ss') : null}
              className={standardClassnames.valueListItem}
              disabled={disabled}
              placeholder={placeHolderText}
              onChange={d => betweenValueHandler(d?.format('HH:mm:ss') ?? '', i)}
            />
          );
        }
        return (
          <Input
            key={key}
            type={inputTypeCoerced}
            value={valArray[i] ?? ''}
            className={standardClassnames.valueListItem}
            disabled={disabled}
            placeholder={placeHolderText}
            onChange={e => betweenValueHandler(e.target.value, i)}
          />
        );
      }
      return (
        <SelectorComponent
          key={key}
          {...props}
          className={standardClassnames.valueListItem}
          handleOnChange={v => betweenValueHandler(v, i)}
          disabled={disabled}
          value={valArray[i] ?? getFirstOption(values)}
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
          {values.map(v => (
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
    case 'date':
    case 'datetime-local':
      return operator === 'between' || operator === 'notBetween' ? (
        <DatePicker.RangePicker
          value={
            toArray(value)?.length >= 2
              ? (toArray(value).map(v => dayjs(v)) as [Dayjs, Dayjs])
              : undefined
          }
          showTime={inputTypeCoerced === 'datetime-local'}
          className={className}
          disabled={disabled}
          placeholder={[placeHolderText, placeHolderText]}
          // TODO: the function below is currently untested (see the
          // "should render a date range picker" test in ./AntD.test.tsx)
          onChange={
            /* istanbul ignore next */
            dates => {
              const format = `YYYY-MM-DD${
                inputTypeCoerced === 'datetime-local' ? 'THH:mm:ss' : ''
              }`;
              const dateArray = dates?.map(d => d?.format(format));
              handleOnChange(dateArray ? (listsAsArrays ? dateArray : dateArray.join(',')) : dates);
            }
          }
        />
      ) : (
        <DatePicker
          value={value ? dayjs(value) : null}
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
          value={value ? dayjs(value, 'HH:mm:ss') : null}
          className={className}
          disabled={disabled}
          placeholder={placeHolderText}
          onChange={d => handleOnChange(d?.format('HH:mm:ss') ?? '')}
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
