import { Checkbox, Input, Radio, Select } from 'antd';
import React from 'react';
import { ValueEditorProps } from '../src/types';

const { Option } = Select;

const AntDValueEditor = ({
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
          type={inputType || 'text'}
          value={value}
          title={title}
          className={className}
          onChange={(e) => handleOnChange(e.target.value)}
        />
      );
  }
};

AntDValueEditor.displayName = 'AntDValueEditor';

export default AntDValueEditor;
