import type { ButtonProps } from '@tremor/react';
import { Button } from '@tremor/react';
import * as React from 'react';
import type { ActionProps } from 'react-querybuilder';

export type TremorActionProps = ActionProps & ButtonProps;

export const TremorActionElement = ({
  className,
  handleOnClick,
  label,
  title,
  disabled,
  disabledTranslation,
  testID,
  ruleOrGroup: _rg,
  path: _path,
  level: _level,
  context: _context,
  validation: _validation,
  schema: _schema,
  ...otherProps
}: TremorActionProps) => (
  <Button
    {...otherProps}
    data-testid={testID}
    type="button"
    variant="primary"
    className={className}
    title={disabledTranslation && disabled ? disabledTranslation.title : title}
    onClick={e => handleOnClick(e)}
    disabled={disabled && !disabledTranslation}>
    {disabledTranslation && disabled ? disabledTranslation.label : label}
  </Button>
);

TremorActionElement.displayName = 'TremorActionElement';
