import type { ExpressionFunctionRegistry } from './types';

/**
 * Built-in expression functions: the four arithmetic operators (serialized infix and
 * parenthesized for precedence safety) plus `abs` to demonstrate call-style functions.
 *
 * Note: JSONLogic's `+ - * /` are stock operators, but `abs` is not — consumers must
 * register it (`jsonLogic.add_operation('abs', Math.abs)`) or override the serializer.
 */
export const defaultFunctions: ExpressionFunctionRegistry = {
  add: {
    label: '+',
    arity: 2,
    returnType: 'number',
    sql: (a, b) => `(${a} + ${b})`,
    parameterized: (a, b) => `(${a} + ${b})`,
    jsonLogic: (a, b) => ({ '+': [a, b] }),
  },
  subtract: {
    label: '-',
    arity: 2,
    returnType: 'number',
    sql: (a, b) => `(${a} - ${b})`,
    parameterized: (a, b) => `(${a} - ${b})`,
    jsonLogic: (a, b) => ({ '-': [a, b] }),
  },
  multiply: {
    label: '×',
    arity: 2,
    returnType: 'number',
    sql: (a, b) => `(${a} * ${b})`,
    parameterized: (a, b) => `(${a} * ${b})`,
    jsonLogic: (a, b) => ({ '*': [a, b] }),
  },
  divide: {
    label: '÷',
    arity: 2,
    returnType: 'number',
    sql: (a, b) => `(${a} / ${b})`,
    parameterized: (a, b) => `(${a} / ${b})`,
    jsonLogic: (a, b) => ({ '/': [a, b] }),
  },
  abs: {
    label: 'ABS',
    arity: 1,
    returnType: 'number',
    sql: x => `ABS(${x})`,
    parameterized: x => `ABS(${x})`,
    jsonLogic: x => ({ abs: [x] }),
  },
};
