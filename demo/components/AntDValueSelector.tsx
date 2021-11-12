import { Select } from 'antd';
import type { ValueSelectorProps } from '../../src/types';

const { Option } = Select;

const AntDValueSelector = ({ className, handleOnChange, options, value }: ValueSelectorProps) => (
  <Select className={className} value={value} onChange={(v) => handleOnChange(v)}>
    {options.map((option) => {
      const key = `key-${option.id ?? option.name}`;
      return (
        <Option key={key} value={option.name}>
          {option.label}
        </Option>
      );
    })}
  </Select>
);

AntDValueSelector.displayName = 'AntDValueSelector';

export default AntDValueSelector;
