/**
 * Tracks how many _mounted_ `QueryBuilder` components are using each `qbId`.
 *
 * This is deliberately _not_ Redux state. Nothing renders from it, nothing needs to subscribe
 * to it, and it is ephemeral bookkeeping rather than application state. Keeping it out of the
 * store also avoids changing the shape of `QueriesSliceState` (a `Record<qbId, query>`, where
 * an extra key would collide with a legitimate `qbId`). Its lifetime matches the store, which
 * is itself a module-level singleton.
 */
const instanceCounts = new Map<string, number>();

/**
 * Registers a mounted `QueryBuilder` instance for the given `qbId`. Returns the number of
 * mounted instances using that `qbId` _after_ registration (i.e., >1 means a collision).
 */
export const registerQbId = (qbId: string): number => {
  const count = (instanceCounts.get(qbId) ?? 0) + 1;
  instanceCounts.set(qbId, count);
  return count;
};

/**
 * Unregisters an unmounting `QueryBuilder` instance for the given `qbId`. Returns the number of
 * mounted instances using that `qbId` _after_ unregistration (i.e., 0 means the last instance
 * has unmounted and the query state can be torn down).
 */
export const unregisterQbId = (qbId: string): number => {
  const count = (instanceCounts.get(qbId) ?? 0) - 1;
  if (count > 0) {
    instanceCounts.set(qbId, count);
    return count;
  }
  instanceCounts.delete(qbId);
  return 0;
};

/**
 * Returns the number of mounted `QueryBuilder` instances using the given `qbId`.
 */
export const getQbIdInstanceCount = (qbId: string): number => instanceCounts.get(qbId) ?? 0;

/**
 * Clears the entire registry. Only intended for tests.
 */
export const _RQB_INTERNAL_clearQbIdRegistry = (): void => {
  instanceCounts.clear();
};
