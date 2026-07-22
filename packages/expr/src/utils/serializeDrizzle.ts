import type { ValueProcessorOptions } from '@react-querybuilder/core';
import type { DrizzleSerializerRegistry, DrizzleSqlTag, ExpressionNode } from '../types';
import { coerceLeafValue } from './leafValue';

/**
 * Drizzle serialization context: the `sql` template tag and the `columns` map (both taken
 * from `formatQuery`'s `context`), used to resolve `field` operands to Drizzle `Column`s.
 */
export interface DrizzleSerializeContext {
  sql: DrizzleSqlTag;
  columns: Record<string, unknown>;
}

/**
 * Recursively serializes an expression node to a Drizzle operand (`Column`, `SQL` fragment,
 * or literal). `field` nodes resolve to `columns[field]`; `parameter` nodes emit the name as
 * a string literal; `value` nodes emit the raw (number-coerced) literal (interpolated as a
 * bound parameter by callers); `func` nodes delegate to the registered Drizzle serializer.
 * Throws if a referenced column is missing.
 */
export const serializeDrizzle = (
  node: ExpressionNode,
  serializers: DrizzleSerializerRegistry,
  ctx: DrizzleSerializeContext,
  options: ValueProcessorOptions = {}
): unknown => {
  if (node.kind === 'field') {
    const column = ctx.columns[node.field];
    if (!column) {
      throw new Error(`No Drizzle column for expression field "${node.field}"`);
    }
    return column;
  }
  if (node.kind === 'parameter') {
    return node.parameter;
  }
  if (node.kind === 'value') {
    return coerceLeafValue(node, options.parseNumbers ? true : undefined);
  }
  const serializer = serializers[node.fn];
  if (!serializer) {
    throw new Error(`No "drizzle" serializer for expression function "${node.fn}"`);
  }
  const args = node.args.map(arg => serializeDrizzle(arg, serializers, ctx, options));
  return serializer(ctx.sql, options, ...args);
};
