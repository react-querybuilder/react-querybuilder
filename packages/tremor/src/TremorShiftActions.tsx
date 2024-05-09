import { Button } from '@tremor/react';
import * as React from 'react';
import type { ShiftActionsProps } from 'react-querybuilder';

export const TremorShiftActions = ({
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
    <Button
      type="button"
      variant="light"
      disabled={disabled || shiftUpDisabled}
      onClick={shiftUp}
      title={titles?.shiftUp}>
      {labels?.shiftUp}
    </Button>
    <Button
      type="button"
      variant="light"
      disabled={disabled || shiftDownDisabled}
      onClick={shiftDown}
      title={titles?.shiftDown}>
      {labels?.shiftDown}
    </Button>
  </div>
);
