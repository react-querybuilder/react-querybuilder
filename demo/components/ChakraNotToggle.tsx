import { Checkbox } from '@chakra-ui/react';
import { NotToggleProps } from '../../src/types';

const ChakraNotToggle = ({ className, handleOnChange, label, checked, title }: NotToggleProps) => {
  return (
    <Checkbox
      className={className}
      title={title}
      size="sm"
      onChange={(e) => handleOnChange(e.target.checked)}
      checked={checked}>
      {label}
    </Checkbox>
  );
};

ChakraNotToggle.displayName = 'ChakraNotToggle';

export default ChakraNotToggle;
