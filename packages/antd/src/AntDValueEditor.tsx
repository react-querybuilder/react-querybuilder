import { Checkbox, Input, Radio, Select } from 'antd';
import { useEffect } from 'react';
import type { ValueEditorProps } from 'react-querybuilder';

const { Option } = Select;

const AntDValueEditor = ({
  fieldData,
  operator,
  value,
  handleOnChange,
  title,
  className,
  type,
  inputType,
  values
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
        <Select className={className} onChange={(v) => handleOnChange(v)} value={value}>
          {values!.map((v) => (
            <Option key={v.name} value={v.name}>
              {v.label}
            </Option>
          ))}
        </Select>
      );

    case 'checkbox':
      return (
        <Checkbox
          type="checkbox"
          className={className}
          onChange={(e) => handleOnChange(e.target.checked)}
          checked={!!value}
        />
      );

    case 'radio':
      return (
        <span className={className} title={title}>
          {values!.map((v) => (
            <Radio
              key={v.name}
              value={v.name}
              checked={value === v.name}
              onChange={(e) => handleOnChange(e.target.value)}>
              {v.label}
            </Radio>
          ))}
        </span>
      );

    default:
      return (
        <Input
          type={inputTypeCoerced}
          value={value}
          title={title}
          className={className}
          placeholder={placeHolderText}
          onChange={(e) => handleOnChange(e.target.value)}
        />
      );
  }
};

AntDValueEditor.displayName = 'AntDValueEditor';

export default AntDValueEditor;
