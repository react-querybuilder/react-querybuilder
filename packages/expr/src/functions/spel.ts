import type { SQLSerializerRegistry } from '../types';

/**
 * Built-in "spel" (Spring Expression Language) expression serializers. Arithmetic and `mod`
 * use native infix operators; `abs`/`min`/`max` delegate to `java.lang.Math`;
 * `upper`/`lower` use `String#toUpperCase()`/`toLowerCase()`.
 */
export const defaultSpELSerializers: SQLSerializerRegistry = {
  add: (_o, a, b) => `(${a} + ${b})`,
  subtract: (_o, a, b) => `(${a} - ${b})`,
  multiply: (_o, a, b) => `(${a} * ${b})`,
  divide: (_o, a, b) => `(${a} / ${b})`,
  mod: (_o, a, b) => `(${a} % ${b})`,
  abs: (_o, x) => `T(java.lang.Math).abs(${x})`,
  min: (_o, ...args) => args.reduce((a, b) => `T(java.lang.Math).min(${a}, ${b})`),
  max: (_o, ...args) => args.reduce((a, b) => `T(java.lang.Math).max(${a}, ${b})`),
  upper: (_o, x) => `${x}.toUpperCase()`,
  lower: (_o, x) => `${x}.toLowerCase()`,
};
