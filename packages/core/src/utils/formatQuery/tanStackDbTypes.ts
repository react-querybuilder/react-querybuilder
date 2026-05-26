import type { and, eq, gt, gte, inArray, isNull, like, lt, lte, not, or } from '@tanstack/db';

export interface TsDbOperators {
  and: typeof and;
  eq: typeof eq;
  gt: typeof gt;
  gte: typeof gte;
  inArray: typeof inArray;
  isNull: typeof isNull;
  like: typeof like;
  lt: typeof lt;
  lte: typeof lte;
  not: typeof not;
  or: typeof or;
}

export type TanStackDbWhereCallbackReturnType = ReturnType<typeof eq>;

export type TanStackDbWhereCallback = (
  refs: Record<string, unknown>
) => TanStackDbWhereCallbackReturnType;
