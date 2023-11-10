import * as React from 'react';
import type { Field, Path, Schema, ToFullOption } from '../types';
import { move, pathsAreEqual } from '../utils';

type UseShiftActionsProps = { path: Path; disabled?: boolean; lastInGroup?: boolean } & Pick<
  Schema<ToFullOption<Field>, string>,
  'combinators' | 'dispatchQuery' | 'getQuery'
>;

/**
 * Generates `shiftUp` and `shiftDown` methods for
 * {@link ShiftActions} components.
 */
export const useShiftActions = ({
  combinators,
  disabled,
  dispatchQuery,
  getQuery,
  lastInGroup,
  path,
}: UseShiftActionsProps) => {
  const shiftUp = React.useCallback(() => {
    dispatchQuery(move(getQuery()!, path, 'up', { combinators }));
  }, [combinators, dispatchQuery, getQuery, path]);

  const shiftDown = React.useCallback(() => {
    dispatchQuery(move(getQuery()!, path, 'down', { combinators }));
  }, [combinators, dispatchQuery, getQuery, path]);

  const shiftUpDisabled = React.useMemo(
    () => disabled || pathsAreEqual([0], path),
    [disabled, path]
  );
  const shiftDownDisabled = React.useMemo(
    () => disabled || (lastInGroup && path.length === 1),
    [disabled, lastInGroup, path.length]
  );

  return { shiftUp, shiftUpDisabled, shiftDown, shiftDownDisabled };
};
