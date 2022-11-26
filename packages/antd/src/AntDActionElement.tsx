import type { ActionWithRulesProps } from '@react-querybuilder/ts';
import { Button } from 'antd';
import type { ComponentPropsWithoutRef } from 'react';

type AntDActionProps = ActionWithRulesProps & ComponentPropsWithoutRef<typeof Button>;

export const AntDActionElement = ({
  className,
  handleOnClick,
  label,
  title,
  disabled,
  disabledTranslation,
  // Props that should not be in extraProps
  testID: _testID,
  rules: _rules,
  level: _level,
  path: _path,
  context: _context,
  validation: _validation,
  ruleOrGroup: _ruleOrGroup,
  ...extraProps
}: AntDActionProps) => (
  <Button
    type="primary"
    className={className}
    title={disabledTranslation && disabled ? disabledTranslation.title : title}
    onClick={e => handleOnClick(e)}
    disabled={disabled && !disabledTranslation}
    {...extraProps}>
    {disabledTranslation && disabled ? disabledTranslation.label : label}
  </Button>
);

AntDActionElement.displayName = 'AntDActionElement';
