import { Button } from 'primereact/button';
import type { ComponentPropsWithoutRef } from 'react';
import * as React from 'react';
import type { ActionProps } from 'react-querybuilder';

// Remove index signature keys that conflict with Button props
type RemoveDataIndexKeys<T> = {
  [K in keyof T as `data-${string}` extends K ? never : K]: T[K];
};

/**
 * @group Props
 */
export type PrimeActionProps = ActionProps &
  Omit<RemoveDataIndexKeys<ComponentPropsWithoutRef<typeof Button>>, keyof ActionProps>;

/**
 * @group Components
 */
export const PrimeActionElement = ({
  className,
  handleOnClick,
  label,
  title,
  disabled,
  disabledTranslation,
  // Props that should not be in extraProps
  testID: _testID,
  level: _level,
  path: _path,
  context: _context,
  validation: _validation,
  ruleOrGroup: _ruleOrGroup,
  schema: _schema,
  ...extraProps
}: PrimeActionProps): React.JSX.Element => (
  <Button
    className={className}
    title={disabledTranslation && disabled ? disabledTranslation.title : title}
    onClick={e => handleOnClick(e)}
    disabled={disabled && !disabledTranslation}
    {...extraProps}>
    {disabledTranslation && disabled ? disabledTranslation.label : label}
  </Button>
);
