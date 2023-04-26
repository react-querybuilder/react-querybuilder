import type { Select, SelectChangeEvent } from '@mui/material';
import type { VersatileSelectorProps } from '@react-querybuilder/ts';
import type { ComponentPropsWithoutRef, ComponentType } from 'react';
import { useContext } from 'react';
import { useValueSelector, ValueSelector } from 'react-querybuilder';
import { RQBMaterialContext } from './RQBMaterialContext';
import type { RQBMaterialComponents } from './types';
import { toOptions } from './utils';

type MaterialValueSelectorProps = VersatileSelectorProps &
  ComponentPropsWithoutRef<typeof Select> & {
    muiComponents?: RQBMaterialComponents;
  };

export const MaterialValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  disabled,
  title,
  multiple,
  listsAsArrays,
  testID,
  rules,
  level,
  path,
  context,
  validation,
  operator,
  field,
  fieldData,
  schema,
  muiComponents: muiComponentsProp,
  ...otherProps
}: MaterialValueSelectorProps) => {
  const muiComponents = useContext(RQBMaterialContext) ?? muiComponentsProp;

  const { onChange, val } = useValueSelector({ handleOnChange, listsAsArrays, multiple, value });

  const muiSelectChangeHandler = ({ target: { value } }: SelectChangeEvent<string | string[]>) =>
    onChange(value);

  const key = muiComponents ? 'mui' : 'no-mui';
  if (!muiComponents) {
    const VS = ValueSelector as ComponentType<VersatileSelectorProps>;
    return (
      <VS
        key={key}
        className={className}
        handleOnChange={handleOnChange}
        options={options}
        value={value}
        disabled={disabled}
        title={title}
        multiple={multiple}
        listsAsArrays={listsAsArrays}
        testID={testID}
        rules={rules}
        level={level}
        path={path}
        context={context}
        validation={validation}
        operator={operator}
        field={field}
        fieldData={fieldData}
        schema={schema}
      />
    );
  }

  const { FormControl, Select, ListSubheader, MenuItem } = muiComponents;

  return (
    <FormControl
      key={key}
      variant="standard"
      className={className}
      title={title}
      disabled={disabled}>
      <Select
        value={val}
        // @ts-expect-error onChange cannot accept string[]
        onChange={muiSelectChangeHandler}
        multiple={multiple}
        {...otherProps}>
        {toOptions(options ?? /* istanbul ignore next */ [], {
          ListSubheader,
          MenuItem,
        })}
      </Select>
    </FormControl>
  );
};

MaterialValueSelector.displayName = 'MaterialValueSelector';
