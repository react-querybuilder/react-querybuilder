import { Input, Stack, Textarea } from '@chakra-ui/react';
import * as React from 'react';
import type { ValueEditorProps } from 'react-querybuilder';
import { ValueEditor, useValueEditor } from 'react-querybuilder';
import { Checkbox } from './snippets/checkbox';
import { Radio, RadioGroup } from './snippets/radio';
import { Switch } from './snippets/switch';

/**
 * @group Props
 */
export interface ChakraValueEditorProps extends ValueEditorProps {
  extraProps?: Record<string, unknown>;
}

/**
 * @group Components
 */
export const ChakraValueEditor = (allProps: ChakraValueEditorProps): React.JSX.Element | null => {
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
    testID,
    disabled,
    selectorComponent: SelectorComponent = allProps.schema.controls.valueSelector,
    extraProps,
    parseNumbers: _parseNumbers,
    ...propsForValueSelector
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
            type={inputTypeCoerced}
            value={valueAsArray[i] ?? ''}
            disabled={disabled}
            className={valueListItemClassName}
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
      return (
        <SelectorComponent
          {...propsForValueSelector}
          className={className}
          title={title}
          value={value}
          disabled={disabled}
          handleOnChange={handleOnChange}
          options={values}
        />
      );

    case 'multiselect':
      return <ValueEditor {...allProps} skipHook />;

    case 'textarea':
      return (
        <Textarea
          value={value}
          title={title}
          disabled={disabled}
          className={className}
          placeholder={placeHolderText}
          onChange={e => handleOnChange(e.target.value)}
          {...extraProps}
        />
      );

    case 'switch':
      return (
        <Switch
          className={className}
          checked={!!value}
          title={title}
          disabled={disabled}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => handleOnChange(e.target.checked)}
          {...extraProps}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          className={className}
          title={title}
          disabled={disabled}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => handleOnChange(e.target.checked)}
          checked={!!value}
          {...extraProps}
        />
      );

    case 'radio':
      return (
        <RadioGroup
          className={className}
          title={title}
          value={value}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => handleOnChange(e.target.value)}
          disabled={disabled}
          {...extraProps}>
          <Stack direction="row">
            {values.map(v => (
              <Radio key={v.name} value={v.name}>
                {v.label}
              </Radio>
            ))}
          </Stack>
        </RadioGroup>
      );
  }

  if (inputType === 'bigint') {
    return (
      <Input
        data-testid={testID}
        type={inputTypeCoerced}
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
      type={inputTypeCoerced}
      value={value}
      title={title}
      disabled={disabled}
      className={className}
      placeholder={placeHolderText}
      onChange={e => handleOnChange(e.target.value)}
      {...extraProps}
    />
  );
};
