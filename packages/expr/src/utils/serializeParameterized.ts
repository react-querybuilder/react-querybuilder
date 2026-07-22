import type { ValueProcessorOptions } from '@react-querybuilder/core';
import { getQuotedFieldName, stripParamPrefix, withParamPrefix } from '@react-querybuilder/core';
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
 * the context accumulators. `field` nodes inline the quoted field name; `parameter` nodes
 * emit a (prefix-aware) bind-variable reference to an externally-supplied binding; `func`
 * nodes delegate to the registered `parameterized` serializer, resolved for the active
 * preset and invoked opts-first.
 */
export const serializeParameterized = (
  node: ExpressionNode,
  ctx: ParameterizedSerializeContext
): string => {
  if (node.kind === 'field') {
    return getQuotedFieldName(node.field, ctx.options);
  }
  if (node.kind === 'parameter') {
    // Named-parameter reference: emit inline (binding supplied externally). For
    // "parameterized_named", register the key with a `null` placeholder (respecting
    // `paramsKeepPrefix`) so callers see the expected binding. Positional "parameterized"
    // pushes nothing, to avoid desyncing placeholder indices.
    const paramPrefix = ctx.options.paramPrefix ?? ':';
    const ref = withParamPrefix(node.parameter, paramPrefix);
    if (!ctx.parameterized) {
      ctx.paramsNamed[
        ctx.options.paramsKeepPrefix ? ref : stripParamPrefix(node.parameter, paramPrefix)
      ] = null;
    }
    return ref;
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
