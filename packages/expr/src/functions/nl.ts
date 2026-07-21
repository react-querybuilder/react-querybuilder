import type { SQLSerializerRegistry } from '../types';

/**
 * Built-in "natural_language" serializers rendering each function as an English noun phrase
 * (e.g. `the product of X and Y`, `the absolute value of X`). `min`/`max` join their operands
 * with commas. Each serializer is opts-first (`(opts, ...args) => string`).
 */
export const defaultNLSerializers: SQLSerializerRegistry = {
  add: (_o, a, b) => `the sum of ${a} and ${b}`,
  subtract: (_o, a, b) => `the difference of ${a} and ${b}`,
  multiply: (_o, a, b) => `the product of ${a} and ${b}`,
  divide: (_o, a, b) => `the quotient of ${a} and ${b}`,
  mod: (_o, a, b) => `the remainder of ${a} divided by ${b}`,
  abs: (_o, x) => `the absolute value of ${x}`,
  min: (_o, ...args) => `the minimum of ${args.join(', ')}`,
  max: (_o, ...args) => `the maximum of ${args.join(', ')}`,
  upper: (_o, x) => `the uppercase of ${x}`,
  lower: (_o, x) => `the lowercase of ${x}`,
};
