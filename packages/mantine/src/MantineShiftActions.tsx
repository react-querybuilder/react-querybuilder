import { Button } from '@mantine/core';
import * as React from 'react';
import type { ShiftActionsProps } from 'react-querybuilder';
import { useShiftActions } from 'react-querybuilder';

export const MantineShiftActions = ({
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
        type="button"
        size="compact-xs"
        disabled={shiftUpDisabled}
        onClick={shiftUp}
        title={titles?.shiftUp}>
        {labels?.shiftUp}
      </Button>
      <Button
        type="button"
        size="compact-xs"
        disabled={shiftDownDisabled}
        onClick={shiftDown}
        title={titles?.shiftDown}>
        {labels?.shiftDown}
      </Button>
    </div>
  );
};

MantineShiftActions.displayName = 'MantineShiftActions';
