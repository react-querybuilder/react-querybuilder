import { AnyCase } from '../../types';

type TokenType =
  | 'AndExpression'
  | 'BetweenPredicate'
  | 'BitExpression'
  | 'Boolean'
  | 'BooleanExtra'
  | 'CaseWhen'
  | 'ComparisonBooleanPrimary'
  | 'ComparisonSubQueryBooleanPrimary'
  | 'ExpressionList'
  | 'ForceIndexHint'
  | 'ForOptIndexHint'
  | 'FunctionCall'
  | 'FunctionCallParam'
  | 'GroupBy'
  | 'GroupByOrderByItem'
  | 'Identifier'
  | 'IdentifierExpr'
  | 'IdentifierList'
  | 'IgnoreIndexHint'
  | 'IndexHintList'
  | 'InExpressionListPredicate'
  | 'InnerCrossJoinTable'
  | 'InSubQueryPredicate'
  | 'IsExpression'
  | 'IsNullBooleanPrimary'
  | 'LeftRightJoinTable'
  | 'LikePredicate'
  | 'Limit'
  | 'Main'
  | 'NaturalJoinTable'
  | 'NotExpression'
  | 'Null'
  | 'Number'
  | 'OnJoinCondition'
  | 'OrderBy'
  | 'OrExpression'
  | 'Partitions'
  | 'PlaceHolder'
  | 'Prefix'
  | 'RegexpPredicate'
  | 'Select'
  | 'SelectExpr'
  | 'SelectParenthesized'
  | 'SimpleExprParentheses'
  | 'SoundsLikePredicate'
  | 'StraightJoinTable'
  | 'String'
  | 'SubQuery'
  | 'TableFactor'
  | 'TableReference'
  | 'TableReferences'
  | 'Union'
  | 'UseIndexHint'
  | 'UsingJoinCondition'
  | 'WhenThenList'
  | 'XORExpression';

export type ComparisonOperator = '=' | '>=' | '>' | '<=' | '<' | '<>' | '!=';
export type NotOpt = AnyCase<'NOT'> | null;
export type AndOperator = AnyCase<'AND'> | '&&';
export type OrOperator = AnyCase<'OR'> | '||';

export interface SQLWhereObject {
  type: TokenType;
}
export interface SQLIdentifier extends SQLWhereObject {
  type: 'Identifier';
  value: string;
}
export interface SQLWhereObjectAny extends SQLWhereObject {
  [k: string]: any;
}
export interface SQLStringValue extends SQLWhereObject {
  type: 'String';
  value: `'${string}'` | `"${string}"`;
}
export interface SQLNumberValue extends SQLWhereObject {
  type: 'Number';
  value: string;
}
export interface SQLBooleanValue extends SQLWhereObject {
  type: 'Boolean';
  value: AnyCase<'TRUE'> | AnyCase<'FALSE'>;
}
export interface SQLBooleanExtra extends SQLWhereObject {
  type: 'BooleanExtra';
  value: AnyCase<'UNKNOWN'>;
}
export interface SQLSimpleExprParentheses extends SQLWhereObject {
  type: 'SimpleExprParentheses';
  value: SQLExpressionList;
}
export interface SQLExpressionList extends SQLWhereObject {
  type: 'ExpressionList';
  value: SQLExpression[];
}
export interface SQLInExpressionListPredicate extends SQLWhereObject {
  type: 'InExpressionListPredicate';
  hasNot: NotOpt;
  left: SQLSimpleExpression;
  right: SQLExpressionList;
}
export interface SQLBetweenPredicate extends SQLWhereObject {
  type: 'BetweenPredicate';
  hasNot: NotOpt;
  left: SQLSimpleExpression;
  right: { left: SQLSimpleExpression; right: SQLPredicate };
}
export interface SQLLikePredicate extends SQLWhereObject {
  type: 'LikePredicate';
  hasNot: NotOpt;
  left: SQLSimpleExpression;
  right: SQLSimpleExpression | SQLOrExpression;
  escape: SQLStringValue | null;
}
export interface SQLIsNullBooleanPrimary extends SQLWhereObject {
  type: 'IsNullBooleanPrimary';
  hasNot: NotOpt;
  value: SQLBooleanPrimary;
}
export interface SQLComparisonBooleanPrimary extends SQLWhereObject {
  type: 'ComparisonBooleanPrimary';
  left: SQLBooleanPrimary;
  operator: ComparisonOperator;
  right: SQLPredicate;
}
export interface SQLIsExpression extends SQLWhereObject {
  type: 'IsExpression';
  hasNot: NotOpt;
  left: SQLBooleanPrimary;
  right: SQLBooleanExtra;
}
export interface SQLNotExpression extends SQLWhereObject {
  type: 'NotExpression';
  value: SQLExpression;
}
export interface SQLAndExpression extends SQLWhereObject {
  type: 'AndExpression';
  operator: AndOperator;
  left: SQLExpression;
  right: SQLExpression;
}
export interface SQLOrExpression extends SQLWhereObject {
  type: 'OrExpression';
  operator: OrOperator;
  left: SQLExpression;
  right: SQLExpression;
}

