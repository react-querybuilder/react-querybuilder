import * as React from 'react';
import type { Path, Schema } from '../types';
import { move } from '../utils';

type UseShiftActionsProps = { path: Path } & Pick<
  Schema,
  'combinators' | 'dispatchQuery' | 'getQuery'
>;

/**
 * Generates `shiftUp` and `shiftDown` methods for
 * {@link ShiftActions} components.
 */
export const useShiftActions = ({
  combinators,
  dispatchQuery,
  getQuery,
  path,
}: UseShiftActionsProps) => {
  const shiftUp = React.useCallback(() => {
    dispatchQuery(move(getQuery()!, path, 'up', { combinators }));
  }, [combinators, dispatchQuery, getQuery, path]);

  const shiftDown = React.useCallback(() => {
    dispatchQuery(move(getQuery()!, path, 'down', { combinators }));
  }, [combinators, dispatchQuery, getQuery, path]);

  return { shiftUp, shiftDown };
};
