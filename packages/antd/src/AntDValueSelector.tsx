import { Select } from 'antd';
import { useMemo, type ComponentPropsWithoutRef } from 'react';
import type { VersatileSelectorProps } from 'react-querybuilder';
import { toOptions } from './utils';

type AntDValueSelectorProps = VersatileSelectorProps &
  Omit<ComponentPropsWithoutRef<typeof Select>, 'onChange' | 'defaultValue'>;

export const AntDValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title,
  disabled,
  multiple,
  // Props that should not be in extraProps
  testID: _testID,
  rules: _rules,
  level: _level,
  path: _path,
  context: _context,
  validation: _validation,
  operator: _operator,
  field: _field,
  fieldData: _fieldData,
  ...extraProps
}: AntDValueSelectorProps) => {
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
        onChange={onChange}
        {...extraProps}>
        {toOptions(options)}
      </Select>
    </span>
  );
};

AntDValueSelector.displayName = 'AntDValueSelector';
