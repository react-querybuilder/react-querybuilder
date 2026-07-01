import type { SQLSerializerRegistry } from '../types';

/**
 * Built-in "sql" serializers: arithmetic (`+ - * /`, infix and parenthesized for precedence
 * safety), variadic `min`/`max`, binary `mod`, unary `abs`, and string `upper`/`lower`.
 * Each serializer is opts-first (`(opts, ...args) => string`); the built-ins ignore `opts`
 * except `min`/`max`, which vary by SQL preset.
 *
 * `min`/`max` emit `LEAST`/`GREATEST` by default (PostgreSQL, MySQL 8+, Oracle, and
 * SQL Server 2022+ / Azure SQL), overridden to the scalar `MIN`/`MAX` for the `sqlite`
 * preset. Older SQL Server (pre-2022) has no row-wise scalar equivalent and falls back to
 * `LEAST`/`GREATEST`.
 */
export const defaultSQLSerializers: SQLSerializerRegistry = {
  add: (_opts, a, b) => `(${a} + ${b})`,
  subtract: (_opts, a, b) => `(${a} - ${b})`,
  multiply: (_opts, a, b) => `(${a} * ${b})`,
  divide: (_opts, a, b) => `(${a} / ${b})`,
  min: {
    default: (_opts, ...args) => `LEAST(${args.join(', ')})`,
    sqlite: (_opts, ...args) => `MIN(${args.join(', ')})`,
  },
  max: {
    default: (_opts, ...args) => `GREATEST(${args.join(', ')})`,
    sqlite: (_opts, ...args) => `MAX(${args.join(', ')})`,
  },
  abs: (_opts, x) => `ABS(${x})`,
  mod: (_opts, a, b) => `(${a} % ${b})`,
  upper: (_opts, x) => `UPPER(${x})`,
  lower: (_opts, x) => `LOWER(${x})`,
};
