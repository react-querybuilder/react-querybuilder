import type { ButtonProps } from '@mantine/core';
import { Button } from '@mantine/core';
import * as React from 'react';
import type { ActionWithRulesProps } from 'react-querybuilder';

/**
 * @group Props
 */
export type MantineActionProps = ActionWithRulesProps & Partial<ButtonProps>;

/**
 * @group Components
 */
export const MantineActionElement = ({
  className,
  handleOnClick,
  label,
  title,
  disabled,
  disabledTranslation,
  testID,
  rules: _rules,
  ruleOrGroup: _rg,
  path: _path,
  level: _level,
  context: _context,
  validation: _validation,
  schema: _schema,
  ...otherProps
}: MantineActionProps): React.JSX.Element => (
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
