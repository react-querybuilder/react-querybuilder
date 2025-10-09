import type { Select, SelectChangeEvent } from '@mui/material';
import type { ComponentPropsWithoutRef, ComponentType } from 'react';
import * as React from 'react';
import { useContext } from 'react';
import type { VersatileSelectorProps } from 'react-querybuilder';
import { ValueSelector, useValueSelector } from 'react-querybuilder';
import type { RQBMaterialContextValue } from './RQBMaterialContext';
import { RQBMaterialContext } from './RQBMaterialContext';
import type { MuiAugmentation } from './types';
import { toOptions } from './utils';

/**
 * @group Props
 */
export type MaterialValueSelectorProps = VersatileSelectorProps &
  ComponentPropsWithoutRef<typeof Select> &
  MuiAugmentation;

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
  ruleGroup,
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
  showInputLabels: silProp,
  defaultValue: _defaultValue,
  ...otherProps
}: MaterialValueSelectorProps): React.JSX.Element => {
  const muiComponents =
    useContext(RQBMaterialContext) ?? (muiComponentsProp as RQBMaterialContextValue);

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
        ruleGroup={ruleGroup}
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

  const {
    FormControl,
    InputLabel,
    ListSubheader,
    MenuItem,
    Select,
    showInputLabels: silCtx,
  } = muiComponents;

  const showInputLabels = silProp || silCtx;

  return (
    <FormControl
      key={key}
      variant="standard"
      className={className}
      title={title}
      disabled={disabled}>
      {showInputLabels && <InputLabel>{title}</InputLabel>}
      <Select
        value={val}
        onChange={muiSelectChangeHandler}
        multiple={multiple}
        disabled={disabled}
        label={showInputLabels ? title : undefined}
        {...otherProps}>
        {toOptions(options, { ListSubheader, MenuItem })}
      </Select>
    </FormControl>
  );
};
