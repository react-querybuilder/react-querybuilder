import { Button } from '@chakra-ui/react';
import { ActionProps } from '../../src/types';

const ChakraActionElement = ({ className, handleOnClick, label, title }: ActionProps) => (
  <Button
    className={className}
    title={title}
    colorScheme="gray"
    variant="solid"
    onClick={(e) => handleOnClick(e)}
    size="xs">
    {label}
  </Button>
);

ChakraActionElement.displayName = 'ChakraActionElement';

export default ChakraActionElement;
