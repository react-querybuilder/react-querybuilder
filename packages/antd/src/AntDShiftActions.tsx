import { Button } from 'antd';
import * as React from 'react';
import type { ShiftActionsProps } from 'react-querybuilder';

/**
 * @group Components
 */
export const AntDShiftActions = ({
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
      type="primary"
      size="small"
      title={titles?.shiftUp}
      onClick={shiftUp}
      disabled={disabled || shiftUpDisabled}>
      {labels?.shiftUp}
    </Button>
    <Button
      type="primary"
      size="small"
      title={titles?.shiftDown}
      onClick={shiftDown}
      disabled={disabled || shiftDownDisabled}>
      {labels?.shiftDown}
    </Button>
  </div>
);
