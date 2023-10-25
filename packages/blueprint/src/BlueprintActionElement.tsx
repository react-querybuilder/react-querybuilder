import type { ButtonProps } from '@blueprintjs/core';
import { Button } from '@blueprintjs/core';
import * as React from 'react';
import type { ActionProps } from 'react-querybuilder';

export type BlueprintActionProps = ActionProps & Partial<ButtonProps>;

export const BlueprintActionElement = ({
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
}: BlueprintActionProps) => (
  <Button
    {...otherProps}
    data-testid={testID}
    type="button"
    className={className}
    title={disabledTranslation && disabled ? disabledTranslation.title : title}
    onClick={e => handleOnClick(e)}
    disabled={disabled && !disabledTranslation}>
    {disabledTranslation && disabled ? disabledTranslation.label : label}
  </Button>
);

BlueprintActionElement.displayName = 'BlueprintActionElement';
