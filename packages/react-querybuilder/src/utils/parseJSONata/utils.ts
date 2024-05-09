import type { DefaultCombinatorName, DefaultOperatorName } from '../../types';
import type {
  JSONataAnd,
  JSONataBinaryNode,
  JSONataBlock,
  JSONataBoolean,
  JSONataContains,
  JSONataEqual,
  JSONataExprNode,
  JSONataGreaterThan,
  JSONataGreaterThanOrEqual,
  JSONataIdentifier,
  JSONataIn,
  JSONataLessThan,
  JSONataLessThanOrEqual,
  JSONataList,
  JSONataName,
  JSONataNot,
  JSONataNotEqual,
  JSONataNull,
  JSONataNumber,
  JSONataOr,
  JSONataPath,
  JSONataRegex,
  JSONataString,
  JSONataToMillis,
} from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export const isJSONataExprNode = (expr: Any): expr is JSONataExprNode => {
  return expr && typeof expr === 'object' && typeof expr.type === 'string';
};
const isJSONataBinaryNode = (expr: Any): expr is JSONataBinaryNode =>
  isJSONataExprNode(expr) && expr.type === 'binary';

// Identifiers
export const isJSONataPath = (expr: Any): expr is JSONataPath =>
  isJSONataExprNode(expr) &&
  expr.type === 'path' &&
  Array.isArray(expr.steps) &&
  expr.steps.length > 0 &&
  isJSONataExprNode(expr.steps[0]);
export const isJSONataName = (expr: Any): expr is JSONataName =>
  isJSONataExprNode(expr) &&
  expr.type === 'name' &&
  typeof expr.value === 'string' &&
  expr.value.length > 0;
export const isJSONataIdentifier = (expr: Any): expr is JSONataIdentifier =>
  isJSONataPath(expr) && expr.steps.every(isJSONataName);

// Groups
export const isJSONataBlock = (expr: Any): expr is JSONataBlock =>
  isJSONataExprNode(expr) &&
  expr.type === 'block' &&
  Array.isArray(expr.expressions) &&
  expr.expressions.length > 0 &&
  isJSONataExprNode(expr.expressions[0]);

// Values
export const isJSONataString = (expr: Any): expr is JSONataString =>
  isJSONataExprNode(expr) && expr.type === 'string' && typeof expr.value === 'string';
export const isJSONataNumber = (expr: Any): expr is JSONataNumber =>
  isJSONataExprNode(expr) && expr.type === 'number' && typeof expr.value === 'number';
export const isJSONataBoolean = (expr: Any): expr is JSONataBoolean =>
  isJSONataExprNode(expr) && expr.type === 'value' && typeof expr.value === 'boolean';
export const isJSONataNull = (expr: Any): expr is JSONataNull =>
  isJSONataExprNode(expr) && expr.type === 'value' && expr.value === null;
export const isJSONataRegex = (expr: Any): expr is JSONataRegex =>
  isJSONataExprNode(expr) && expr.type === 'regex' && expr.value instanceof RegExp;

// Combinators
export const isJSONataAnd = (expr: Any): expr is JSONataAnd =>
  isJSONataBinaryNode(expr) && expr.value === 'and';
export const isJSONataOr = (expr: Any): expr is JSONataOr =>
  isJSONataBinaryNode(expr) && expr.value === 'or';

// Operators
export const isJSONataEqual = (expr: Any): expr is JSONataEqual =>
  isJSONataBinaryNode(expr) && expr.value === '=';
export const isJSONataNotEqual = (expr: Any): expr is JSONataNotEqual =>
  isJSONataBinaryNode(expr) && expr.value === '!=';
export const isJSONataGreaterThan = (expr: Any): expr is JSONataGreaterThan =>
  isJSONataBinaryNode(expr) && expr.value === '>';
export const isJSONataGreaterThanOrEqual = (expr: Any): expr is JSONataGreaterThanOrEqual =>
  isJSONataBinaryNode(expr) && expr.value === '>=';
export const isJSONataLessThan = (expr: Any): expr is JSONataLessThan =>
  isJSONataBinaryNode(expr) && expr.value === '<';
export const isJSONataLessThanOrEqual = (expr: Any): expr is JSONataLessThanOrEqual =>
  isJSONataBinaryNode(expr) && expr.value === '<=';
export const isJSONataIn = (expr: Any): expr is JSONataIn =>
  isJSONataBinaryNode(expr) &&
  expr.value === 'in' &&
  isJSONataPath(expr.lhs) &&
  isJSONataList(expr.rhs);

// Functions
export const isJSONataNot = (expr: Any): expr is JSONataNot =>
  isJSONataExprNode(expr) &&
  expr.type === 'function' &&
  expr.value === '(' &&
  Array.isArray(expr.arguments) &&
  isJSONataExprNode(expr.arguments[0]) &&
  isJSONataExprNode(expr.procedure) &&
  expr.procedure.value === 'not' &&
  expr.procedure.type === 'variable';
export const isJSONataContains = (expr: Any): expr is JSONataContains =>
  isJSONataExprNode(expr) &&
  expr.type === 'function' &&
  expr.value === '(' &&
  Array.isArray(expr.arguments) &&
  expr.arguments.length >= 2 &&
  isJSONataExprNode(expr.arguments[0]) &&
  isJSONataExprNode(expr.procedure) &&
  expr.procedure.value === 'contains' &&
  expr.procedure.type === 'variable';
