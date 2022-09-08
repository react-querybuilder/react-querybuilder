import type { SelectChangeEvent } from '@mui/material/Select';
import type { VersatileSelectorProps } from '@react-querybuilder/ts';
import type { ComponentPropsWithoutRef, ComponentType } from 'react';
import { useMemo } from 'react';
import { joinWith, splitBy, ValueSelector } from 'react-querybuilder';
import type { MuiComponentName, RQBMaterialComponents, SelectType } from './types';
import { useMuiComponents } from './useMuiComponents';
import { toOptions } from './utils';

type MaterialValueSelectorProps = VersatileSelectorProps &
  ComponentPropsWithoutRef<SelectType> & {
    muiComponents?: Partial<RQBMaterialComponents>;
  };

type MaterialValueSelectorComponents = Pick<
  RQBMaterialComponents,
  'FormControl' | 'Select' | 'ListSubheader' | 'MenuItem'
>;
const muiComponentNames: MuiComponentName[] = [
  'FormControl',
  'Select',
  'ListSubheader',
  'MenuItem',
];

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
  muiComponents,
  ...otherProps
}: MaterialValueSelectorProps) => {
  const muiComponentsInternal = useMuiComponents(muiComponentNames, muiComponents);

  const onChange = useMemo(
    () =>
      multiple
        ? ({ target: { value: v } }: SelectChangeEvent<string | string[]>) =>
            handleOnChange(
              Array.isArray(v)
                ? listsAsArrays
                  ? v
                  : joinWith(v, ',')
                : /* istanbul ignore next */ v
            )
        : ({ target: { value: v } }: SelectChangeEvent<string>) => handleOnChange(v),
    [handleOnChange, listsAsArrays, multiple]
  );

  const key = muiComponentsInternal ? 'mui' : 'no-mui';
  if (!muiComponentsInternal) {
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
      />
    );
  }

  const { FormControl, Select, ListSubheader, MenuItem } =
    muiComponentsInternal as MaterialValueSelectorComponents;

  const val = multiple ? (Array.isArray(value) ? value : splitBy(value, ',')) : value;

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
        onChange={onChange}
        multiple={!!multiple}
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
