import type { ValueProcessorOptions } from '@react-querybuilder/core';
import type { ExpressionNode, MongoAggSerializerRegistry } from '../types';
import { coerceLeafValue } from './leafValue';

/**
 * Recursively serializes an expression node to a MongoDB aggregation-expression value.
 * `field` nodes become the field-path string `"$field"`; `value` nodes emit the raw
 * (number-coerced) literal; `func` nodes delegate to the registered aggregation serializer
 * (an operator name wrapping the args in `{ [op]: args }`, or an opts-first function).
 */
export const serializeMongoAgg = (
  node: ExpressionNode,
  serializers: MongoAggSerializerRegistry,
  options: ValueProcessorOptions = {}
): unknown => {
  if (node.kind === 'field') {
    return `$${node.field}`;
  }
  if (node.kind === 'value') {
    return coerceLeafValue(node);
  }
  const serializer = serializers[node.fn];
  if (!serializer) {
    throw new Error(`No "mongodb" serializer for expression function "${node.fn}"`);
  }
  const args = node.args.map(arg => serializeMongoAgg(arg, serializers, options));
  return typeof serializer === 'function' ? serializer(options, ...args) : { [serializer]: args };
};
