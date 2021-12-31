import { Select } from 'antd';
import type { ValueSelectorProps } from 'react-querybuilder';
import { toOptions } from './utils';

const AntDValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title,
  disabled,
}: ValueSelectorProps) => (
  <span title={title} className={className}>
    <Select disabled={disabled} value={value} onChange={v => handleOnChange(v)}>
      {toOptions(options)}
    </Select>
  </span>
);

AntDValueSelector.displayName = 'AntDValueSelector';

export default AntDValueSelector;
