import { Button } from '@chakra-ui/react';
import type { ActionWithRulesProps } from '@react-querybuilder/ts';
import type { ComponentPropsWithoutRef } from 'react';

type ChakraActionProps = ActionWithRulesProps & ComponentPropsWithoutRef<typeof Button>;

export const ChakraActionElement = ({
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
  schema: _schema,
  ...extraProps
}: ChakraActionProps) => (
  <Button
    className={className}
    title={disabledTranslation && disabled ? disabledTranslation.title : title}
    onClick={e => handleOnClick(e)}
    isDisabled={disabled && !disabledTranslation}
    {...extraProps}>
    {disabledTranslation && disabled ? disabledTranslation.label : label}
  </Button>
);

ChakraActionElement.displayName = 'ChakraActionElement';
