import { Checkbox, Input, Radio, RadioGroup, Stack, Switch, Textarea } from '@chakra-ui/react';
import {
  getFirstOption,
  standardClassnames,
  useValueEditor,
  ValueSelector,
  type ValueEditorProps,
} from 'react-querybuilder';
import { ChakraValueSelector } from './ChakraValueSelector';

export const ChakraValueEditor = ({
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
  testID,
  disabled,
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
    (type === 'select' || type === 'text')
  ) {
    const editors = ['from', 'to'].map((key, i) => {
      if (type === 'text') {
        return (
          <Input
            key={key}
            type={inputTypeCoerced}
            value={valArray[i] ?? ''}
            size="xs"
            variant="filled"
            isDisabled={disabled}
            className={standardClassnames.valueListItem}
            placeholder={placeHolderText}
            onChange={e => betweenValueHandler(e.target.value, i)}
          />
        );
      }
      return (
        <ChakraValueSelector
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
      return (
        <ChakraValueSelector
          {...props}
          className={className}
          title={title}
          value={value}
          disabled={disabled}
          handleOnChange={handleOnChange}
          options={values}
        />
      );

    case 'multiselect':
      return (
        <ValueSelector
          {...props}
          className={className}
          title={title}
          value={value}
          disabled={disabled}
          handleOnChange={handleOnChange}
          options={values}
          multiple
          listsAsArrays={listsAsArrays}
        />
      );

    case 'textarea':
      return (
        <Textarea
          value={value}
          title={title}
          size="xs"
          variant="filled"
          isDisabled={disabled}
          className={className}
          placeholder={placeHolderText}
          onChange={e => handleOnChange(e.target.value)}
        />
      );

    case 'switch':
      return (
        <Switch
          className={className}
          isChecked={!!value}
          title={title}
          size="sm"
          isDisabled={disabled}
          onChange={e => handleOnChange(e.target.checked)}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          className={className}
          title={title}
          size="sm"
          isDisabled={disabled}
          onChange={e => handleOnChange(e.target.checked)}
          isChecked={!!value}
        />
      );

    case 'radio':
      return (
        <RadioGroup
          className={className}
          title={title}
          value={value}
          onChange={handleOnChange}
          isDisabled={disabled}>
          <Stack direction="row">
            {values.map(v => (
              <Radio key={v.name} value={v.name} size="sm">
                {v.label}
              </Radio>
            ))}
          </Stack>
        </RadioGroup>
      );
  }

  return (
    <Input
      type={inputTypeCoerced}
      value={value}
      title={title}
      size="xs"
      variant="filled"
      isDisabled={disabled}
      className={className}
      placeholder={placeHolderText}
      onChange={e => handleOnChange(e.target.value)}
    />
  );
};

ChakraValueEditor.displayName = 'ChakraValueEditor';
