import type { API, FileInfo } from 'jscodeshift';

type TokenType =
  | 'StringLiteral'
  | 'BytesLiteral'
  | 'IntegerLiteral'
  | 'UnsignedIntegerLiteral'
  | 'FloatLiteral'
  | 'BooleanLiteral'
  | 'NullLiteral'
  | 'Identifier'
  | 'Relation'
  | 'ExclamationList'
  | 'HyphenList'
  | 'Negation'
  | 'Negative'
  | 'Unary'
  | 'Member'
  | 'Property'
  | 'FunctionCall'
  | 'ExpressionGroup'
  | 'List'
  | 'Map'
  | 'Addition'
  | 'Subtraction'
  | 'Multiplication'
  | 'Division'
  | 'Modulo'
  | 'ConditionalExpr'
  | 'ConditionalOr'
  | 'ConditionalAnd'
  | 'ExpressionList'
  | 'FieldInits'
  | 'FieldInit'
  | 'MapInits'
  | 'MapInit';

export type CELRelop = '==' | '>=' | '>' | '<=' | '<' | '!=' | 'in';

export interface CELExpression {
  type: TokenType;
}
export interface CELIdentifier extends CELExpression {
  type: 'Identifier';
  value: string;
}
export interface CELStringLiteral extends CELExpression {
  type: 'StringLiteral';
  value: `'${string}'` | `"${string}"` | `'''${string}'''` | `"""${string}"""`;
}
export interface CELBytesLiteral extends CELExpression {
  type: 'BytesLiteral';
  value: string;
}
export interface CELIntegerLiteral extends CELExpression {
  type: 'IntegerLiteral';
  value: string;
}
export interface CELUnsignedIntegerLiteral extends CELExpression {
  type: 'UnsignedIntegerLiteral';
  value: string;
}
export interface CELFloatLiteral extends CELExpression {
  type: 'FloatLiteral';
  value: string;
}
export interface CELBooleanLiteral extends CELExpression {
  type: 'BooleanLiteral';
  value: boolean;
}
export interface CELNullLiteral extends CELExpression {
  type: 'NullLiteral';
  value: null;
}
export interface CELIdentifier extends CELExpression {
  type: 'Identifier';
  value: string;
}
export interface CELRelation extends CELExpression {
  type: 'Relation';
  left: CELExpression;
  operator: CELRelop;
  right: CELExpression;
}
export interface CELConditionalExpr extends CELExpression {
  type: 'ConditionalExpr';
  condition: CELExpression;
  valueIfTrue: CELExpression;
  valueIfFalse: CELExpression;
}
export interface CELExclamationList extends CELExpression {
  type: 'ExclamationList';
  value: ['!', ...'!'[]];
}
export interface CELHyphenList extends CELExpression {
  type: 'HyphenList';
  value: ['-', ...'-'[]];
}
export interface CELNegation extends CELExpression {
  type: 'Negation';
  negations: CELExclamationList;
  value: CELMember;
}
export interface CELNegative extends CELExpression {
  type: 'Negative';
  negations: CELHyphenList;
  value: CELMember;
}
export interface CELMember extends CELExpression {
  type: 'Member';
  value?: CELPrimary;
  left?: CELMember;
  right?: CELIdentifier;
  list?: CELExpression | CELExpressionList | CELFieldInits;
}
export interface CELProperty extends CELExpression {
  type: 'Property';
  value: CELIdentifier;
  args?: CELExpressionList;
  trailingComma?: boolean;
}
export interface CELFunctionCall extends CELExpression {
  type: 'FunctionCall';
  name: CELIdentifier;
  args: CELExpressionList;
  trailingComma?: boolean;
}
export interface CELExpressionGroup extends CELExpression {
  type: 'ExpressionGroup';
  value: CELExpression;
}
export interface CELList extends CELExpression {
  type: 'List';
  value: CELExpressionList;
  trailingComma?: boolean;
}
export interface CELMap extends CELExpression {
  type: 'Map';
  value: CELMapInits;
  trailingComma?: boolean;
}
export interface CELAddition extends CELExpression {
  type: 'Addition';
  left: CELExpression;
  right: CELExpression;
}
export interface CELSubtraction extends CELExpression {
  type: 'Subtraction';
  left: CELExpression;
  right: CELExpression;
}
export interface CELMultiplication extends CELExpression {
  type: 'Multiplication';
  left: CELExpression;
  right: CELExpression;
}
export interface CELDivision extends CELExpression {
  type: 'Division';
  left: CELExpression;
  right: CELExpression;
}
export interface CELModulo extends CELExpression {
  type: 'Modulo';
  left: CELExpression;
  right: CELExpression;
}
export interface CELConditionalOr extends CELExpression {
  type: 'ConditionalOr';
  left: CELExpression;
  right: CELExpression;
}
export interface CELConditionalAnd extends CELExpression {
  type: 'ConditionalAnd';
  left: CELExpression;
  right: CELExpression;
}
export interface CELExpressionList extends CELExpression {
  type: 'ExpressionList';
  value: CELExpression[];
}
export interface CELFieldInits extends CELExpression {
  type: 'FieldInits';
  value: CELFieldInit[];
}
export interface CELFieldInit extends CELExpression {
  type: 'FieldInit';
  left: CELIdentifier;
  right: CELExpression;
}
export interface CELMapInits extends CELExpression {
  type: 'MapInits';
  value: CELMapInit[];
}
export interface CELMapInit extends CELExpression {
  type: 'MapInit';
  left: CELExpression;
  right: CELExpression;
}

export type CELNumericLiteral = CELIntegerLiteral | CELUnsignedIntegerLiteral | CELFloatLiteral;
export type CELLiteral =
  | CELStringLiteral
  | CELBytesLiteral
  | CELNumericLiteral
  | CELBooleanLiteral
  | CELNullLiteral;
export type CELPrimary =
  | CELProperty
  | CELIdentifier
  | CELExpressionGroup
  | CELFunctionCall
  | CELIdentifier;
export type CELMathOperation =
  | CELAddition
  | CELSubtraction
  | CELMultiplication
  | CELDivision
  | CELModulo;
export type CELUnary = CELMember | CELNegation | CELNegative;

export type ParseCELCodeMod = (file: FileInfo, api: API) => string;

export interface ParsedCEL {
  nodeType: 'Main';
  value: CELExpression;
}
