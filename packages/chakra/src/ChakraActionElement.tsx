import { Button } from '@chakra-ui/react';
import type { ComponentPropsWithoutRef } from 'react';
import * as React from 'react';
import type { ActionProps } from 'react-querybuilder';

/**
 * @group Props
 */
export interface ChakraActionProps extends ActionProps, ComponentPropsWithoutRef<typeof Button> {}

/**
 * @group Components
 */
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
}: ChakraActionProps): React.JSX.Element => (
  <Button
    className={className}
    title={disabledTranslation && disabled ? disabledTranslation.title : title}
    onClick={e => handleOnClick(e)}
    disabled={disabled && !disabledTranslation}
    {...extraProps}>
    {disabledTranslation && disabled ? disabledTranslation.label : label}
  </Button>
);
