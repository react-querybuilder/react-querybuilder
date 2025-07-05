import type { Select, SelectChangeEvent } from '@mui/material';
import type { ComponentPropsWithoutRef, ComponentType } from 'react';
import * as React from 'react';
import { useContext } from 'react';
import type { VersatileSelectorProps } from 'react-querybuilder';
import { ValueSelector, useValueSelector } from 'react-querybuilder';
import { RQBMaterialContext } from './RQBMaterialContext';
import type { RQBMaterialComponents } from './types';
import { toOptions } from './utils';

/**
 * @group Props
 */
export type MaterialValueSelectorProps = VersatileSelectorProps &
  ComponentPropsWithoutRef<typeof Select> & {
    muiComponents?: RQBMaterialComponents;
  };

/**
 * @group Components
 */
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
  rule,
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
  defaultValue: _defaultValue,
  ...otherProps
}: MaterialValueSelectorProps): React.JSX.Element => {
  const muiComponents = useContext(RQBMaterialContext) ?? muiComponentsProp;

  const { onChange, val } = useValueSelector({ handleOnChange, listsAsArrays, multiple, value });

  const muiSelectChangeHandler = React.useCallback(
    ({ target: { value } }: SelectChangeEvent<string | string[]>) => {
      onChange(value);
    },
    [onChange]
  );

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
        rule={rule}
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
        onChange={muiSelectChangeHandler}
        multiple={multiple}
        disabled={disabled}
        {...otherProps}>
        {toOptions(options ?? /* istanbul ignore next */ [], {
          ListSubheader,
          MenuItem,
        })}
      </Select>
    </FormControl>
  );
};
