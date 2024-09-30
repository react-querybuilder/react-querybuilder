import { Button } from '@fluentui/react-components';
import * as React from 'react';
import type { ShiftActionsProps } from 'react-querybuilder';

export const FluentShiftActions = ({
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
      disabled={disabled || shiftUpDisabled}
      onClick={shiftUp}
      title={titles?.shiftUp}>
      {labels?.shiftUp}
    </Button>
    <Button
      type="button"
      disabled={disabled || shiftDownDisabled}
      onClick={shiftDown}
      title={titles?.shiftDown}>
      {labels?.shiftDown}
    </Button>
  </div>
);
