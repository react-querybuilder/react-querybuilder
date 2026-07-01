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
