/**
 * A single node in an expression tree. Expressions are recursive: a `func` node's
 * arguments are themselves `ExpressionNode`s, enabling arbitrary nesting.
 */
export type ExpressionNode =
  | { kind: 'field'; field: string }
  | { kind: 'value'; value: unknown; valueType?: string }
  | { kind: 'func'; fn: string; args: ExpressionNode[] };

/**
 * Definition of a function usable in an expression. Arithmetic operators (`+ - * /`)
 * are modeled as ordinary functions. Each per-format serializer receives the
 * already-serialized argument strings/values.
 */
export interface ExpressionFunction {
  /** Registry key, e.g. `'multiply'`. Optional since the registry key identifies it. */
  name?: string;
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

/** The expression payload stored under `rule.meta.expressions`. */
export interface RuleExpressions {
  version: 1;
  /** When present, the rule's left-hand side is this expression (field is a sentinel mirror). */
  lhs?: ExpressionNode;
  /** When present, the rule's right-hand side is this expression (value is a mirror). */
  rhs?: ExpressionNode;
}

/** Shape this package owns within `rule.meta`. */
export interface RuleExpressionMeta {
  expressions?: RuleExpressions;
}
