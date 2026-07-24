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

/**
 * Inverse of {@link defaultSpELSerializers} for the import direction (parsing). `operators` maps
 * SpEL arithmetic node types (`op-plus`/`op-minus`/`op-multiply`/`op-divide`/`op-modulus`) to
 * `fn` keys.
 *
 * NOTE: Only arithmetic infix operators are invertible. The function/method-based operations
 * (`abs`/`min`/`max` via `T(java.lang.Math)`, `upper`/`lower` via `.toUpperCase()`/`.toLowerCase()`,
 * and any custom function) are **not** invertible: core's SpEL processing collapses `method`/
 * `typeref`/`compound` nodes to `invalid` with no children before the parser runs, so those
 * operands never reach the import handler. Supporting them would require preserving those nodes
 * during processing (see the TODO in `@react-querybuilder/core`'s `parseSpEL` utils).
 */
export interface SpELInverse {
  operators: Record<string, string>;
}

/** Built-in {@link SpELInverse} registry (mirror of the invertible {@link defaultSpELSerializers}). */
export const defaultSpELInverse: SpELInverse = {
  operators: {
    'op-plus': 'add',
    'op-minus': 'subtract',
    'op-multiply': 'multiply',
    'op-divide': 'divide',
    'op-modulus': 'mod',
  },
};

/** Merges a custom {@link SpELInverse} over the built-in {@link defaultSpELInverse}. */
export const mergeSpELInverse = (
  base: SpELInverse,
  custom?: Partial<SpELInverse>
): SpELInverse => ({
  operators: { ...base.operators, ...custom?.operators },
});
