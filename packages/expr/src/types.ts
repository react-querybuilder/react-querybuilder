import type { ExpressionNode, SQLPreset, ValueProcessorOptions } from '@react-querybuilder/core';

// `ExpressionNode` now lives in core; re-export so existing
// `import { ExpressionNode } from '../types'` paths keep resolving.
export type { ExpressionNode };

/**
 * UI/validation metadata for a function usable in an expression. Arithmetic operators
 * (`+ - * /`) are modeled as ordinary functions. This describes only how a function
 * appears and how many arguments it accepts — the per-format serializers live in their
 * own (internal) maps, mirroring the datetime package's format-specific processors.
 */
export interface ExpressionFunctionMeta {
  /** UI label, e.g. `'×'` or `'Absolute value'`. Falls back to the registry key. */
  label?: string;
  /**
   * Fixed arity (`number`) or inclusive range (`[min, max]`, e.g. `[n, Infinity]` for
   * variadic). Omit to leave the count unconstrained (any number of args, including 0).
   */
  arity?: number | [min: number, max: number];
}

/** Map of registry keys to {@link ExpressionFunctionMeta} definitions. */
export type ExpressionFunctionMetaRegistry = Record<string, ExpressionFunctionMeta>;

/**
 * SQL serializer function: receives the format options (for preset/`parseNumbers`
 * awareness) followed by the already-serialized argument strings, and returns a SQL
 * fragment.
 */
export type SQLSerializerFn = (opts: ValueProcessorOptions, ...args: string[]) => string;

/**
 * A SQL (or parameterized-SQL) serializer entry: either a single {@link SQLSerializerFn},
 * or a preset-keyed map for dialect variance. The `default` is used for any preset without
 * an explicit override (e.g. `min`/`max` emit `LEAST`/`GREATEST` by default but `MIN`/`MAX`
 * for the `sqlite` preset).
 */
export type SQLSerializer =
  | SQLSerializerFn
  | ({ default: SQLSerializerFn } & Partial<Record<SQLPreset, SQLSerializerFn>>);

/** Map of registry keys to {@link SQLSerializer} entries (the "sql" format). */
export type SQLSerializerRegistry = Record<string, SQLSerializer>;

/**
 * Map of registry keys to {@link SQLSerializer} entries (the "parameterized" /
 * "parameterized_named" formats). Identical in shape and signature to
 * {@link SQLSerializerRegistry} — serializers receive placeholder/field strings the same
 * way the "sql" serializers receive literals.
 */
export type ParameterizedSerializerRegistry = SQLSerializerRegistry;

/**
 * JSONLogic serializer: an operator name (wrapping the serialized args in `{ [op]: args }`),
 * or a function receiving the format options followed by the serialized args.
 */
export type JsonLogicSerializer =
  | string
  | ((opts: ValueProcessorOptions, ...args: unknown[]) => unknown);

/** Map of registry keys to {@link JsonLogicSerializer} entries. */
export type JsonLogicSerializerRegistry = Record<string, JsonLogicSerializer>;

/**
 * Expression operands resolved from a rule's `lhs` property and its `value`/`valueSource`
 * (when `valueSource` is `"expression"`). Returned by {@link getRuleExpressions}.
 */
export interface ResolvedExpressions {
  /** Left-hand side expression, from `rule.lhs`. */
  lhs?: ExpressionNode;
  /** Right-hand side expression, from `rule.value` when `valueSource` is `"expression"`. */
  rhs?: ExpressionNode;
}
