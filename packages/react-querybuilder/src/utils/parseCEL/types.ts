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
  | 'Unary'
  | 'Member'
  | 'Primary'
  | 'Addition'
  | 'Subtraction'
  | 'Multiplication'
  | 'Division'
  | 'Modulo'
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
}
export interface CELStringLiteral extends CELExpression {
  type: 'StringLiteral';
}
export interface CELBytesLiteral extends CELExpression {
  type: 'BytesLiteral';
}
export interface CELIntegerLiteral extends CELExpression {
  type: 'IntegerLiteral';
}
export interface CELUnsignedIntegerLiteral extends CELExpression {
  type: 'UnsignedIntegerLiteral';
}
export interface CELFloatLiteral extends CELExpression {
  type: 'FloatLiteral';
}
export interface CELBooleanLiteral extends CELExpression {
  type: 'BooleanLiteral';
}
export interface CELNullLiteral extends CELExpression {
  type: 'NullLiteral';
}
export interface CELIdentifier extends CELExpression {
  type: 'Identifier';
}
export interface CELRelation extends CELExpression {
  type: 'Relation';
  left: CELMember;
  operator: CELRelop;
  right: CELMember;
}
export interface CELExclamationList extends CELExpression {
  type: 'ExclamationList';
}
export interface CELHyphenList extends CELExpression {
  type: 'HyphenList';
}
export interface CELUnary extends CELExpression {
  type: 'Unary';
}
export interface CELMember extends CELExpression {
  type: 'Member';
  value?: CELPrimary;
  left?: CELMember;
  right?: CELIdentifier;
  list?: CELExpression | CELExpressionList | CELFieldInits;
}
export interface CELPrimary extends CELExpression {
  type: 'Primary';
}
export interface CELAddition extends CELExpression {
  type: 'Addition';
}
export interface CELSubtraction extends CELExpression {
  type: 'Subtraction';
}
export interface CELMultiplication extends CELExpression {
  type: 'Multiplication';
}
export interface CELDivision extends CELExpression {
  type: 'Division';
}
export interface CELModulo extends CELExpression {
  type: 'Modulo';
}
export interface CELConditionalOr extends CELExpression {
  type: 'ConditionalOr';
}
export interface CELConditionalAnd extends CELExpression {
  type: 'ConditionalAnd';
}
export interface CELExpressionList extends CELExpression {
  type: 'ExpressionList';
}
export interface CELFieldInits extends CELExpression {
  type: 'FieldInits';
}
export interface CELFieldInit extends CELExpression {
  type: 'FieldInit';
}
export interface CELMapInits extends CELExpression {
  type: 'MapInits';
}
export interface CELMapInit extends CELExpression {
  type: 'MapInit';
}

export type ParseCELCodeMod = (file: FileInfo, api: API) => string;

export interface ParsedCEL {
  nodeType: 'Main';
  value: CELExpression;
}
