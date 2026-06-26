import type { ExpressionNode } from '@react-querybuilder/core';

// `ExpressionNode` now lives in core; re-export so existing
// `import { ExpressionNode } from '../types'` paths keep resolving.
export type { ExpressionNode };

/**
 * Definition of a function usable in an expression. Arithmetic operators (`+ - * /`)
 * are modeled as ordinary functions. Each per-format serializer receives the
 * already-serialized argument strings/values.
 */
export interface ExpressionFunction {
  /** UI label, e.g. `'×'` or `'Absolute value'`. */
  label?: string;
  /** Fixed arity (`number`) or inclusive range (`[min, max]`); variadic => `[n, Infinity]`. */
  arity?: number | [min: number, max: number];
  /** Return type hint for nesting/validation, e.g. `'number'`. */
  returnType?: string;
  /** Optional per-argument type hints. */
  argTypes?: (string | undefined)[];
  /** SQL serializer; receives serialized arg strings, returns a SQL fragment. */
  sql?: (...args: string[]) => string;
  /** Parameterized-SQL serializer; receives serialized arg strings (placeholders/fields). */
  parameterized?: (...args: string[]) => string;
  /** JSONLogic serializer: an operator name, or a function receiving serialized args. */
  jsonLogic?: string | ((...args: unknown[]) => unknown);
}

/** Map of registry keys to {@link ExpressionFunction} definitions. */
export type ExpressionFunctionRegistry = Record<string, ExpressionFunction>;

/**
 * Expression operands resolved from a rule's `lhs` property and its `value`/`valueSource`
 * (when `valueSource` is `"expression"`). Returned by {@link getExpressions}.
 */
export interface ResolvedExpressions {
  /** Left-hand side expression, from `rule.lhs`. */
  lhs?: ExpressionNode;
  /** Right-hand side expression, from `rule.value` when `valueSource` is `"expression"`. */
  rhs?: ExpressionNode;
}
