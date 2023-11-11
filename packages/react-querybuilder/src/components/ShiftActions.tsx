import * as React from 'react';
import type { ShiftActionsProps } from '../types';

/**
 * Default "shift up"/"shift down" buttons used by {@link QueryBuilder}.
 */
export const ShiftActions = ({
  disabled,
  shiftUp,
  shiftDown,
  shiftUpDisabled,
  shiftDownDisabled,
  className,
  labels,
  titles,
  testID,
}: ShiftActionsProps) => {
  return (
    <div data-testid={testID} className={className}>
      <button disabled={disabled || shiftUpDisabled} onClick={shiftUp} title={titles?.shiftUp}>
        {labels?.shiftUp}
      </button>
      <button
        disabled={disabled || shiftDownDisabled}
        onClick={shiftDown}
        title={titles?.shiftDown}>
        {labels?.shiftDown}
      </button>
    </div>
  );
};

ShiftActions.displayName = 'ShiftActions';
