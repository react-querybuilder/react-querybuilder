import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import type { ComponentPropsWithoutRef } from 'react';
import * as React from 'react';
import type { VersatileSelectorProps } from 'react-querybuilder';
import { joinWith, useValueSelector } from 'react-querybuilder';

/**
 * @group Props
 */
export type PrimeValueSelectorProps = VersatileSelectorProps &
  Omit<
    ComponentPropsWithoutRef<typeof Dropdown> & ComponentPropsWithoutRef<typeof MultiSelect>,
    'onChange' | 'value'
  >;

/**
 * @group Components
 */
export const PrimeValueSelector = ({
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
  ruleGroup: _ruleGroup,
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
}: PrimeValueSelectorProps): React.JSX.Element => {
  const { onChange: onChangeNoArrays } = useValueSelector({
    handleOnChange,
    listsAsArrays: false,
    multiple: false,
    value,
  });
  const { onChange: onChangeNormal, val } = useValueSelector({
    handleOnChange,
    listsAsArrays: multiple || listsAsArrays,
    multiple,
    value,
  });

  const onChange = React.useCallback(
    (v: string | string[]) => {
      if (multiple && !listsAsArrays && Array.isArray(v)) {
        onChangeNoArrays(joinWith(v));
      } else {
        onChangeNormal(v);
      }
    },
    [listsAsArrays, multiple, onChangeNoArrays, onChangeNormal]
  );

  if (multiple) {
    return (
      <MultiSelect
        title={title}
        className={className}
        disabled={disabled}
        value={val}
        options={options}
        optionGroupChildren="options"
        onChange={e => onChange(e.value)}
        {...extraProps}
      />
    );
  }

  return (
    <Dropdown
      title={title}
      className={className}
      disabled={disabled}
      value={val}
      options={options}
      optionGroupChildren="options"
      onChange={e => onChange(e.value)}
      {...extraProps}
    />
  );
};
