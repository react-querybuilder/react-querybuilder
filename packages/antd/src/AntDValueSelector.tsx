import { Select } from 'antd';
import { useMemo } from 'react';
import type { ValueSelectorProps } from 'react-querybuilder';
import { toOptions } from './utils';

export const AntDValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title,
  disabled,
  multiple,
}: ValueSelectorProps) => {
  const onChange = useMemo(() => {
    if (multiple) {
      return (v: string | string[]) =>
        handleOnChange(Array.isArray(v) ? v.join(',') : /* istanbul ignore next */ v);
    }
    return (v: string) => handleOnChange(v);
  }, [handleOnChange, multiple]);

  const val = multiple
    ? Array.isArray(value)
      ? /* istanbul ignore next */ value
      : value?.split(',')
    : value;

  const modeObj = multiple ? { mode: 'multiple' as const } : {};

  return (
    <span title={title} className={className}>
      <Select
        {...modeObj}
        dropdownMatchSelectWidth={false}
        disabled={disabled}
        value={val as any}
        onChange={onChange}>
        {toOptions(options)}
      </Select>
    </span>
  );
};

AntDValueSelector.displayName = 'AntDValueSelector';
