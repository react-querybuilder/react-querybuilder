import { Checkbox, Input, RadioGroup, Radio, Select, Stack } from '@chakra-ui/react';
import { ValueEditorProps } from '../../src/types';

const ChakraValueEditor = ({
  operator,
  value,
  handleOnChange,
  title,
  className,
  type,
  inputType,
  values
}: ValueEditorProps) => {
  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  switch (type) {
    case 'select':
      return (
        <Select
          className={className}
          value={value}
          size="xs"
          variant="filled"
          onChange={(e) => handleOnChange(e.target.value)}>
          {values.map((v) => (
            <option key={v.name} value={v.name}>
              {v.label}
            </option>
          ))}
        </Select>
      );

    case 'checkbox':
      return (
        <Checkbox
          className={className}
          size="sm"
          onChange={(e) => handleOnChange(e.target.checked)}
          isChecked={!!value}
        />
      );

    case 'radio':
      return (
        <RadioGroup className={className} title={title} value={value} onChange={handleOnChange}>
          <Stack direction="row">
            {values!.map((v) => (
              <Radio key={v.name} value={v.name} size="sm">
                {v.label}
              </Radio>
            ))}
          </Stack>
        </RadioGroup>
      );

    default:
      return (
        <Input
          type={inputType || 'text'}
          value={value}
          title={title}
          size="xs"
          variant="filled"
          className={className}
          onChange={(e) => handleOnChange(e.target.value)}
        />
      );
  }
};

ChakraValueEditor.displayName = 'ChakraValueEditor';

export default ChakraValueEditor;
