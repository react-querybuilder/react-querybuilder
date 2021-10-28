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

export interface WhereObject {
  type: TokenType;
  value?: WhereObject | WhereObject[] | string;
  left?: WhereObject;
  right?: WhereObject;
  operator?: string;
  hasNot?: string | null;
}

export interface ParsedSQL {
  nodeType: string;
  value: { where: WhereObject };
}

export function parse(input: string): ParsedSQL;
export const yy: Record<string, unknown>;
export function trace(): void;
export const symbols_: { name: number };
export const terminals_: { [k: number]: string };
export const productions_: any[];
export function performAction(
  yytext: string,
  yyleng: number,
  yylineno: number,
  yy: Record<string, unknown>,
  yystate: number,
  $$: any[],
  _$: Record<string, unknown>
): void;
export const table: any[];
export const defaultActions: Record<string, unknown>;
export function parseError(str: string, hash: Record<string, unknown>): any;
