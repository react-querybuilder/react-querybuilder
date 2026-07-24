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

/**
 * Inverse of {@link defaultCELSerializers} for the import direction (parsing). `operators` maps
 * CEL arithmetic node types (`Addition`, `Subtraction`, `Multiplication`, `Division`, `Modulo`)
 * to `fn` keys; `functions` maps CEL `FunctionCall` names to `fn` keys (empty by default —
 * custom only). The `min`/`max` emulated templates (`(a < b ? a : b)` / `(a > b ? a : b)`) are
 * recovered structurally, not via this registry.
 *
 * Note: `abs`, `upper`, and `lower` are **not** invertible — the CEL grammar does not parse the
 * unary-minus (`-x`) in the `abs` template nor the empty-argument `.upperAscii()`/`.lowerAscii()`
 * method calls the exporters emit.
 */
export interface CELInverse {
  operators: Record<string, string>;
  functions: Record<string, string>;
}

/** Built-in {@link CELInverse} registry (mirror of the invertible {@link defaultCELSerializers}). */
export const defaultCELInverse: CELInverse = {
  operators: {
    Addition: 'add',
    Subtraction: 'subtract',
    Multiplication: 'multiply',
    Division: 'divide',
    Modulo: 'mod',
  },
  functions: {},
};

/** `fn` keys recovered from CEL emulated templates (structural match, not via {@link CELInverse}). */
export const celTemplateFns = ['min', 'max'] as const;

/** Merges a custom {@link CELInverse} over the built-in {@link defaultCELInverse}. */
export const mergeCELInverse = (base: CELInverse, custom?: Partial<CELInverse>): CELInverse => ({
  operators: { ...base.operators, ...custom?.operators },
  functions: { ...base.functions, ...custom?.functions },
});
