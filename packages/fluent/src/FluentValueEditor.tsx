import type { InputProps } from '@fluentui/react-components';
import { Checkbox, Input, Radio, RadioGroup, Switch, Textarea } from '@fluentui/react-components';
import * as React from 'react';
import type { ValueEditorProps } from 'react-querybuilder';
import { useValueEditor, ValueEditor } from 'react-querybuilder';

/**
 * @group Props
 */
export interface FluentValueEditorProps extends ValueEditorProps {
  extraProps?: Record<string, unknown>;
}

/**
 * @group Components
 */
export const FluentValueEditor = (allProps: FluentValueEditorProps): React.JSX.Element | null => {
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
    listsAsArrays: _listsAsArrays,
    separator,
    valueSource: _vs,
    disabled,
    testID,
    selectorComponent: _SelectorComponent,
    validation: _validation,
    extraProps,
    parseNumbers: _parseNumbers,
    ..._propsForValueSelector
  } = allProps;

  const {
    valueAsArray,
    multiValueHandler,
    bigIntValueHandler,
    valueListItemClassName,
    inputTypeCoerced,
  } = useValueEditor(allProps);

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }
  const placeHolderText = fieldData?.placeholder ?? '';

  if (
    (operator === 'between' || operator === 'notBetween') &&
    (type === 'select' || type === 'text')
  ) {
    if (type === 'text') {
      const editors = ['from', 'to'].map((key, i) => {
        return (
          <Input
            key={key}
            type={inputTypeCoerced as InputProps['type']}
            placeholder={placeHolderText}
            value={valueAsArray[i] ?? ''}
            className={`${valueListItemClassName} input`}
            disabled={disabled}
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
      return <ValueEditor {...allProps} skipHook />;

    case 'textarea':
      return (
        <Textarea
          className={className}
          value={value}
          title={title}
          placeholder={placeHolderText}
          disabled={disabled}
          onChange={e => handleOnChange(e.target.value)}
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
          onChange={e => handleOnChange(e.target.checked)}
          {...extraProps}
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
          {...extraProps}
        />
      );

    case 'radio':
      return (
        <RadioGroup
          className={className}
          title={title}
          value={value}
          onChange={(_e, data) => handleOnChange(data.value)}
          disabled={disabled}
          {...extraProps}>
          {values.map(v => (
            <Radio key={v.name} value={v.name} label={v.label} />
          ))}
        </RadioGroup>
      );
  }

  if (inputType === 'bigint') {
    return (
      <Input
        data-testid={testID}
        type={inputTypeCoerced as InputProps['type']}
        placeholder={placeHolderText}
        value={`${value}`}
        title={title}
        className={className}
        disabled={disabled}
        onChange={e => bigIntValueHandler(e.target.value)}
        {...extraProps}
      />
    );
  }

  return (
    <Input
      data-testid={testID}
      title={title}
      className={className}
      placeholder={placeHolderText}
      type={inputTypeCoerced as InputProps['type']}
      disabled={disabled}
      value={value}
      onChange={e => handleOnChange(e.target.value)}
      {...extraProps}
    />
  );
};
