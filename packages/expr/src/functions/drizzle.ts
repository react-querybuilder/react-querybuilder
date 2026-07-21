import type { DrizzleSerializerRegistry, DrizzleSqlTag } from '../types';

// least/greatest exist in PostgreSQL & MySQL; SQLite spells the row-wise variants min/max.
const leastGreatest =
  (name: 'least' | 'greatest', sqliteName: 'min' | 'max') =>
  (sql: DrizzleSqlTag, opts: { preset?: string }, ...args: unknown[]): unknown => {
    const fn = opts?.preset === 'sqlite' ? sqliteName : name;
    return sql`${sql.raw(fn)}(${sql.join(args, sql`, `)})`;
  };

/**
 * Built-in "drizzle" serializers. Arithmetic and `mod` emit parenthesized infix `SQL`
 * (`+ - * / %`); `abs` emits `abs(...)`; `min`/`max` emit `least(...)`/`greatest(...)`
 * (or `min(...)`/`max(...)` for the `sqlite` preset); `upper`/`lower` emit `upper(...)`/
 * `lower(...)`. Each serializer receives Drizzle's `sql` tag, the format options, then the
 * serialized argument operands.
 */
export const defaultDrizzleSerializers: DrizzleSerializerRegistry = {
  add: (sql, _o, a, b) => sql`(${a} + ${b})`,
  subtract: (sql, _o, a, b) => sql`(${a} - ${b})`,
  multiply: (sql, _o, a, b) => sql`(${a} * ${b})`,
  divide: (sql, _o, a, b) => sql`(${a} / ${b})`,
  mod: (sql, _o, a, b) => sql`(${a} % ${b})`,
  abs: (sql, _o, x) => sql`abs(${x})`,
  min: leastGreatest('least', 'min'),
  max: leastGreatest('greatest', 'max'),
  upper: (sql, _o, x) => sql`upper(${x})`,
  lower: (sql, _o, x) => sql`lower(${x})`,
};
