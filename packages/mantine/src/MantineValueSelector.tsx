import { MultiSelect, Select } from '@mantine/core';
import type { ValueSelectorProps } from '@react-querybuilder/ts';
import { useValueSelector } from 'react-querybuilder';
import { optionListMapNameToValue } from './utils';

export const MantineValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title,
  disabled,
  multiple,
  listsAsArrays,
  testID,
}: ValueSelectorProps) => {
  const { onChange, val } = useValueSelector({ handleOnChange, listsAsArrays, multiple, value });

  const data = optionListMapNameToValue(options);

  const changeHandler = (v: string | string[] | null) => onChange(v ?? '');

  return multiple ? (
    <MultiSelect
      data-testid={testID}
      title={title}
      className={className}
      data={[]}
      disabled={disabled}
      value={val as any[]}
      onChange={changeHandler}
    />
  ) : (
    <Select
      data-testid={testID}
      title={title}
      className={className}
      value={val as string}
      data={data}
      disabled={disabled}
      onChange={changeHandler}
    />
  );
};

MantineValueSelector.displayName = 'MantineValueSelector';
