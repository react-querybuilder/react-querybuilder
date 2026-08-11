// Inline `import(...)` types instead of a top-level `import type`: the latter leaves a
// side-effect `import "@tanstack/db"` in the emitted declarations even when every binding is
// elided, which breaks consumers who don't install this optional peer dependency.
/** Internal: the real `@tanstack/db` module type, for body-level type checking only. */
// oxlint-disable-next-line typescript/consistent-type-imports -- see comment above
type TsDbModule = typeof import('@tanstack/db');

export interface TsDbOperators {
  and: TsDbModule['and'];
  eq: TsDbModule['eq'];
  gt: TsDbModule['gt'];
  gte: TsDbModule['gte'];
  inArray: TsDbModule['inArray'];
  isNull: TsDbModule['isNull'];
  like: TsDbModule['like'];
  lt: TsDbModule['lt'];
  lte: TsDbModule['lte'];
  not: TsDbModule['not'];
  or: TsDbModule['or'];
}

/**
 * Return type of the TanStack DB where-callback. Intentionally `unknown`: TanStack DB's own
 * `WhereCallback` returns `any`, so a precise type constrains nothing at the call site, and
 * naming `@tanstack/db` here would drag an optional peer dependency into the published types.
 */
export type TanStackDbWhereCallbackReturnType = unknown;

/** Internal: the real TanStack DB expression type, for body-level type checking only. */
export type TsDbExpression = ReturnType<TsDbModule['eq']>;

export type TanStackDbWhereCallback = (
  refs: Record<string, unknown>
) => TanStackDbWhereCallbackReturnType;
