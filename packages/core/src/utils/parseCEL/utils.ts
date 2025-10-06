import type { DefaultCombinatorName, DefaultOperatorName } from '../../types';
import type {
  CELAddition,
  CELBooleanLiteral,
  CELBytesLiteral,
  CELConditionalAnd,
  CELConditionalExpr,
  CELConditionalOr,
  CELDivision,
  CELDynamicPropertyAccessor,
  CELExpression,
  CELExpressionGroup,
  CELExpressionList,
  CELFieldInit,
  CELFieldInits,
  CELFieldsObject,
  CELFloatLiteral,
  CELFunctionCall,
  CELIdentifier,
  CELIntegerLiteral,
  CELLikeExpression,
  CELList,
  CELLiteral,
  CELMap,
  CELMapInit,
  CELMapInits,
  CELMember,
  CELMemberIdentifierChain,
  CELMemberNegatedIdentifier,
  CELMemberNegatedIdentifierChain,
  CELModulo,
  CELMultiplication,
  CELNegatedLikeExpression,
  CELNegation,
  CELNegative,
  CELNullLiteral,
  CELNumericLiteral,
  CELProperty,
  CELRelation,
  CELRelop,
  CELStringLiteral,
  CELSubtraction,
  CELUnsignedIntegerLiteral,
} from './types';

export const isCELExpressionGroup = (expr: CELExpression): expr is CELExpressionGroup =>
  expr.type === 'ExpressionGroup';
export const isCELConditionalAnd = (expr: CELExpression): expr is CELConditionalAnd =>
  expr.type === 'ConditionalAnd';
export const isCELConditionalOr = (expr: CELExpression): expr is CELConditionalOr =>
  expr.type === 'ConditionalOr';
export const isCELStringLiteral = (expr: CELExpression): expr is CELStringLiteral =>
  expr.type === 'StringLiteral';
export const isCELLiteral = (expr: CELExpression): expr is CELLiteral =>
  isCELNumericLiteral(expr) ||
  isCELStringLiteral(expr) ||
  isCELBooleanLiteral(expr) ||
  isCELNullLiteral(expr) ||
  isCELBytesLiteral(expr);
export const isCELNumericLiteral = (expr: CELExpression): expr is CELNumericLiteral =>
  isCELFloatLiteral(expr) || isCELIntegerLiteral(expr) || isCELUnsignedIntegerLiteral(expr);
export const isCELRelation = (expr: CELExpression): expr is CELRelation => expr.type === 'Relation';
export const isCELList = (expr: CELExpression): expr is CELList => expr.type === 'List';
export const isCELMap = (expr: CELExpression): expr is CELMap => expr.type === 'Map';
export const isCELIdentifier = (expr: CELExpression): expr is CELIdentifier =>
  expr.type === 'Identifier';
export const isCELNegation = (expr: CELExpression): expr is CELNegation => expr.type === 'Negation';
export const isCELMember = (expr: CELExpression): expr is CELMember => expr.type === 'Member';

export const isCELAddition = (expr: CELExpression): expr is CELAddition => expr.type === 'Addition';
export const isCELBooleanLiteral = (expr: CELExpression): expr is CELBooleanLiteral =>
  expr.type === 'BooleanLiteral';
export const isCELBytesLiteral = (expr: CELExpression): expr is CELBytesLiteral =>
  expr.type === 'BytesLiteral';
export const isCELConditionalExpr = (expr: CELExpression): expr is CELConditionalExpr =>
  expr.type === 'ConditionalExpr';
export const isCELDivision = (expr: CELExpression): expr is CELDivision => expr.type === 'Division';
export const isCELDynamicPropertyAccessor = (
  expr: CELExpression
): expr is CELDynamicPropertyAccessor => expr.type === 'DynamicPropertyAccessor';
export const isCELExpressionList = (expr: CELExpression): expr is CELExpressionList =>
  expr.type === 'ExpressionList';
export const isCELFieldInit = (expr: CELExpression): expr is CELFieldInit =>
  expr.type === 'FieldInit';
export const isCELFieldInits = (expr: CELExpression): expr is CELFieldInits =>
  expr.type === 'FieldInits';
export const isCELFieldsObject = (expr: CELExpression): expr is CELFieldsObject =>
  expr.type === 'FieldsObject';
export const isCELFloatLiteral = (expr: CELExpression): expr is CELFloatLiteral =>
  expr.type === 'FloatLiteral';
export const isCELFunctionCall = (expr: CELExpression): expr is CELFunctionCall =>
  expr.type === 'FunctionCall';
export const isCELIntegerLiteral = (expr: CELExpression): expr is CELIntegerLiteral =>
  expr.type === 'IntegerLiteral';
export const isCELMapInit = (expr: CELExpression): expr is CELMapInit => expr.type === 'MapInit';
export const isCELMapInits = (expr: CELExpression): expr is CELMapInits => expr.type === 'MapInits';
export const isCELModulo = (expr: CELExpression): expr is CELModulo => expr.type === 'Modulo';
export const isCELMultiplication = (expr: CELExpression): expr is CELMultiplication =>
  expr.type === 'Multiplication';
export const isCELNegative = (expr: CELExpression): expr is CELNegative => expr.type === 'Negative';
export const isCELNullLiteral = (expr: CELExpression): expr is CELNullLiteral =>
  expr.type === 'NullLiteral';
export const isCELProperty = (expr: CELExpression): expr is CELProperty => expr.type === 'Property';
export const isCELSubtraction = (expr: CELExpression): expr is CELSubtraction =>
  expr.type === 'Subtraction';
export const isCELUnsignedIntegerLiteral = (
  expr: CELExpression
): expr is CELUnsignedIntegerLiteral => expr.type === 'UnsignedIntegerLiteral';

