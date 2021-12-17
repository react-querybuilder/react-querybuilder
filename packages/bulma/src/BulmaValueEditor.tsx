import { useEffect } from 'react';
import { Form } from 'react-bulma-components';
import type { ValueEditorProps } from 'react-querybuilder';

const { Control, Select, Input, Checkbox, Radio } = Form;

const BulmaValueEditor = ({
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
  const inputTypeCoerced = ['between', 'notBetween', 'in', 'notIn'].includes(operator)
    ? 'text'
    : inputType || 'text';

  switch (type) {
    case 'select':
      return (
        <Control className={className}>
          <Select
            value={value}
            size="small"
            disabled={disabled}
            onChange={e => handleOnChange(e.target.value)}>
            {values &&
              values.map(v => (
                <option key={v.name} value={v.name}>
                  {v.label}
                </option>
              ))}
          </Select>
        </Control>
      );

    case 'checkbox':
      return (
        <Checkbox
          className={className}
          disabled={disabled}
          onChange={e => handleOnChange(e.target.checked)}
          checked={!!value}
        />
      );

    case 'radio':
      return (
        <Control className={className} title={title}>
          {values!.map(v => (
            <Radio
              key={v.name}
              value={v.name}
              checked={value === v.name}
              onChange={() => handleOnChange(v.name)}
              disabled={disabled}>
              {v.label}
            </Radio>
          ))}
        </Control>
      );

    default:
      return (
        <Input
          type={inputTypeCoerced}
          value={value}
          title={title}
          size="small"
          disabled={disabled}
          className={className}
          placeholder={placeHolderText}
          onChange={e => handleOnChange(e.target.value)}
        />
      );
  }
};

BulmaValueEditor.displayName = 'BulmaValueEditor';

export default BulmaValueEditor;
