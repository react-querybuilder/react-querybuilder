import { Button } from '@mantine/core';
import * as React from 'react';
import type { ShiftActionsProps } from 'react-querybuilder';

/**
 * @group Components
 */
export const MantineShiftActions = ({
  shiftUp,
  shiftDown,
  shiftUpDisabled,
  shiftDownDisabled,
  disabled,
  className,
  labels,
  titles,
  testID,
}: ShiftActionsProps): React.JSX.Element => (
  <div data-testid={testID} className={className}>
    <Button
      type="button"
      size="compact-xs"
      disabled={disabled || shiftUpDisabled}
      onClick={shiftUp}
      title={titles?.shiftUp}>
      {labels?.shiftUp}
    </Button>
    <Button
      type="button"
      size="compact-xs"
      disabled={disabled || shiftDownDisabled}
      onClick={shiftDown}
      title={titles?.shiftDown}>
      {labels?.shiftDown}
    </Button>
  </div>
);