export const isCELIdentifierOrChain = (
  expr: CELExpression
): expr is CELMemberIdentifierChain | CELIdentifier =>
  isCELIdentifier(expr) ||
  (isCELMember(expr) &&
    !!expr.left &&
    !!expr.right &&
    !expr.list &&
    !expr.value &&
    isCELIdentifierOrChain(expr.left) &&
    isCELIdentifier(expr.right));

export const isCELNegatedIdentifier = (expr: CELExpression): expr is CELMemberNegatedIdentifier =>
  isCELNegation(expr) && isCELIdentifier(expr.value);

export const isCELNegatedIdentifierOrChain = (
  expr: CELExpression
): expr is CELMemberNegatedIdentifierChain | CELMemberNegatedIdentifier =>
  isCELNegatedIdentifier(expr) ||
  (isCELMember(expr) &&
    !!expr.left &&
    !!expr.right &&
    !expr.list &&
    !expr.value &&
    isCELIdentifierOrChain(expr.right) &&
    isCELNegatedIdentifier(expr.left));

export const isCELLikeExpression = (expr: CELExpression): expr is CELLikeExpression =>
  isCELMember(expr) &&
  !!expr.left &&
  !!expr.right &&
  !!expr.list &&
  isCELIdentifierOrChain(expr.left) &&
  isCELIdentifier(expr.right) &&
  (expr.right.value === 'contains' ||
    expr.right.value === 'startsWith' ||
    expr.right.value === 'endsWith') &&
  expr.list.value.length === 1 &&
  (isCELStringLiteral(expr.list.value[0]) || isCELIdentifier(expr.list.value[0]));

export const isCELNegatedLikeExpression = (expr: CELExpression): expr is CELNegatedLikeExpression =>
  isCELMember(expr) &&
  !!expr.left &&
  !!expr.right &&
  !!expr.list &&
  isCELNegatedIdentifierOrChain(expr.left) &&
  isCELIdentifier(expr.right) &&
  (expr.right.value === 'contains' ||
    expr.right.value === 'startsWith' ||
    expr.right.value === 'endsWith') &&
  expr.list.value.length === 1 &&
  (isCELStringLiteral(expr.list.value[0]) || isCELIdentifier(expr.list.value[0]));

export const getCELIdentifierFromChain = (
  expr: CELIdentifier | CELMemberIdentifierChain
): string => {
  if (isCELIdentifier(expr)) {
    return expr.value;
  }

  return `${getCELIdentifierFromChain(expr.left)}.${expr.right.value}`;
};

export const getCELIdentifierFromNegatedChain = (
  expr: CELMemberNegatedIdentifier | CELMemberNegatedIdentifierChain
): string => {
  if (isCELNegatedIdentifier(expr)) {
    return `${``.padStart(expr.negations, `!`)}${expr.value.value}`;
  }

  return `${getCELIdentifierFromNegatedChain(expr.left)}.${expr.right.value}`;
};

export function evalCELLiteralValue(literal: CELStringLiteral): string;
export function evalCELLiteralValue(literal: CELBooleanLiteral): boolean;
export function evalCELLiteralValue(literal: CELNumericLiteral): number | null;
export function evalCELLiteralValue(literal: CELBytesLiteral): null;
export function evalCELLiteralValue(literal: CELNullLiteral): null;
export function evalCELLiteralValue(literal: CELLiteral): string | boolean | number | null;
export function evalCELLiteralValue(literal: CELLiteral) {
  switch (literal.type) {
    case 'StringLiteral': {
      return literal.value.replaceAll(/^((?:'''|"""|'|")?)([\S\s]*?)\1$/gm, '$2');
    }
    case 'BooleanLiteral': {
      return literal.value;
    }
    case 'NullLiteral':
    case 'BytesLiteral': {
      return null;
    }
    default:
      return literal.value;
  }
}

export const celNormalizeCombinator = (c: '&&' | '||'): DefaultCombinatorName =>
  c === '||' ? 'or' : 'and';

export const celNormalizeOperator = (op: CELRelop, flip?: boolean): DefaultOperatorName => {
  if (flip) {
    if (op === '<') return '>';
    if (op === '<=') return '>=';
    if (op === '>') return '<';
    if (op === '>=') return '<=';
  }
  if (op === '==') return '=';
  return op;
};

export const celGenerateFlatAndOrList = (
  expr: CELConditionalAnd | CELConditionalOr
): (DefaultCombinatorName | CELExpression)[] => {
  const combinator = celNormalizeCombinator(expr.type === 'ConditionalAnd' ? '&&' : '||');
  const { left, right } = expr;
  if (isCELConditionalAnd(left) || isCELConditionalOr(left)) {
    return [...celGenerateFlatAndOrList(left), combinator, right];
  }
  return [left, combinator, right];
};

export const celGenerateMixedAndOrList = (
  expr: CELConditionalAnd | CELConditionalOr
): (DefaultCombinatorName | CELExpression | ('and' | CELExpression)[])[] => {
  const arr = celGenerateFlatAndOrList(expr);
  const returnArray: (DefaultCombinatorName | CELExpression | ('and' | CELExpression)[])[] = [];
  let startIndex = 0;
  for (let i = 0; i < arr.length; i += 2) {
    if (arr[i + 1] === 'and') {
      startIndex = i;
      let j = 1;
      while (arr[startIndex + j] === 'and') {
        i += 2;
        j += 2;
      }
      const tempAndArray = arr.slice(startIndex, i + 1) as ('and' | CELExpression)[];
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
          returnArray.push(arr[i], arr[i + 1]);
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
