import { Select } from 'antd';
import type { ComponentPropsWithoutRef } from 'react';
import * as React from 'react';
import type { VersatileSelectorProps } from 'react-querybuilder';
import { joinWith, useValueSelector } from 'react-querybuilder';

export type AntDValueSelectorProps = VersatileSelectorProps &
  Omit<ComponentPropsWithoutRef<typeof Select>, 'onChange' | 'defaultValue'>;

export const AntDValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title,
  disabled,
  multiple,
  listsAsArrays,
  // Props that should not be in extraProps
  testID: _testID,
  rule: _rule,
  rules: _rules,
  level: _level,
  path: _path,
  context: _context,
  validation: _validation,
  operator: _operator,
  field: _field,
  fieldData: _fieldData,
  schema: _schema,
  ...extraProps
}: AntDValueSelectorProps): React.JSX.Element => {
  // Alternate onChange handler that doesn't use arrays even when `multiple` is true
  const { onChange: onChangeNoArrays } = useValueSelector({
    handleOnChange,
    listsAsArrays: false,
    multiple: false,
    value,
  });
  const { onChange: onChangeNormal, val } = useValueSelector({
    handleOnChange,
    // This forces `val` to be an array if `multiple` is true,
    // even if `listsAsArrays` is false
    listsAsArrays: multiple || listsAsArrays,
    multiple,
    value,
  });

  const onChange = React.useCallback(
    (v: string | string[]) => {
      if (multiple && !listsAsArrays && Array.isArray(v)) {
        // `multiple: true` means `v` is probably an array, but we don't want
        // to send an array to `handleOnChange` when `listsAsArrays` is false
        onChangeNoArrays(joinWith(v));
      } else {
        onChangeNormal(v);
      }
    },
    [listsAsArrays, multiple, onChangeNoArrays, onChangeNormal]
  );

  return (
    <Select
      {...(multiple ? { mode: 'multiple', allowClear: true } : {})}
      title={title}
      className={className}
      popupMatchSelectWidth={false}
      disabled={disabled}
      value={val}
      onChange={onChange}
      optionFilterProp="label"
      options={options}
      {...extraProps}
    />
  );
};
