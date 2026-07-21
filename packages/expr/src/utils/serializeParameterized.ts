import type { ValueProcessorOptions } from '@react-querybuilder/core';
import { getQuotedFieldName } from '@react-querybuilder/core';
import type { ExpressionNode, ParameterizedSerializerRegistry } from '../types';
import { coerceLeafValue } from './leafValue';
import { resolvePresetSerializer } from './resolvePresetSerializer';

/** Mutable context threaded through {@link serializeParameterized}. */
export interface ParameterizedSerializeContext {
  serializers: ParameterizedSerializerRegistry;
  options: ValueProcessorOptions;
  /** `true` for the "parameterized" (array) format, `false` for "parameterized_named". */
  parameterized: boolean;
  /** Count of params already bound by preceding rules (for numbered placeholders). */
  processedParamsLength: number;
  /** Safe identifier base for generated named parameters. */
  paramBase: string;
  /** Local array accumulator (parameterized format). */
  params: unknown[];
  /** Local named accumulator (parameterized_named format). */
  paramsNamed: Record<string, unknown>;
}

/**
 * Recursively serializes an expression node to a parameterized SQL fragment, binding
 * `value` leaves as placeholders (`?` / numbered / `:name`) and pushing their values into
 * the context accumulators. `field` nodes inline the quoted field name; `func` nodes
 * delegate to the registered `parameterized` serializer, resolved for the active preset
 * and invoked opts-first.
 */
export const serializeParameterized = (
  node: ExpressionNode,
  ctx: ParameterizedSerializeContext
): string => {
  if (node.kind === 'field') {
    return getQuotedFieldName(node.field, ctx.options);
  }
  if (node.kind === 'value') {
    const { options } = ctx;
    const paramPrefix = options.paramPrefix ?? ':';
    const value = coerceLeafValue(node, options.parseNumbers);
    if (ctx.parameterized) {
      ctx.params.push(value);
      return options.numberedParams
        ? `${paramPrefix}${ctx.processedParamsLength + ctx.params.length}`
        : '?';
    }
    const name = options.getNextNamedParam!(ctx.paramBase);
    ctx.paramsNamed[`${options.paramsKeepPrefix ? paramPrefix : ''}${name}`] = value;
    return `${paramPrefix}${name}`;
  }
  const serializer = ctx.serializers[node.fn];
  if (!serializer) {
    throw new Error(`No "parameterized" serializer for expression function "${node.fn}"`);
  }
  const args = node.args.map(arg => serializeParameterized(arg, ctx));
  return resolvePresetSerializer(serializer, ctx.options.preset)(ctx.options, ...args);
};
