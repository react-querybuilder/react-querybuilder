import type { ExpressionFunctionRegistry } from './types';

/**
 * Built-in expression functions: arithmetic (`+ - * /`, serialized infix and
 * parenthesized for precedence safety), variadic `min`/`max`, binary `mod`, unary `abs`,
 * and string `upper`/`lower` — demonstrating call-style functions.
 *
 * JSONLogic note: `+ - * / %` and `min`/`max` are stock operators; `abs`, `upper`, and
 * `lower` are not — register them on your JSONLogic instance before applying the exported
 * logic via {@link registerJsonLogicExpressionOperators} (or override the serializer).
 */
export const defaultFunctions: ExpressionFunctionRegistry = {
  add: {
    label: '+',
    arity: 2,
    sql: (a, b) => `(${a} + ${b})`,
    parameterized: (a, b) => `(${a} + ${b})`,
    jsonLogic: (a, b) => ({ '+': [a, b] }),
  },
  subtract: {
    label: '-',
    arity: 2,
    sql: (a, b) => `(${a} - ${b})`,
    parameterized: (a, b) => `(${a} - ${b})`,
    jsonLogic: (a, b) => ({ '-': [a, b] }),
  },
  multiply: {
    label: '×',
    arity: 2,
    sql: (a, b) => `(${a} * ${b})`,
    parameterized: (a, b) => `(${a} * ${b})`,
    jsonLogic: (a, b) => ({ '*': [a, b] }),
  },
  divide: {
    label: '÷',
    arity: 2,
    sql: (a, b) => `(${a} / ${b})`,
    parameterized: (a, b) => `(${a} / ${b})`,
    jsonLogic: (a, b) => ({ '/': [a, b] }),
  },
  min: {
    label: 'MIN',
    arity: [2, Infinity],
    sql: (...args) => `LEAST(${args.map(a => `${a}`).join(', ')})`,
    parameterized: (...args) => `LEAST(${args.map(a => `${a}`).join(', ')})`,
    jsonLogic: (...args) => ({ min: args }),
  },
  max: {
    label: 'MAX',
    arity: [2, Infinity],
    sql: (...args) => `GREATEST(${args.map(a => `${a}`).join(', ')})`,
    parameterized: (...args) => `GREATEST(${args.map(a => `${a}`).join(', ')})`,
    jsonLogic: (...args) => ({ max: args }),
  },
  abs: {
    label: 'ABS',
    arity: 1,
    sql: x => `ABS(${x})`,
    parameterized: x => `ABS(${x})`,
    jsonLogic: x => ({ abs: x }),
  },
  mod: {
    label: 'MOD',
    arity: 2,
    sql: (a, b) => `(${a} % ${b})`,
    parameterized: (a, b) => `(${a} % ${b})`,
    jsonLogic: (a, b) => ({ '%': [a, b] }),
  },
  upper: {
    label: 'UPPER',
    arity: 1,
    sql: x => `UPPER(${x})`,
    parameterized: x => `UPPER(${x})`,
    jsonLogic: x => ({ upper: x }),
  },
  lower: {
    label: 'LOWER',
    arity: 1,
    sql: x => `LOWER(${x})`,
    parameterized: x => `LOWER(${x})`,
    jsonLogic: x => ({ lower: x }),
  },
};
