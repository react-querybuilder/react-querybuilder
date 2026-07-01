import type { ExpressionFunctionMetaRegistry } from '../types';

/**
 * Built-in expression function metadata (UI label + arity) for the arithmetic operators
 * (`+ - * /`), variadic `min`/`max`, binary `mod`, unary `abs`, and string `upper`/`lower`.
 * Serialization lives in the per-format serializer maps ({@link defaultSQLSerializers},
 * {@link defaultParameterizedSerializers}, {@link defaultJsonLogicSerializers}); this map
 * drives the expression UI and the format-agnostic validator.
 */
export const defaultFunctionMeta: ExpressionFunctionMetaRegistry = {
  add: { label: '+', arity: 2 },
  subtract: { label: '-', arity: 2 },
  multiply: { label: '×', arity: 2 },
  divide: { label: '÷', arity: 2 },
  min: { label: 'MIN', arity: [2, Infinity] },
  max: { label: 'MAX', arity: [2, Infinity] },
  abs: { label: 'ABS', arity: 1 },
  mod: { label: 'MOD', arity: 2 },
  upper: { label: 'UPPER', arity: 1 },
  lower: { label: 'LOWER', arity: 1 },
};
