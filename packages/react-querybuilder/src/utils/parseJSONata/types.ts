import type { OverrideProperties } from 'type-fest';

// Functionally equivalent to jsonata.ExprNode except `lhs` property is not an array
export interface JSONataExprNode {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  position?: number;
  arguments?: JSONataExprNode[];
  name?: string;
  procedure?: JSONataExprNode;
  steps?: JSONataExprNode[];
  expressions?: JSONataExprNode[];
  stages?: JSONataExprNode[];
  lhs?: JSONataExprNode;
  rhs?: JSONataExprNode;
}

// Identifiers
export interface JSONataPath extends JSONataExprNode {
  type: 'path';
  steps: [JSONataExprNode, ...JSONataExprNode[]];
}
export interface JSONataName extends JSONataExprNode {
  type: 'name';
  value: string;
}
export interface JSONataIdentifier extends JSONataPath {
  steps: [JSONataName, ...JSONataName[]];
}

// Groups
export interface JSONataBlock extends JSONataExprNode {
  type: 'block';
  expressions: [JSONataExprNode];
}

// Values
export interface JSONataString extends JSONataExprNode {
  type: 'string';
  value: string;
}
export interface JSONataNumber extends JSONataExprNode {
  type: 'number';
  value: number;
}
export interface JSONataBoolean extends JSONataExprNode {
  type: 'value';
  value: boolean;
}
export interface JSONataNull extends JSONataExprNode {
  type: 'value';
  value: null;
}
export interface JSONataRegex extends JSONataExprNode {
  type: 'regex';
  value: RegExp;
}

export interface JSONataBinaryNode extends JSONataExprNode {
  type: 'binary';
  lhs: JSONataExprNode;
  rhs: JSONataExprNode;
}

// Combinators
export interface JSONataAnd extends JSONataBinaryNode {
  value: 'and';
}
export interface JSONataOr extends JSONataBinaryNode {
  value: 'or';
}

// Comparison operators
export interface JSONataEqual extends JSONataBinaryNode {
  value: '=';
}
export interface JSONataNotEqual extends JSONataBinaryNode {
  value: '!=';
}
export interface JSONataGreaterThan extends JSONataBinaryNode {
  value: '>';
}
export interface JSONataGreaterThanOrEqual extends JSONataBinaryNode {
  value: '>=';
}
export interface JSONataLessThan extends JSONataBinaryNode {
  value: '<';
}
export interface JSONataLessThanOrEqual extends JSONataBinaryNode {
  value: '<=';
}

export interface JSONataIn extends JSONataBinaryNode {
  value: 'in';
  lhs: JSONataPath;
  rhs: JSONataList;
}

export interface JSONataNot extends JSONataExprNode {
  type: 'function';
  value: '(';
  arguments: [JSONataExprNode];
  procedure: OverrideProperties<JSONataExprNode, { value: 'not'; type: 'variable' }>;
}

export interface JSONataContains extends JSONataExprNode {
  type: 'function';
  value: '(';
  arguments: [JSONataPath, JSONataString | JSONataRegex];
  procedure: OverrideProperties<JSONataExprNode, { value: 'contains'; type: 'variable' }>;
}

export interface JSONataToMillis extends JSONataExprNode {
  type: 'function';
  value: '(';
  arguments: [JSONataString, ...JSONataString[]];
  procedure: OverrideProperties<JSONataExprNode, { value: 'toMillis'; type: 'variable' }>;
}

export interface JSONataList extends JSONataExprNode {
  type: 'unary';
  value: '[';
  expressions: JSONataExprNode[];
}
