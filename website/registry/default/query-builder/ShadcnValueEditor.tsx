import * as React from 'react';
import { useId } from 'react';
import type { ValueEditorProps } from 'react-querybuilder';
import { getFirstOption, parseNumber, useValueEditor } from 'react-querybuilder';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

/**
 * @group Props
 */
export interface ShadcnValueEditorProps extends ValueEditorProps {
  extraProps?: Record<string, unknown>;
}

/**
 * @group Components
 */
export const ShadcnValueEditor = (allProps: ShadcnValueEditorProps): React.JSX.Element | null => {
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
    validation: _validation,
    extraProps,
    inputType,
    parseNumbers: _parseNumbers,
    skipHook: _skipHook,
    ...propsForValueSelector
  } = allProps;

  const {
    valueAsArray,
    multiValueHandler,
    valueListItemClassName,
    inputTypeCoerced,
    bigIntValueHandler,
    parseNumberMethod,
  } = useValueEditor(allProps);

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const placeHolderText = fieldData?.placeholder ?? '';

  if (
    (operator === 'between' || operator === 'notBetween') &&
    (type === 'select' || type === 'text')
  ) {
    const editors = ['from', 'to'].map((key, i) =>
      type === 'text' ? (
        <Input
          key={key}
          type={inputTypeCoerced}
          placeholder={placeHolderText}
          value={valueAsArray[i] ?? ''}
          className={valueListItemClassName}
          disabled={disabled}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => multiValueHandler(e.target.value, i)}
          {...extraProps}
        />
      ) : (
        <SelectorComponent
          key={key}
          {...propsForValueSelector}
          className={valueListItemClassName}
          handleOnChange={v => multiValueHandler(v, i)}
          disabled={disabled}
          value={valueAsArray[i] ?? getFirstOption(values)}
          options={values}
          listsAsArrays={listsAsArrays}
        />
      )
    );

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
          {...propsForValueSelector}
          schema={allProps.schema}
          testID={testID}
          className={className}
          title={title}
          handleOnChange={handleOnChange}
          disabled={disabled}
          value={value}
          options={values}
          multiple={type === 'multiselect'}
          listsAsArrays={listsAsArrays}
        />
      );

    case 'textarea':
      return (
        <Textarea
          data-testid={testID}
          className={className}
          value={value}
          title={title}
          placeholder={placeHolderText}
          disabled={disabled}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleOnChange(e.target.value)}
          {...extraProps}
        />
      );

    case 'switch':
      return (
        <Switch
          data-testid={testID}
          className={className}
          title={title}
          checked={!!value}
          disabled={disabled}
          onCheckedChange={handleOnChange}
          {...extraProps}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          data-testid={testID}
          className={className}
          title={title}
          checked={!!value}
          disabled={disabled}
          onCheckedChange={handleOnChange}
          {...extraProps}
        />
      );

    case 'radio':
      return (
        <RadioGroup
          data-testid={testID}
          className={className}
          title={title}
          value={value}
          onValueChange={handleOnChange}
          {...extraProps}>
          {values.map(v => (
            <RadioItem key={v.name} value={v.name} label={v.label} disabled={disabled} />
          ))}
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
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => bigIntValueHandler(e.target.value)}
        {...extraProps}
      />
    );
  }

  return (
    <Input
      data-testid={testID}
      type={inputTypeCoerced}
      placeholder={placeHolderText}
      value={value ?? ''}
      title={title}
      className={className}
      disabled={disabled}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        handleOnChange(parseNumber(e.target.value, { parseNumbers: parseNumberMethod }))
      }
      {...extraProps}
    />
  );
};

/** Extracted so each radio item has its own `useId` */
const RadioItem = ({
  value,
  label,
  disabled,
}: {
  value: string;
  label: string;
  disabled?: boolean;
}) => {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <RadioGroupItem id={id} value={value} disabled={disabled} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
};
