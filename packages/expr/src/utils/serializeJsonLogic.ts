import type { ExpressionFunctionRegistry, ExpressionNode } from '../types';
import { coerceLeafValue } from './leafValue';

/**
 * Recursively serializes an expression node to a JSONLogic value. `field` nodes become
 * `{ var: field }`; `value` nodes emit the raw (number-coerced) value; `func` nodes
 * delegate to the registered `jsonLogic` serializer (a function or an operator name).
 */
export const serializeJsonLogic = (
  node: ExpressionNode,
  registry: ExpressionFunctionRegistry
): unknown => {
  if (node.kind === 'field') {
    return { var: node.field };
  }
  if (node.kind === 'value') {
    return coerceLeafValue(node);
  }
  const fn = registry[node.fn];
  if (!fn?.jsonLogic) {
    throw new Error(`No "jsonLogic" serializer for expression function "${node.fn}"`);
  }
  const args = node.args.map(arg => serializeJsonLogic(arg, registry));
  return typeof fn.jsonLogic === 'function' ? fn.jsonLogic(...args) : { [fn.jsonLogic]: args };
};
