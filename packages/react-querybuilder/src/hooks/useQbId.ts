import { generateID } from '@react-querybuilder/core';
import { useCallback, useState } from 'react';
import { messages } from '../messages';
import { rqbWarn, useRQB_INTERNAL_QueryBuilderDispatch } from '../redux/_internal';

export interface UseQbId {
  /** The identifier this query builder is actually using. */
  qbId: string;
  /**
   * Abandons the current identifier in favor of a generated one. Called when the registration
   * effect determines that another mounted query builder is already using this identifier.
   */
  resolveQbIdCollision: () => void;
}

/**
 * Manages the `qbId` for a {@link QueryBuilder} instance.
 *
 * The `qbId` prop is only evaluated when the component mounts—changing it later logs an error
 * (in non-production modes) and is otherwise ignored.
 *
 * Collision detection deliberately happens in an effect (see `resolveQbIdCollision`) rather
 * than during render. The instance registry only reflects _committed_ query builders, and when
 * a query builder is unmounted and remounted with the same `qbId` in a single commit, the
 * outgoing instance is still registered while the incoming one renders. Checking during render
 * would flag that legitimate pattern as a collision; by the time effects run, React has already
 * flushed the outgoing instance's cleanup, so the count is accurate.
 *
 * @group Hooks
 */
export const useQbId = (qbIdProp?: string): UseQbId => {
  const dispatch = useRQB_INTERNAL_QueryBuilderDispatch();
  const [qbId, setQbId] = useState(() => qbIdProp ?? generateID());
  const [initialQbIdProp] = useState(qbIdProp);

  // v8 ignore else
  if (process.env.NODE_ENV !== 'production') {
    if (qbIdProp !== initialQbIdProp) {
      dispatch(rqbWarn(messages.errorChangedQbId));
    }
  }

  const resolveQbIdCollision = useCallback(() => {
    // v8 ignore else
    if (process.env.NODE_ENV !== 'production') {
      dispatch(rqbWarn(messages.errorDuplicateQbId));
    }
    setQbId(generateID());
  }, [dispatch]);

  return { qbId, resolveQbIdCollision };
};
