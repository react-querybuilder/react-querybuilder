import type { SQLSerializerRegistry } from '../types';

// Fold a variadic min/max into nested binary Math.min/Math.max calls.
const mathFold =
  (name: 'min' | 'max') =>
  (_opts: unknown, ...args: string[]): string =>
    args.reduce((acc, arg) => `Math.${name}(${acc}, ${arg})`);

/**
 * Built-in "elasticsearch" (Painless script) serializers. Arithmetic and `mod` emit
 * parenthesized infix (`+ - * / %`); `abs` emits `Math.abs(...)`; `min`/`max` fold into
 * nested `Math.min`/`Math.max`; `upper`/`lower` emit `.toUpperCase()`/`.toLowerCase()`.
 * Each serializer is opts-first (`(opts, ...args) => string`).
 */
export const defaultPainlessSerializers: SQLSerializerRegistry = {
  add: (_o, a, b) => `(${a} + ${b})`,
  subtract: (_o, a, b) => `(${a} - ${b})`,
  multiply: (_o, a, b) => `(${a} * ${b})`,
  divide: (_o, a, b) => `(${a} / ${b})`,
  mod: (_o, a, b) => `(${a} % ${b})`,
  abs: (_o, x) => `Math.abs(${x})`,
  min: mathFold('min'),
  max: mathFold('max'),
  upper: (_o, x) => `${x}.toUpperCase()`,
  lower: (_o, x) => `${x}.toLowerCase()`,
};
