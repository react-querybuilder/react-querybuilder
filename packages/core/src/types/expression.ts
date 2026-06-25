/**
 * A single node in an expression tree. Expressions are recursive: a `func` node's
 * arguments are themselves {@link ExpressionNode}s, enabling arbitrary nesting.
 *
 * Used by `@react-querybuilder/expr` for arithmetic/function expressions on a rule's
 * left- and right-hand sides. The core library preserves these nodes (on
 * {@link RuleType.lhs} and, for the right-hand side, in `value` when `valueSource` is
 * `"expression"`) but does not interpret them.
 */
export type ExpressionNode =
  | { kind: 'field'; field: string }
  | { kind: 'value'; value: unknown; valueType?: string }
  | { kind: 'func'; fn: string; args: ExpressionNode[] };
