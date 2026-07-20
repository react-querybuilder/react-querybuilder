import type { SQLSerializerRegistry } from '../types';

/**
 * Built-in "cypher"/"gql" (openCypher / GQL) expression serializers. Arithmetic and `mod`
 * use native infix operators; `abs`/`toUpper`/`toLower` are native functions; scalar
 * `min`/`max` (Cypher's `min`/`max` are aggregates) are emulated with `CASE` expressions.
 */
export const defaultCypherSerializers: SQLSerializerRegistry = {
  add: (_o, a, b) => `(${a} + ${b})`,
  subtract: (_o, a, b) => `(${a} - ${b})`,
  multiply: (_o, a, b) => `(${a} * ${b})`,
  divide: (_o, a, b) => `(${a} / ${b})`,
  mod: (_o, a, b) => `(${a} % ${b})`,
  abs: (_o, x) => `abs(${x})`,
  min: (_o, ...args) => args.reduce((a, b) => `CASE WHEN ${a} < ${b} THEN ${a} ELSE ${b} END`),
  max: (_o, ...args) => args.reduce((a, b) => `CASE WHEN ${a} > ${b} THEN ${a} ELSE ${b} END`),
  upper: (_o, x) => `toUpper(${x})`,
  lower: (_o, x) => `toLower(${x})`,
};
