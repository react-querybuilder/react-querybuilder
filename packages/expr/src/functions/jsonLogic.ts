import type { JsonLogicSerializerRegistry } from '../types';

/**
 * Built-in "jsonlogic" serializers. Arithmetic (`+ - * /`), `min`/`max`, and `mod` (`%`)
 * map to stock JSONLogic operators; `abs`, `upper`, and `lower` emit same-named custom
 * operators (register them on your JSONLogic instance via {@link jsonLogicExpressionOperators}
 * before applying the exported logic). Each function serializer is opts-first
 * (`(opts, ...args) => unknown`); the built-ins ignore `opts`.
 */
export const defaultJsonLogicSerializers: JsonLogicSerializerRegistry = {
  add: (_opts, a, b) => ({ '+': [a, b] }),
  subtract: (_opts, a, b) => ({ '-': [a, b] }),
  multiply: (_opts, a, b) => ({ '*': [a, b] }),
  divide: (_opts, a, b) => ({ '/': [a, b] }),
  min: (_opts, ...args) => ({ min: args }),
  max: (_opts, ...args) => ({ max: args }),
  abs: (_opts, x) => ({ abs: x }),
  mod: (_opts, a, b) => ({ '%': [a, b] }),
  upper: (_opts, x) => ({ upper: x }),
  lower: (_opts, x) => ({ lower: x }),
};

/**
 * Inverse of {@link defaultJsonLogicSerializers}: maps a JsonLogic operation object's key back
 * to an `fn` key for the import direction (parsing). Two-argument operators (`+ - * / %`),
 * variadic (`min`/`max`), and unary (`abs`/`upper`/`lower`) all share one flat key→`fn` map;
 * the parser reads a node's payload as an array (or wraps a scalar) to recover its arguments.
 */
export type JsonLogicInverse = Record<string, string>;

/** Built-in {@link JsonLogicInverse} registry (mirror of {@link defaultJsonLogicSerializers}). */
export const defaultJsonLogicInverse: JsonLogicInverse = {
  '+': 'add',
  '-': 'subtract',
  '*': 'multiply',
  '/': 'divide',
  '%': 'mod',
  min: 'min',
  max: 'max',
  abs: 'abs',
  upper: 'upper',
  lower: 'lower',
};

/**
 * Merges a custom {@link JsonLogicInverse} (partial) over the built-in
 * {@link defaultJsonLogicInverse}.
 */
export const mergeJsonLogicInverse = (
  base: JsonLogicInverse,
  custom?: JsonLogicInverse
): JsonLogicInverse => ({ ...base, ...custom });