// Interfaces that might show up but will be ignored
export interface SQLXORExpression extends SQLWhereObjectAny {
  type: 'XORExpression';
}
export interface SQLFunctionCall extends SQLWhereObjectAny {
  type: 'FunctionCall';
}
export interface SQLCaseWhen extends SQLWhereObjectAny {
  type: 'CaseWhen';
}
export interface SQLPrefix extends SQLWhereObjectAny {
  type: 'Prefix';
}
export interface SQLSubQuery extends SQLWhereObjectAny {
  type: 'SubQuery';
}
export interface SQLIdentifierExpr extends SQLWhereObjectAny {
  type: 'IdentifierExpr';
}
export interface SQLBitExpression extends SQLWhereObjectAny {
  type: 'BitExpression';
}
export interface SQLInSubQueryPredicate extends SQLWhereObjectAny {
  type: 'InSubQueryPredicate';
}
export interface SQLSoundsLikePredicate extends SQLWhereObjectAny {
  type: 'SoundsLikePredicate';
}
export interface SQLRegexpPredicate extends SQLWhereObjectAny {
  type: 'RegexpPredicate';
}
export interface SQLComparisonSubQueryBooleanPrimary extends SQLWhereObjectAny {
  type: 'ComparisonSubQueryBooleanPrimary';
}

// Types we'll actually use
export type SQLLiteralValue = SQLStringValue | SQLNumberValue | SQLBooleanValue;
export type SQLSimpleExpression =
  | SQLLiteralValue
  | SQLIdentifier
  | SQLFunctionCall
  | SQLCaseWhen
  | SQLPrefix
  | SQLSubQuery
  | SQLIdentifierExpr
  | SQLBitExpression
  | SQLSimpleExprParentheses;
export type SQLPredicate =
  | SQLSimpleExpression
  | SQLInExpressionListPredicate
  | SQLBetweenPredicate
  | SQLLikePredicate
  | SQLInSubQueryPredicate
  | SQLSoundsLikePredicate
  | SQLRegexpPredicate;
export type SQLBooleanPrimary =
  | SQLPredicate
  | SQLIsNullBooleanPrimary
  | SQLComparisonBooleanPrimary
  | SQLComparisonSubQueryBooleanPrimary;
export type SQLExpression =
  | SQLBooleanPrimary
  | SQLIsExpression
  | SQLNotExpression
  | SQLAndExpression
  | SQLOrExpression
  | SQLXORExpression;

export interface ParsedSQL {
  nodeType: 'Main';
  value: {
    type: 'Select';
    distinctOpt: string | null;
    highPriorityOpt: any;
    maxStateMentTimeOpt: any;
    straightJoinOpt: any;
    sqlSmallResultOpt: any;
    sqlBigResultOpt: any;
    sqlBufferResultOpt: any;
    sqlCacheOpt: any;
    sqlCalcFoundRowsOpt: any;
    selectItems: SQLWhereObjectAny;
    from: SQLWhereObjectAny;
    partition: any;
    where: SQLExpression;
    groupBy: SQLWhereObjectAny | null;
    having: SQLWhereObjectAny | null;
    orderBy: SQLWhereObjectAny | null;
    limit: SQLWhereObjectAny | null;
    procedure: SQLWhereObjectAny | null;
    updateLockMode: any;
  };
  hasSemicolon: boolean;
}
