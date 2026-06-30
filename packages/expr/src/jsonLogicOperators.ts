import type { add_operation } from 'json-logic-js';

/**
 * Runtime registration for the non-stock JSONLogic operators emitted by
 * {@link defaultFunctions}.
 *
 * `formatQuery(query, 'jsonlogic')` (via {@link expressionRuleProcessorJsonLogic}) serializes
 * `abs`, `upper`, and `lower` to operator objects (e.g. `{ abs: { var: 'x' } }`). JSONLogic
 * ships `+ - * / %`, `min`, and `max` as built-ins, but not those three — they must be
 * registered on the JSONLogic instance before the exported logic can be applied.
 */

/** A JSONLogic custom-operator implementation (the `code` arg of `json-logic-js`'s `add_operation`). */
export type JsonLogicOperator = Parameters<typeof add_operation>[1];

/** Minimal shape of a JSONLogic instance that can register custom operators. */
export interface JsonLogicInstance {
  add_operation: (name: string, code: JsonLogicOperator) => void;
}

/**
 * Runtime implementations for the non-stock operators emitted by {@link defaultFunctions}.
 * Keys match the operator names produced by the default `abs`/`upper`/`lower` serializers.
 *
 * @example
 * ```ts
 * import * as jsonLogic from 'json-logic-js';
 * import { jsonLogicExpressionOperators } from '@react-querybuilder/expr';
 *
 * for (const [op, fn] of Object.entries(jsonLogicExpressionOperators)) {
 *   jsonLogic.add_operation(op, fn);
 * }
 * ```
 */
export const jsonLogicExpressionOperators: Record<'abs' | 'upper' | 'lower', JsonLogicOperator> = {
  abs: (value: unknown) => Math.abs(Number(value)),
  upper: (value: unknown) => String(value).toUpperCase(),
  lower: (value: unknown) => String(value).toLowerCase(),
};

/**
 * Registers expression operators on a JSONLogic instance (anything exposing `add_operation`,
 * e.g. `import * as jsonLogic from 'json-logic-js'`). Defaults to
 * {@link jsonLogicExpressionOperators}; pass a custom record to register operators for custom
 * expression functions too — spread the built-ins to keep `abs`/`upper`/`lower`.
 *
 * @example
 * ```ts
 * import * as jsonLogic from 'json-logic-js';
 * import {
 *   jsonLogicExpressionOperators,
 *   registerJsonLogicExpressionOperators,
 * } from '@react-querybuilder/expr';
 *
 * // Built-ins (abs/upper/lower):
 * registerJsonLogicExpressionOperators(jsonLogic);
 *
 * // ...plus operators for custom expression functions:
 * registerJsonLogicExpressionOperators(jsonLogic, {
 *   ...jsonLogicExpressionOperators,
 *   pow: (base: unknown, exp: unknown) => Math.pow(Number(base), Number(exp)),
 * });
 * ```
 */
export const registerJsonLogicExpressionOperators = (
  jsonLogic: JsonLogicInstance,
  operators: Record<string, JsonLogicOperator> = jsonLogicExpressionOperators
): void => {
  for (const [name, code] of Object.entries(operators)) {
    jsonLogic.add_operation(name, code);
  }
};
