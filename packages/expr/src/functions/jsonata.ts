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

/**
 * Inverse of {@link defaultJSONataSerializers}: maps JSONata infix operators and function names
 * back to `fn` keys for the import direction (parsing). Mirrors the {@link SQLInverse} shape.
 */
export interface JSONataInverse {
  /** Arithmetic infix operators, keyed by JSONata operator token. */
  operators: Record<string, string>;
  /** Function names (without the leading `$`), each mapping to an `fn` key. */
  functions: Record<string, string>;
}

/** Built-in {@link JSONataInverse} registry (mirror of {@link defaultJSONataSerializers}). */
export const defaultJSONataInverse: JSONataInverse = {
  operators: {
    '+': 'add',
    '-': 'subtract',
    '*': 'multiply',
    '/': 'divide',
    '%': 'mod',
  },
  functions: {
    abs: 'abs',
    min: 'min',
    max: 'max',
    uppercase: 'upper',
    lowercase: 'lower',
  },
};

/** Merges a custom {@link JSONataInverse} (partial) over the built-in {@link defaultJSONataInverse}. */
export const mergeJSONataInverse = (
  base: JSONataInverse,
  custom?: Partial<JSONataInverse>
): JSONataInverse => ({
  operators: { ...base.operators, ...custom?.operators },
  functions: { ...base.functions, ...custom?.functions },
});