export const isJSONataToMillis = (expr: Any): expr is JSONataToMillis =>
  isJSONataExprNode(expr) &&
  expr.type === 'function' &&
  expr.value === '(' &&
  Array.isArray(expr.arguments) &&
  expr.arguments.length > 0 &&
  isJSONataString(expr.arguments[0]) &&
  isJSONataExprNode(expr.procedure) &&
  expr.procedure.value === 'toMillis' &&
  expr.procedure.type === 'variable';

// Miscellaneous
export const isJSONataList = (expr: Any): expr is JSONataList =>
  isJSONataExprNode(expr) &&
  expr.type === 'unary' &&
  expr.value === '[' &&
  Array.isArray(expr.expressions);
export const isJSONataPrimitive = (expr: Any): boolean => {
  return (
    isJSONataString(expr) ||
    isJSONataNumber(expr) ||
    isJSONataBoolean(expr) ||
    isJSONataNull(expr) ||
    isJSONataToMillis(expr)
  );
};
export const isJSONataPrimitiveList = (expr: Any): boolean =>
  isJSONataList(expr) && expr.expressions.every(isJSONataPrimitive);
export const isJSONataIdentifierList = (expr: Any): boolean =>
  isJSONataList(expr) && expr.expressions.every(isJSONataIdentifier);
export const isJSONataValidValue = (expr: Any): boolean =>
  isJSONataPrimitive(expr) ||
  isJSONataRegex(expr) ||
  isJSONataIdentifier(expr) ||
  isJSONataPrimitiveList(expr) ||
  isJSONataIdentifierList(expr) ||
  isJSONataToMillis(expr);
export const isJSONataComparison = (
  expr: Any
): expr is
  | JSONataEqual
  | JSONataNotEqual
  | JSONataGreaterThan
  | JSONataGreaterThanOrEqual
  | JSONataLessThan
  | JSONataLessThanOrEqual =>
  isJSONataEqual(expr) ||
  isJSONataNotEqual(expr) ||
  isJSONataGreaterThan(expr) ||
  isJSONataGreaterThanOrEqual(expr) ||
  isJSONataLessThan(expr) ||
  isJSONataLessThanOrEqual(expr);

export const getValidValue = (expr: Any): Any => {
  if (isJSONataToMillis(expr)) {
    return getValidValue(expr.arguments[0]);
  } else if (isJSONataIdentifier(expr)) {
    return getFieldFromPath(expr);
  } else if (isJSONataPrimitiveList(expr)) {
    return expr.expressions.map(getValidValue);
  } else if (isJSONataIdentifierList(expr)) {
    return expr.expressions.map(getFieldFromPath);
  }
  return expr.value;
};

export const getFieldFromPath = (path: JSONataPath): string =>
  isJSONataIdentifier(path)
    ? path.steps.map(s => s.value).join('.')
    : /* istanbul ignore next */ '';

export const normalizeOperator = (
  opType: DefaultOperatorName,
  flip?: boolean
): DefaultOperatorName => {
  if (flip) {
    if (opType === '<') return '>';
    if (opType === '<=') return '>=';
    if (opType === '>') return '<';
    if (opType === '>=') return '<=';
  }
  return opType;
};

export const negatedLikeOperators = {
  contains: 'doesNotContain',
  beginsWith: 'doesNotBeginWith',
  endsWith: 'doesNotEndWith',
} satisfies Partial<Record<DefaultOperatorName, DefaultOperatorName>>;

export const generateFlatAndOrList = (
  expr: JSONataExprNode
): (DefaultCombinatorName | JSONataExprNode)[] => {
  // istanbul ignore else
  if (isJSONataAnd(expr) || isJSONataOr(expr)) {
    const { lhs, rhs, value: combinator } = expr;
    if (isJSONataAnd(lhs) || isJSONataOr(lhs)) {
      return [...generateFlatAndOrList(lhs), combinator, rhs];
    }
    return [lhs, combinator, rhs];
  }
  // istanbul ignore next
  return [];
};

export const generateMixedAndOrList = (expr: JSONataAnd | JSONataOr) => {
  const arr = generateFlatAndOrList(expr);
  const returnArray: (DefaultCombinatorName | JSONataExprNode | ('and' | JSONataExprNode)[])[] = [];
  let startIndex = 0;
  for (let i = 0; i < arr.length; i += 2) {
    if (arr[i + 1] === 'and') {
      startIndex = i;
      let j = 1;
      while (arr[startIndex + j] === 'and') {
        i += 2;
        j += 2;
      }
      const tempAndArray = arr.slice(startIndex, i + 1) as ('and' | JSONataExprNode)[];
      returnArray.push(tempAndArray);
      i -= 2;
    } else if (arr[i + 1] === 'or') {
      if (i === 0 || i === arr.length - 3) {
        if (i === 0 || arr[i - 1] === 'or') {
          returnArray.push(arr[i]);
        }
        returnArray.push(arr[i + 1]);
        if (i === arr.length - 3) {
          returnArray.push(arr[i + 2]);
        }
      } else {
        if (arr[i - 1] === 'and') {
          returnArray.push(arr[i + 1]);
        } else {
          returnArray.push(arr[i]);
          returnArray.push(arr[i + 1]);
        }
      }
    }
  }
  if (returnArray.length === 1 && Array.isArray(returnArray[0])) {
    // If length is 1, then the only element is an AND array so just return that
    return returnArray[0];
  }
  return returnArray;
};
