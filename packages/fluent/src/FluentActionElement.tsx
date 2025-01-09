import type { ButtonProps } from '@fluentui/react-components';
import { Button } from '@fluentui/react-components';
import * as React from 'react';
import type { ActionProps } from 'react-querybuilder';

export type FluentActionProps = ActionProps & ButtonProps;

export const FluentActionElement = ({
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
}: FluentActionProps): React.JSX.Element => (
  <Button
    {...otherProps}
    data-testid={testID}
    type="button"
    className={className}
    title={disabledTranslation && disabled ? disabledTranslation.title : title}
    onClick={(e: React.MouseEvent) => handleOnClick(e)}
    disabled={disabled && !disabledTranslation}>
    {disabledTranslation && disabled ? disabledTranslation.label : label}
  </Button>
);
