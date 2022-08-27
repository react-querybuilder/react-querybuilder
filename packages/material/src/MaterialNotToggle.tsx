import type { ComponentPropsWithoutRef } from 'react';
import type { NotToggleProps } from 'react-querybuilder';
import { NotToggle } from 'react-querybuilder';
import type { RQBMaterialComponents, SwitchType } from './types';
import { useMuiComponents } from './useMuiComponents';

type MaterialNotToggleProps = NotToggleProps &
  ComponentPropsWithoutRef<SwitchType> & {
    muiComponents?: Partial<RQBMaterialComponents>;
  };

type GetMaterialNotToggleProps = Pick<RQBMaterialComponents, 'FormControlLabel' | 'Switch'>;
const muiComponentNames: (keyof RQBMaterialComponents)[] = ['FormControlLabel', 'Switch'];

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
  muiComponents,
  ...otherProps
}: MaterialNotToggleProps) => {
  const muiComponentsInternal = useMuiComponents(muiComponentNames, muiComponents);
  const key = muiComponentsInternal ? 'mui' : 'no-mui';
  if (!muiComponentsInternal) {
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
      />
    );
  }

  const { FormControlLabel, Switch } = muiComponentsInternal as GetMaterialNotToggleProps;

  return (
    <FormControlLabel
      key={key}
      className={className}
      title={title}
      disabled={disabled}
      control={
        <Switch
          checked={!!checked}
          onChange={e => handleOnChange(e.target.checked)}
          {...otherProps}
        />
      }
      label={label ?? /* istanbul ignore next */ ''}
    />
  );
};

MaterialNotToggle.displayName = 'MaterialNotToggle';
