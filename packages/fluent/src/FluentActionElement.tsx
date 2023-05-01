import type { ButtonProps } from '@fluentui/react-components';
import { Button } from '@fluentui/react-components';
import type { ActionProps } from 'react-querybuilder';

type FluentActionProps = ActionProps & ButtonProps;

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
}: FluentActionProps) => (
  <Button
    // TODO: Find a way to do better than "as any" here
    {...(otherProps as any)}
    data-testid={testID}
    type="button"
    className={className}
    title={disabledTranslation && disabled ? disabledTranslation.title : title}
    onClick={e => handleOnClick(e)}
    disabled={disabled && !disabledTranslation}>
    {disabledTranslation && disabled ? disabledTranslation.label : label}
  </Button>
);

FluentActionElement.displayName = 'FluentActionElement';
