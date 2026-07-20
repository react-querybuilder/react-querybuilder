import type { SQLSerializerRegistry } from '../types';

/**
 * Built-in "cel" ([CEL](https://cel.dev/)) expression serializers. Arithmetic and `mod`
 * use native infix operators; `abs`/`min`/`max` use native conditional expressions;
 * `upper`/`lower` use the CEL strings-extension `.upperAscii()`/`.lowerAscii()` macros.
 */
export const defaultCELSerializers: SQLSerializerRegistry = {
  add: (_o, a, b) => `(${a} + ${b})`,
  subtract: (_o, a, b) => `(${a} - ${b})`,
  multiply: (_o, a, b) => `(${a} * ${b})`,
  divide: (_o, a, b) => `(${a} / ${b})`,
  mod: (_o, a, b) => `(${a} % ${b})`,
  abs: (_o, x) => `(${x} < 0 ? -${x} : ${x})`,
  min: (_o, ...args) => args.reduce((a, b) => `(${a} < ${b} ? ${a} : ${b})`),
  max: (_o, ...args) => args.reduce((a, b) => `(${a} > ${b} ? ${a} : ${b})`),
  upper: (_o, x) => `${x}.upperAscii()`,
  lower: (_o, x) => `${x}.lowerAscii()`,
};
