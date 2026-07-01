import type { add_operation } from 'json-logic-js';

/** A JSONLogic custom-operator implementation (the `code` arg of `json-logic-js`'s `add_operation`). */
export type JsonLogicOperator = Parameters<typeof add_operation>[1];

/**
 * Runtime implementations for the non-stock operators emitted by {@link defaultJsonLogicSerializers}.
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
