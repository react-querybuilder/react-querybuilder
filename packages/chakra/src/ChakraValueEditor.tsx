import { Checkbox, Input, Radio, RadioGroup, Stack, Switch, Textarea } from '@chakra-ui/react';
import { useValueEditor, ValueSelector, type ValueEditorProps } from 'react-querybuilder';
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
  values,
  valueSource: _vs,
  testID: _t,
  disabled,
  ...props
}: ValueEditorProps) => {
  useValueEditor({ handleOnChange, inputType, operator, value });

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const placeHolderText = fieldData?.placeholder ?? '';
  const inputTypeCoerced = ['between', 'notBetween', 'in', 'notIn'].includes(operator)
    ? 'text'
    : inputType || 'text';

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
          options={values!}
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
          options={values!}
          multiple
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
            {values!.map(v => (
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
