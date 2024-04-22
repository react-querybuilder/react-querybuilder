import type { DefaultCombinatorName, DefaultOperatorName } from '../../types/index.noReact';
import type {
  CELBooleanLiteral,
  CELBytesLiteral,
  CELConditionalAnd,
  CELConditionalOr,
  CELExpression,
  CELExpressionGroup,
  CELIdentifier,
  CELLikeExpression,
  CELList,
  CELLiteral,
  CELMap,
  CELMember,
  CELMemberIdentifierChain,
  CELMemberNegatedIdentifier,
  CELMemberNegatedIdentifierChain,
  CELNegatedLikeExpression,
  CELNegation,
  CELNullLiteral,
  CELNumericLiteral,
  CELRelation,
  CELRelop,
  CELStringLiteral,
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
  expr.type === 'BooleanLiteral' ||
  expr.type === 'NullLiteral' ||
  expr.type === 'BytesLiteral';
export const isCELNumericLiteral = (expr: CELExpression): expr is CELNumericLiteral =>
  expr.type === 'FloatLiteral' ||
  expr.type === 'IntegerLiteral' ||
  expr.type === 'UnsignedIntegerLiteral';
export const isCELRelation = (expr: CELExpression): expr is CELRelation => expr.type === 'Relation';
export const isCELList = (expr: CELExpression): expr is CELList => expr.type === 'List';
export const isCELMap = (expr: CELExpression): expr is CELMap => expr.type === 'Map';
export const isCELIdentifier = (expr: CELExpression): expr is CELIdentifier =>
  expr.type === 'Identifier';
export const isCELNegation = (expr: CELExpression): expr is CELNegation => expr.type === 'Negation';
export const isCELMember = (expr: CELExpression): expr is CELMember => expr.type === 'Member';

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

export const getIdentifierFromChain = (expr: CELIdentifier | CELMemberIdentifierChain): string => {
  if (isCELIdentifier(expr)) {
    return expr.value;
  }

  return `${getIdentifierFromChain(expr.left)}.${expr.right.value}`;
};

export const getIdentifierFromNegatedChain = (
  expr: CELMemberNegatedIdentifier | CELMemberNegatedIdentifierChain
): string => {
  if (isCELNegatedIdentifier(expr)) {
    return `${``.padStart(expr.negations, `!`)}${expr.value.value}`;
  }

  return `${getIdentifierFromNegatedChain(expr.left)}.${expr.right.value}`;
};

function evalCELLiteralValue(literal: CELStringLiteral): string;
function evalCELLiteralValue(literal: CELBooleanLiteral): boolean;
function evalCELLiteralValue(literal: CELNumericLiteral): number | null;
function evalCELLiteralValue(literal: CELBytesLiteral): null;
function evalCELLiteralValue(literal: CELNullLiteral): null;
function evalCELLiteralValue(literal: CELLiteral): string | boolean | number | null;
function evalCELLiteralValue(literal: CELLiteral) {
  if (literal.type === 'StringLiteral') {
    return literal.value.replace(/^((?:'''|"""|'|")?)([\s\S]*?)\1$/gm, '$2');
  } else if (literal.type === 'BooleanLiteral') {
    return literal.value;
  } else if (literal.type === 'NullLiteral' || literal.type === 'BytesLiteral') {
    return null;
  }
  return literal.value;
}

export const normalizeCombinator = (c: '&&' | '||'): DefaultCombinatorName =>
  c === '||' ? 'or' : 'and';

export const normalizeOperator = (op: CELRelop, flip?: boolean): DefaultOperatorName => {
  if (flip) {
    if (op === '<') return '>';
    if (op === '<=') return '>=';
    if (op === '>') return '<';
    if (op === '>=') return '<=';
  }
  if (op === '==') return '=';
  return op;
};

export const generateFlatAndOrList = (
  expr: CELConditionalAnd | CELConditionalOr
): (DefaultCombinatorName | CELExpression)[] => {
  const combinator = normalizeCombinator(expr.type === 'ConditionalAnd' ? '&&' : '||');
  const { left, right } = expr;
  if (isCELConditionalAnd(left) || isCELConditionalOr(left)) {
    return [...generateFlatAndOrList(left), combinator, right];
  }
  return [left, combinator, right];
};

export const generateMixedAndOrList = (expr: CELConditionalAnd | CELConditionalOr) => {
  const arr = generateFlatAndOrList(expr);
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

export { evalCELLiteralValue };
