import type { Switch } from '@mui/material';
import type { ComponentPropsWithoutRef } from 'react';
import * as React from 'react';
import { useContext, useMemo } from 'react';
import type { NotToggleProps } from 'react-querybuilder';
import { NotToggle } from 'react-querybuilder';
import { RQBMaterialContext } from './RQBMaterialContext';
import type { MuiAugmentation, RQBMaterialComponents } from './types';

/**
 * @group Props
 */
export type MaterialNotToggleProps = NotToggleProps &
  ComponentPropsWithoutRef<typeof Switch> &
  MuiAugmentation;

type MaterialNotToggleComponents = Pick<RQBMaterialComponents, 'FormControlLabel' | 'Switch'>;

/**
 * @group Components
 */
export const MaterialNotToggle = ({
  className,
  handleOnChange,
  label,
  checked,
  title,
  disabled,
  level,
  path,
  context,
  validation,
  testID,
  schema,
  ruleGroup,
  muiComponents: muiComponentsProp,
  ...otherProps
}: MaterialNotToggleProps): React.JSX.Element => {
  const muiComponents = useContext(RQBMaterialContext) ?? muiComponentsProp;
  const { FormControlLabel, Switch } = (muiComponents ?? {}) as MaterialNotToggleComponents;
  const switchControl = useMemo(
    () =>
      Switch && (
        <Switch
          checked={!!checked}
          onChange={e => handleOnChange(e.target.checked)}
          {...otherProps}
        />
      ),
    [checked, handleOnChange, otherProps, Switch]
  );

  const key = muiComponents ? 'mui' : 'no-mui';
  if (!muiComponents) {
    return (
      <NotToggle
        key={key}
        className={className}
        handleOnChange={handleOnChange}
        label={label}
        checked={checked}
        title={title}
        disabled={disabled}
        path={path}
        level={level}
        context={context}
        validation={validation}
        testID={testID}
        schema={schema}
        ruleGroup={ruleGroup}
      />
    );
  }

  return (
    <FormControlLabel
      key={key}
      className={className}
      title={title}
      disabled={disabled}
      control={switchControl}
      label={label ?? /* istanbul ignore next */ ''}
    />
  );
};
