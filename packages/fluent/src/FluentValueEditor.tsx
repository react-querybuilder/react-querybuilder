import type { InputProps } from '@fluentui/react-components';
import { Checkbox, Input, Radio, RadioGroup, Switch, Textarea } from '@fluentui/react-components';
import type { ValueEditorProps } from 'react-querybuilder';
import { getFirstOption, standardClassnames, useValueEditor } from 'react-querybuilder';
import { FluentValueSelector } from './FluentValueSelector';

export const FluentValueEditor = ({
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
  selectorComponent: SelectorComponent = FluentValueSelector,
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
  const inputTypeCoerced = (
    ['in', 'notIn'].includes(operator) ? 'text' : inputType || 'text'
  ) as InputProps['type'];

  if (
    (operator === 'between' || operator === 'notBetween') &&
    (type === 'select' || type === 'text')
  ) {
    const editors = ['from', 'to'].map((key, i) => {
      if (type === 'text') {
        return (
          <Input
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
        <RadioGroup
          className={className}
          title={title}
          value={value}
          onChange={(_e, data) => handleOnChange(data.value)}
          disabled={disabled}>
          {values.map(v => (
            <Radio key={v.name} value={v.name} label={v.label} />
          ))}
        </RadioGroup>
      );
  }

  return (
    <Input
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

FluentValueEditor.displayName = 'FluentValueEditor';
