import type { MongoAggSerializerRegistry } from '../types';

/**
 * Built-in "mongodb_query" aggregation-expression serializers. Arithmetic (`$add`,
 * `$subtract`, `$multiply`, `$divide`), `min`/`max` (`$min`/`$max`), `mod` (`$mod`), and
 * `abs` (`$abs`) map to native aggregation operators; `upper`/`lower` map to `$toUpper`/
 * `$toLower`. Each function serializer is opts-first (`(opts, ...args) => unknown`); the
 * built-ins ignore `opts`.
 */
export const defaultMongoDBSerializers: MongoAggSerializerRegistry = {
  add: (_opts, a, b) => ({ $add: [a, b] }),
  subtract: (_opts, a, b) => ({ $subtract: [a, b] }),
  multiply: (_opts, a, b) => ({ $multiply: [a, b] }),
  divide: (_opts, a, b) => ({ $divide: [a, b] }),
  min: (_opts, ...args) => ({ $min: args }),
  max: (_opts, ...args) => ({ $max: args }),
  abs: (_opts, x) => ({ $abs: x }),
  mod: (_opts, a, b) => ({ $mod: [a, b] }),
  upper: (_opts, x) => ({ $toUpper: x }),
  lower: (_opts, x) => ({ $toLower: x }),
};

/**
 * Inverse of {@link defaultMongoDBSerializers}: maps MongoDB aggregation-operator names to
 * `fn` keys for the import direction (parsing). Keyed by operator token (e.g. `$multiply`).
 */
export type MongoDBInverse = Record<string, string>;

/** Built-in {@link MongoDBInverse} registry (mirror of {@link defaultMongoDBSerializers}). */
export const defaultMongoDBInverse: MongoDBInverse = {
  $add: 'add',
  $subtract: 'subtract',
  $multiply: 'multiply',
  $divide: 'divide',
  $min: 'min',
  $max: 'max',
  $abs: 'abs',
  $mod: 'mod',
  $toUpper: 'upper',
  $toLower: 'lower',
};

/** Merges a custom {@link MongoDBInverse} over the built-in {@link defaultMongoDBInverse}. */
export const mergeMongoDBInverse = (
  base: MongoDBInverse,
  custom?: MongoDBInverse
): MongoDBInverse => ({ ...base, ...custom });
