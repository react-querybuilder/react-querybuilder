import { Button } from '@chakra-ui/react';
import * as React from 'react';
import type { ShiftActionsProps } from 'react-querybuilder';

export const ChakraShiftActions = ({
  shiftUp,
  shiftDown,
  shiftUpDisabled,
  shiftDownDisabled,
  disabled,
  className,
  labels,
  titles,
  testID,
}: ShiftActionsProps) => (
  <div data-testid={testID} className={className}>
    <Button isDisabled={disabled || shiftUpDisabled} onClick={shiftUp} title={titles?.shiftUp}>
      {labels?.shiftUp}
    </Button>
    <Button
      isDisabled={disabled || shiftDownDisabled}
      onClick={shiftDown}
      title={titles?.shiftDown}>
      {labels?.shiftDown}
    </Button>
  </div>
);

ChakraShiftActions.displayName = 'ChakraShiftActions';
