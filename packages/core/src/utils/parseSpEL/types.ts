export type SpELNodeType =
  | 'invalid' // custom type for invalid or unusable SpEL expressions
  | SpELOperationType
  | SpELPrimitiveType
  | SpELRelOp
  | SpELIdentifierType
  | 'assign'
  | 'beanref'
  | 'constructorref'
  | 'elvis'
  | 'function'
  | 'identifier'
  | 'indexer'
  | 'list'
  | 'map'
  | 'method'
  | 'between'
  | 'instanceof'
  | 'matches'
  | 'projection'
  | 'qualifiedidentifier'
  | 'selection'
  | 'ternary'
  | 'typeref';

type SpELOperationType =
  | 'op-and'
  | 'op-dec'
  | 'op-divide'
  | 'op-eq'
  | 'op-ge'
  | 'op-gt'
  | 'op-inc'
  | 'op-le'
  | 'op-lt'
  | 'op-minus'
  | 'op-modulus'
  | 'op-multiply'
  | 'op-ne'
  | 'op-not'
  | 'op-or'
  | 'op-plus'
  | 'op-power';

export type SpELPrimitiveType = 'number' | 'string' | 'boolean' | 'null';

export type SpELRelOp = '==' | '>=' | '>' | '<=' | '<' | '!=' | 'in';

export type SpELRelOpType = 'op-eq' | 'op-ge' | 'op-gt' | 'op-le' | 'op-lt' | 'op-ne';

export type SpELIdentifierType = 'property' | 'compound' | 'variable';

// The "*Node" types are for the parsed-but-not-processed SpEL expressions
export interface SpELBaseNode<T extends SpELNodeType> {
  _type: T;
  getType: () => T;
  getChildren: () => SpELBaseNode<T>[];
  getStartPosition: () => number;
  getEndPosition: () => number;
  getValue: () => boolean | number | string | null;
  toString: () => string;
  // Unused methods
  // setType: () => any;
  // addChild: () => any;
  // getParent: () => any;
  // setParent: () => any;
  // getContext: () => any;
  // setContext: () => any;
  // setValue: () => any;
}
export interface SpELPropertyNode extends SpELBaseNode<SpELIdentifierType> {
  getRaw: () => string;
  getName: () => string;
}
export interface SpELListNode extends SpELBaseNode<'list'> {
  getRaw: () => SpELPropertyNode[];
}
export interface SpELCompoundNode extends SpELBaseNode<SpELIdentifierType> {
  getChildren: () => SpELPropertyNode[];
}
/**
 * A SpEL method/function invocation node. Note that arguments are _not_ children — they are
 * exposed as raw (unprocessed) nodes through `getRaw()`.
 */
export interface SpELMethodNode extends SpELBaseNode<'method'> {
  getRaw: () => { methodName: string; args: SpELExpressionNode[] };
}
/** The dotted segments of a `T(...)` type reference, e.g. `["java", "lang", "Math"]`. */
export interface SpELQualifiedIdentifierNode extends SpELBaseNode<'qualifiedidentifier'> {
  getRaw: () => string[];
}
export interface SpELExpressionNode extends SpELBaseNode<SpELNodeType> {
  getChildren: () => SpELExpressionNode[];
}

export interface SpELProcessedExpression {
  type: SpELNodeType;
  children: SpELProcessedExpression[];
  value: number | string | boolean | null;
  startPosition: number;
  endPosition: number;
  identifier: string | null;
  /** Method/function name, present when `type` is `"method"`. */
  methodName?: string;
  /**
   * The receiver of an instance method call (e.g. `name` in `name.toUpperCase()`), or `null` for
   * static (`T(...)`) and bare function calls.
   */
  target?: SpELProcessedExpression | null;
  /** Dotted type name of a `T(...)` static call target, e.g. `"java.lang.Math"`. */
  typeRef?: string | null;
}
/**
 * A method/function invocation. Arguments are stored as `children`; instance-call receivers are
 * stored as {@link SpELProcessedExpression.target}, and static-call types as
 * {@link SpELProcessedExpression.typeRef}.
 */
export interface SpELMethodCall extends SpELProcessedExpression {
  type: 'method';
  methodName: string;
}
export interface SpELOpAnd extends SpELProcessedExpression {
  type: 'op-and';
}
export interface SpELOpOr extends SpELProcessedExpression {
  type: 'op-or';
}
export interface SpELOpMatches extends SpELProcessedExpression {
  type: 'matches';
  children:
    | [SpELIdentifier, SpELStringLiteral]
    | [SpELStringLiteral, SpELIdentifier]
    | [SpELIdentifier, SpELIdentifier];
}
export interface SpELIdentifier extends SpELProcessedExpression {
  type: 'compound' | 'property' | 'variable';
  identifier: string;
}
export interface SpELRelation extends SpELProcessedExpression {
  type: SpELRelOpType;
}
export interface SpELBetweenValues extends SpELProcessedExpression {
  type: 'between';
  children: [SpELIdentifier, SpELListOfValues];
}
export interface SpELBetweenFields extends SpELProcessedExpression {
  type: 'between';
  children: [SpELIdentifier, SpELListOfFields];
}
export interface SpELListOfValues extends SpELProcessedExpression {
  type: 'list';
  children: [SpELPrimitive, SpELPrimitive, ...SpELPrimitive[]];
}
export interface SpELListOfFields extends SpELProcessedExpression {
  type: 'list';
  children: [SpELIdentifier, SpELIdentifier, ...SpELIdentifier[]];
}
export type SpELPrimitive =
  | SpELBooleanLiteral
  | SpELNumericLiteral
  | SpELStringLiteral
  | SpELNullLiteral;
export interface SpELStringLiteral extends SpELProcessedExpression {
  type: 'string';
  value: string;
}
export interface SpELNumericLiteral extends SpELProcessedExpression {
  type: 'number';
  value: number;
}
export interface SpELBooleanLiteral extends SpELProcessedExpression {
  type: 'boolean';
  value: boolean;
}
export interface SpELNullLiteral extends SpELProcessedExpression {
  type: 'null';
  value: null;
}

/**
 * A SpEL operand subtree that {@link parseSpEL!ParseSpELOptions.getExpression} may receive — either
 * an arithmetic infix node (`op-plus`/`op-minus`/`op-multiply`/`op-divide`/`op-modulus`) or a
 * method/function invocation ({@link SpELMethodCall}), which covers `T(java.lang.Math).abs/min/max(...)`,
 * `.toUpperCase()`/`.toLowerCase()`, and custom calls like `myFunc(a, b)`.
 */
export type SpELExpressionOperand = SpELProcessedExpression;

/** Context passed to {@link parseSpEL!ParseSpELOptions.getExpression}. */
export interface ParseSpELExpressionContext {
  /** Returns `true` if the field is configured (or if no `fields` were supplied). */
  fieldExists: (fieldName: string) => boolean;
}
