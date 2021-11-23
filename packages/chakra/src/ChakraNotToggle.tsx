import { FormControl, FormLabel, Switch } from '@chakra-ui/react';
import { useState } from 'react';
import type { NotToggleProps } from 'react-querybuilder';

const ChakraNotToggle = ({ className, handleOnChange, label, checked, title }: NotToggleProps) => {
  const [id] = useState(`notToggle-${Math.random()}`);

  return (
    <div style={{ display: 'inline-block' }}>
      <FormControl display="flex" alignItems="center" className={className} title={title}>
        <Switch
          id={id}
          size="sm"
          colorScheme="red"
          checked={checked}
          onChange={(e) => handleOnChange(e.target.checked)}
        />
        <FormLabel htmlFor={id}>{label}</FormLabel>
      </FormControl>
    </div>
  );
};

ChakraNotToggle.displayName = 'ChakraNotToggle';

export default ChakraNotToggle;
