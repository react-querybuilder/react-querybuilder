import type { ValueProcessorOptions } from '@react-querybuilder/core';
import type { ExpressionNode, SQLSerializerRegistry } from '../types';
import { coerceLeafValue } from './leafValue';
import { resolvePresetSerializer } from './resolvePresetSerializer';

type ValueNode = Extract<ExpressionNode, { kind: 'value' }>;

/**
 * Per-format hooks for the shared string ("infix") expression walker. `renderField` quotes
 * a field reference for the target language (e.g. bare `field`, `?field`); `renderLeaf`
 * renders a `value` leaf (numbers bare, strings quoted/escaped per dialect).
 */
export interface InfixDialect {
  renderField: (field: string, opts: ValueProcessorOptions) => string;
  renderLeaf: (node: ValueNode, opts: ValueProcessorOptions) => string;
}

/** Quotes a non-numeric leaf value with `quote`, escaping embedded quote chars when asked. */
export const quoteLeaf = (node: ValueNode, quote: string, opts: ValueProcessorOptions): string => {
  const v = coerceLeafValue(node, opts.parseNumbers);
  if (typeof v === 'number' || typeof v === 'bigint' || typeof v === 'boolean') return `${v}`;
  const s = `${v}`;
  const escaped = opts.escapeQuotes ? s.replaceAll(quote, `\\${quote}`) : s;
  return `${quote}${escaped}${quote}`;
};

/**
 * Recursively serializes an expression node to a string fragment for the "infix" string
 * formats (cel, spel, cypher, sparql, jsonata). `field`/`value` leaves defer to the
 * {@link InfixDialect}; `func` nodes delegate to the registered serializer (a
 * `(opts, ...args) => string`), resolved for the active preset and invoked opts-first.
 */
export const serializeInfix = (
  node: ExpressionNode,
  serializers: SQLSerializerRegistry,
  dialect: InfixDialect,
  opts: ValueProcessorOptions = {}
): string => {
  if (node.kind === 'field') return dialect.renderField(node.field, opts);
  if (node.kind === 'value') return dialect.renderLeaf(node, opts);
  const serializer = serializers[node.fn];
  if (!serializer) {
    throw new Error(`No serializer for expression function "${node.fn}"`);
  }
  const args = node.args.map(arg => serializeInfix(arg, serializers, dialect, opts));
  return resolvePresetSerializer(serializer, opts.preset)(opts, ...args);
};
