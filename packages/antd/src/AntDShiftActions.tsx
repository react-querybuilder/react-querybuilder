import { Button } from 'antd';
import * as React from 'react';
import type { ShiftActionsProps } from 'react-querybuilder';
import { useShiftActions } from 'react-querybuilder';

export const AntDShiftActions = ({
  path,
  disabled,
  className,
  labels,
  titles,
  testID,
  lastInGroup,
  schema: { combinators, dispatchQuery, getQuery },
}: ShiftActionsProps) => {
  const { shiftUp, shiftUpDisabled, shiftDown, shiftDownDisabled } = useShiftActions({
    combinators,
    disabled,
    dispatchQuery,
    getQuery,
    lastInGroup,
    path,
  });

  return (
    <div data-testid={testID} className={className}>
      <Button
        type="primary"
        size="small"
        title={titles?.shiftUp}
        onClick={shiftUp}
        disabled={shiftUpDisabled}>
        {labels?.shiftUp}
      </Button>
      <Button
        type="primary"
        size="small"
        title={titles?.shiftDown}
        onClick={shiftDown}
        disabled={shiftDownDisabled}>
        {labels?.shiftDown}
      </Button>
    </div>
  );
};

AntDShiftActions.displayName = 'AntDShiftActions';
