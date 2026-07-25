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
 * SpEL arithmetic node types (`op-plus`/`op-minus`/`op-divide`/`op-multiply`/`op-modulus`) to
 * `fn` keys, `functions` maps static/bare call names (`T(java.lang.Math).abs(...)`, `myFunc(...)`)
 * to `fn` keys, and `methods` maps instance method names (`.toUpperCase()`) to `fn` keys.
 */
export interface SpELInverse {
  operators: Record<string, string>;
  functions: Record<string, string>;
  methods: Record<string, string>;
}

/** Built-in {@link SpELInverse} registry (mirror of {@link defaultSpELSerializers}). */
export const defaultSpELInverse: SpELInverse = {
  operators: {
    'op-plus': 'add',
    'op-minus': 'subtract',
    'op-multiply': 'multiply',
    'op-divide': 'divide',
    'op-modulus': 'mod',
  },
  functions: {
    abs: 'abs',
    min: 'min',
    max: 'max',
  },
  methods: {
    toUpperCase: 'upper',
    toLowerCase: 'lower',
  },
};

/** Merges a custom {@link SpELInverse} over the built-in {@link defaultSpELInverse}. */
export const mergeSpELInverse = (
  base: SpELInverse,
  custom?: Partial<SpELInverse>
): SpELInverse => ({
  operators: { ...base.operators, ...custom?.operators },
  functions: { ...base.functions, ...custom?.functions },
  methods: { ...base.methods, ...custom?.methods },
});
