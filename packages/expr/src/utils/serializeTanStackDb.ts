import type { ValueProcessorOptions } from '@react-querybuilder/core';
import type { ExpressionNode, TanStackDbSerializerRegistry } from '../types';
import { coerceLeafValue } from './leafValue';

/**
 * TanStack DB serialization context: the `ops` object (expression functions) and a
 * `resolveField` resolver mapping a field name to its ref column (dotted → `refs.prefix.rest`,
 * bare → `refs[primaryRef].field`), matching the stock processor.
 */
export interface TanStackDbSerializeContext {
  ops: Record<string, (...args: unknown[]) => unknown>;
  resolveField: (field: string) => unknown;
}

/**
 * Recursively serializes an expression node to a TanStack DB expression. `field` nodes
 * resolve to ref columns; `parameter` nodes emit the name as a string literal; `value` nodes
 * emit the raw (number-coerced) literal; `func` nodes delegate to the registered serializer.
 * Throws for unknown functions (caller validates first to omit such rules).
 */
export const serializeTanStackDb = (
  node: ExpressionNode,
  serializers: TanStackDbSerializerRegistry,
  ctx: TanStackDbSerializeContext,
  options: ValueProcessorOptions = {}
): unknown => {
  if (node.kind === 'field') {
    return ctx.resolveField(node.field);
  }
  if (node.kind === 'parameter') {
    return node.parameter;
  }
  if (node.kind === 'value') {
    return coerceLeafValue(node, options.parseNumbers ? true : undefined);
  }
  const serializer = serializers[node.fn];
  if (!serializer) {
    throw new Error(`No "tanstack_db" serializer for expression function "${node.fn}"`);
  }
  const args = node.args.map(arg => serializeTanStackDb(arg, serializers, ctx, options));
  return serializer(ctx.ops, options, ...args);
};
