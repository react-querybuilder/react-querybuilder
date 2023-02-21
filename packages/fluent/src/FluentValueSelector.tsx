import type { SelectProps } from '@fluentui/react-components';
import { Select } from '@fluentui/react-components';
import type { VersatileSelectorProps } from '@react-querybuilder/ts';
import { toOptions, useSelectElementChangeHandler, useValueSelector } from 'react-querybuilder';

type FluentValueSelectorProps = VersatileSelectorProps & SelectProps;

export const FluentValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title,
  disabled,
  multiple,
  listsAsArrays,
  testID,
  fieldData: _fieldData,
  path: _path,
  level: _level,
  context: _context,
  validation: _validation,
  schema: _schema,
  ...otherProps
}: FluentValueSelectorProps) => {
  const { onChange, val } = useValueSelector({ handleOnChange, listsAsArrays, multiple, value });

  const selectElementChangeHandler = useSelectElementChangeHandler({ multiple, onChange });

  return (
    <Select
      {...otherProps}
      data-testid={testID}
      title={title}
      className={className}
      value={val}
      disabled={disabled}
      multiple={!!multiple}
      onChange={selectElementChangeHandler}>
      {toOptions(options)}
    </Select>
  );
};

FluentValueSelector.displayName = 'FluentValueSelector';
