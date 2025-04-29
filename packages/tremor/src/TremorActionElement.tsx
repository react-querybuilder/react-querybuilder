import type { ButtonProps } from '@tremor/react';
import { Button } from '@tremor/react';
import * as React from 'react';
import type { ActionWithRulesProps } from 'react-querybuilder';

/**
 * @group Props
 */
export interface TremorActionProps extends ActionWithRulesProps, ButtonProps {}

/**
 * @group Components
 */
export const TremorActionElement = ({
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
}: TremorActionProps): React.JSX.Element => (
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
