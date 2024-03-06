import type { DefaultCombinatorName, DefaultOperatorName } from '../../types/index.noReact';
import type {
  SpELBaseNode,
  SpELBetweenFields,
  SpELBetweenValues,
  SpELBooleanLiteral,
  SpELCompoundNode,
  SpELExpressionNode,
  SpELIdentifier,
  SpELListNode,
  SpELNodeType,
  SpELNullLiteral,
  SpELNumericLiteral,
  SpELOpAnd,
  SpELOpMatches,
  SpELOpOr,
  SpELPrimitive,
  SpELProcessedExpression,
  SpELPropertyNode,
  SpELRelOpType,
  SpELRelation as SpELRelationOp,
  SpELStringLiteral,
} from './types';

export const isSpELPropertyNode = (expr: SpELBaseNode<SpELNodeType>): expr is SpELPropertyNode => {
  return expr.getType() === 'property' || expr.getType() === 'variable';
};
export const isSpELCompoundNode = (expr: SpELBaseNode<SpELNodeType>): expr is SpELCompoundNode => {
  return expr.getType() === 'compound' && expr.getChildren().every(isSpELPropertyNode);
};
export const isSpELListNode = (expr: SpELBaseNode<SpELNodeType>): expr is SpELListNode => {
  return expr.getType() === 'list';
};

export const isSpELOpAnd = (expr: SpELProcessedExpression): expr is SpELOpAnd =>
  expr.type === 'op-and';
export const isSpELOpOr = (expr: SpELProcessedExpression): expr is SpELOpOr =>
  expr.type === 'op-or';
export const isSpELOpMatches = (expr: SpELProcessedExpression): expr is SpELOpMatches =>
  expr.type === 'matches' &&
  ((isSpELIdentifier(expr.children[0]) && isSpELStringLiteral(expr.children[1])) ||
    (isSpELIdentifier(expr.children[1]) && isSpELStringLiteral(expr.children[0])) ||
    (isSpELIdentifier(expr.children[0]) && isSpELIdentifier(expr.children[1])));
export const isSpELIdentifier = (expr: SpELProcessedExpression): expr is SpELIdentifier =>
  expr.type === 'property' || expr.type === 'variable' || expr.type === 'compound';
export const isSpELStringLiteral = (expr: SpELProcessedExpression): expr is SpELStringLiteral =>
  expr.type === 'string';
export const isSpELNumericLiteral = (expr: SpELProcessedExpression): expr is SpELNumericLiteral =>
  expr.type === 'number';
export const isSpELBooleanLiteral = (expr: SpELProcessedExpression): expr is SpELBooleanLiteral =>
  expr.type === 'boolean';
export const isSpELNullLiteral = (expr: SpELProcessedExpression): expr is SpELNullLiteral =>
  expr.type === 'null';
export const isSpELRelationOp = (expr: SpELProcessedExpression): expr is SpELRelationOp =>
  expr.type === 'op-eq' ||
  expr.type === 'op-ne' ||
  expr.type === 'op-gt' ||
  expr.type === 'op-ge' ||
  expr.type === 'op-lt' ||
  expr.type === 'op-le';
export const isSpELPrimitive = (expr: SpELProcessedExpression): expr is SpELPrimitive =>
  isSpELNumericLiteral(expr) ||
  isSpELStringLiteral(expr) ||
  isSpELBooleanLiteral(expr) ||
  isSpELNullLiteral(expr);
export const isSpELBetweenValues = (expr: SpELProcessedExpression): expr is SpELBetweenValues =>
  expr.type === 'between' &&
  isSpELIdentifier(expr.children[0]) &&
  expr.children[1].type === 'list' &&
  expr.children[1].children.length >= 2 &&
  expr.children[1].children.every(isSpELPrimitive);
export const isSpELBetweenFields = (expr: SpELProcessedExpression): expr is SpELBetweenFields =>
  expr.type === 'between' &&
  isSpELIdentifier(expr.children[0]) &&
  expr.children[1].type === 'list' &&
  expr.children[1].children.length >= 2 &&
  expr.children[1].children.every(isSpELIdentifier);

export const processCompiledExpression = (
  ce: SpELPropertyNode | SpELExpressionNode
): SpELProcessedExpression => {
  const type = ce.getType();
  const identifier = isSpELCompoundNode(ce)
    ? ce
        .getChildren()
        .map(p => (isSpELPropertyNode(p) ? p.getRaw() : /* istanbul ignore next */ ''))
        .join('.')
    : isSpELPropertyNode(ce)
      ? ce.getRaw()
      : null;
  const children =
    type === 'compound'
      ? []
      : (isSpELListNode(ce) ? ce.getRaw : ce.getChildren)().map(processCompiledExpression);
  const startPosition = ce.getStartPosition();
  const endPosition = ce.getEndPosition();
  const value = ce.getValue.length === 0 ? ce.getValue() : 'N/A';

  return {
    type: type === 'compound' && !identifier ? 'invalid' : type,
    children,
    startPosition,
    endPosition,
    value,
    identifier,
  };
};

export const normalizeOperator = (opType: SpELRelOpType, flip?: boolean): DefaultOperatorName => {
  if (flip) {
    if (opType === 'op-lt') return '>';
    if (opType === 'op-le') return '>=';
    if (opType === 'op-gt') return '<';
    if (opType === 'op-ge') return '<=';
  }
  return (
    {
      'op-eq': '=',
      'op-ge': '>=',
      'op-gt': '>',
      'op-le': '<=',
      'op-lt': '<',
      'op-ne': '!=',
    } as const
  )[opType];
};

export const generateFlatAndOrList = (
  expr: SpELProcessedExpression
): (DefaultCombinatorName | SpELProcessedExpression)[] => {
  const combinator = expr.type.substring(3) as DefaultCombinatorName;
  const [left, right] = expr.children;
  if (left.type === 'op-and' || left.type === 'op-or') {
    return [...generateFlatAndOrList(left), combinator, right];
  }
  return [left, combinator, right];
};

export const generateMixedAndOrList = (expr: SpELOpAnd | SpELOpOr) => {
  const arr = generateFlatAndOrList(expr);
  const returnArray: (
    | DefaultCombinatorName
    | SpELProcessedExpression
    | ('and' | SpELProcessedExpression)[]
  )[] = [];
  let startIndex = 0;
  for (let i = 0; i < arr.length; i += 2) {
    if (arr[i + 1] === 'and') {
      startIndex = i;
      let j = 1;
      while (arr[startIndex + j] === 'and') {
        i += 2;
        j += 2;
      }
      const tempAndArray = arr.slice(startIndex, i + 1) as ('and' | SpELProcessedExpression)[];
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
