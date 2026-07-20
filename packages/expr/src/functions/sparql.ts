import type { SQLSerializerRegistry } from '../types';

/**
 * Built-in "sparql" (SPARQL 1.1 FILTER expression) serializers. Arithmetic uses native
 * infix operators; `abs`/`ucase`/`lcase` are native functions. SPARQL FILTER has no scalar
 * `mod`/`min`/`max`, so `mod` is emulated with `FLOOR` and `min`/`max` with `IF`.
 */
export const defaultSPARQLSerializers: SQLSerializerRegistry = {
  add: (_o, a, b) => `(${a} + ${b})`,
  subtract: (_o, a, b) => `(${a} - ${b})`,
  multiply: (_o, a, b) => `(${a} * ${b})`,
  divide: (_o, a, b) => `(${a} / ${b})`,
  mod: (_o, a, b) => `(${a} - ${b} * FLOOR(${a} / ${b}))`,
  abs: (_o, x) => `ABS(${x})`,
  min: (_o, ...args) => args.reduce((a, b) => `IF(${a} < ${b}, ${a}, ${b})`),
  max: (_o, ...args) => args.reduce((a, b) => `IF(${a} > ${b}, ${a}, ${b})`),
  upper: (_o, x) => `UCASE(${x})`,
  lower: (_o, x) => `LCASE(${x})`,
};
