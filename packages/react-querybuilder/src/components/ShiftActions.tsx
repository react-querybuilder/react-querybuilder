import * as React from 'react';
import type { ShiftActionsProps } from '../types';

/**
 * Default "shift up"/"shift down" buttons used by {@link QueryBuilder}.
 */
export const ShiftActions = (props: ShiftActionsProps) => (
  <div data-testid={props.testID} className={props.className}>
    <button
      disabled={props.disabled || props.shiftUpDisabled}
      onClick={props.shiftUp}
      title={props.titles?.shiftUp}>
      {props.labels?.shiftUp}
    </button>
    <button
      disabled={props.disabled || props.shiftDownDisabled}
      onClick={props.shiftDown}
      title={props.titles?.shiftDown}>
      {props.labels?.shiftDown}
    </button>
  </div>
);
