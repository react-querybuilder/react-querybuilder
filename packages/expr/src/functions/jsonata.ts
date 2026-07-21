import type { SQLSerializerRegistry } from '../types';

/**
 * Built-in "jsonata" ([JSONata](https://jsonata.org/)) expression serializers. Arithmetic
 * and `mod` use native infix operators; `abs`/`min`/`max`/`uppercase`/`lowercase` map to
 * the built-in `$`-prefixed functions (`$min`/`$max` take an array argument).
 */
export const defaultJSONataSerializers: SQLSerializerRegistry = {
  add: (_o, a, b) => `(${a} + ${b})`,
  subtract: (_o, a, b) => `(${a} - ${b})`,
  multiply: (_o, a, b) => `(${a} * ${b})`,
  divide: (_o, a, b) => `(${a} / ${b})`,
  mod: (_o, a, b) => `(${a} % ${b})`,
  abs: (_o, x) => `$abs(${x})`,
  min: (_o, ...args) => `$min([${args.join(', ')}])`,
  max: (_o, ...args) => `$max([${args.join(', ')}])`,
  upper: (_o, x) => `$uppercase(${x})`,
  lower: (_o, x) => `$lowercase(${x})`,
};
