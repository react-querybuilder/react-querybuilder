import * as React from 'react';
import { useShiftActions } from '../hooks';
import type { ShiftActionsProps } from '../types';
import { pathsAreEqual } from '../utils';

/**
 * Default "shift up"/"shift down" buttons used by {@link QueryBuilder}.
 */
export const ShiftActions = ({
  path,
  disabled,
  className,
  labels,
  titles,
  testID,
  lastInGroup,
  schema: { combinators, dispatchQuery, getQuery },
}: ShiftActionsProps) => {
  const { shiftUp, shiftDown } = useShiftActions({ combinators, dispatchQuery, getQuery, path });

  return (
    <div data-testid={testID} className={className}>
      <button
        disabled={disabled || pathsAreEqual([0], path)}
        onClick={shiftUp}
        title={titles?.shiftUp}>
        {labels?.shiftUp}
      </button>
      <button
        disabled={disabled || (lastInGroup && path.length === 1)}
        onClick={shiftDown}
        title={titles?.shiftDown}>
        {labels?.shiftDown}
      </button>
    </div>
  );
};

ShiftActions.displayName = 'ShiftActions';
