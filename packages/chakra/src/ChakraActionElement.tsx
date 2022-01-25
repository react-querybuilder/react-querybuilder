import { Button } from '@chakra-ui/react';
import type { ActionProps } from 'react-querybuilder';

export const ChakraActionElement = ({
  className,
  handleOnClick,
  label,
  title,
  disabled,
  disabledTranslation,
}: ActionProps) => (
  <Button
    className={className}
    title={disabledTranslation && disabled ? disabledTranslation.title : title}
    colorScheme="gray"
    variant="solid"
    onClick={e => handleOnClick(e)}
    size="xs"
    isDisabled={disabled && !disabledTranslation}>
    {disabledTranslation && disabled ? disabledTranslation.label : label}
  </Button>
);

ChakraActionElement.displayName = 'ChakraActionElement';
