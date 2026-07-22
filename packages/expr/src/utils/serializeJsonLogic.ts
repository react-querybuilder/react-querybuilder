import type { ValueProcessorOptions } from '@react-querybuilder/core';
import type { ExpressionNode, JsonLogicSerializerRegistry } from '../types';
import { coerceLeafValue } from './leafValue';

/**
 * Recursively serializes an expression node to a JSONLogic value. `field` nodes become
 * `{ var: field }`; `parameter` nodes emit the name as a string literal; `value` nodes emit
 * the raw (number-coerced) value; `func` nodes delegate to the registered `jsonLogic`
 * serializer (an operator name, or an opts-first function).
 */
export const serializeJsonLogic = (
  node: ExpressionNode,
  serializers: JsonLogicSerializerRegistry,
  options: ValueProcessorOptions = {}
): unknown => {
  if (node.kind === 'field') {
    return { var: node.field };
  }
  if (node.kind === 'parameter') {
    return node.parameter;
  }
  if (node.kind === 'value') {
    return coerceLeafValue(node);
  }
  const serializer = serializers[node.fn];
  if (!serializer) {
    throw new Error(`No "jsonLogic" serializer for expression function "${node.fn}"`);
  }
  const args = node.args.map(arg => serializeJsonLogic(arg, serializers, options));
  return typeof serializer === 'function' ? serializer(options, ...args) : { [serializer]: args };
};
