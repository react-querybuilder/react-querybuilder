import { Select } from 'antd';
import type { ValueSelectorProps } from 'react-querybuilder';

const { Option } = Select;

const AntDValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title,
  disabled,
}: ValueSelectorProps) => (
  <span title={title}>
    <Select
      disabled={disabled}
      className={className}
      value={value}
      onChange={v => handleOnChange(v)}>
      {options.map(option => {
        const key = `key-${option.id ?? option.name}`;
        return (
          <Option key={key} value={option.name}>
            {option.label}
          </Option>
        );
      })}
    </Select>
  </span>
);

AntDValueSelector.displayName = 'AntDValueSelector';

export default AntDValueSelector;
