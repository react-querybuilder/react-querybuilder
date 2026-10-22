// oxlint-disable typescript/no-explicit-any
// Lightweight stand-in for `drizzle-orm`, mapped via `paths` in projects that only reach it
// transitively (through core's formatQuery processors). Real types are checked in projects that
// use `tsconfig.base.orm.json`.
export type Column = any;
export type Operators = any;
export type SQLWrapper = any;
export type Table = any;
export type SQL = any;
export declare namespace SQL {
  type Aliased = any;
}
